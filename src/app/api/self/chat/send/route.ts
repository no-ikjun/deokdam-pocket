import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";
import { buildSystemPrompt } from "./prompts";

export const dynamic = "force-dynamic";

// ===== Config =====
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
const EMB_MODEL = process.env.OPENAI_EMBED_MODEL ?? "text-embedding-3-small";
const MAX_CTX_CHARS = 1200;
const TOPK_DB = 20;
const TOPK_FINAL = 5;
const DAILY_CHAT_LIMIT = parseInt(process.env.DAILY_CHAT_LIMIT ?? "10", 10);

// ===== utils =====
function makeVectorLiteral(vec: number[]) {
  return `[${vec.map((n) => Number(n).toString()).join(",")}]`;
}
function nowISO() {
  return new Date().toISOString();
}
function scoreRecency(createdAt: string) {
  const ms = Date.now() - new Date(createdAt).getTime();
  const days = ms / 86400000;
  const s = Math.exp(-days / 30);
  return Math.max(0, Math.min(1, s));
}

function formatContextRow(row: any) {
  const createdYM = row.created_at_inferred
    ? row.created_at_inferred
    : row.created_at
      ? new Date(row.created_at).toISOString().slice(0, 7)
      : "unknown";

  const topic = Array.isArray(row.topic) ? row.topic.join("/") : row.topic;

  return [
    `[#작성월:${createdYM} | topic:${topic ?? "-"} | priority:${
      row.priority_score ?? 0
    }]`,
    row.text,
  ].join("\n");
}
function hardTruncateByChars(blocks: string[], maxChars: number) {
  const out: string[] = [];
  let used = 0;
  for (const b of blocks) {
    if (used + b.length > maxChars) break;
    out.push(b);
    used += b.length;
  }
  return out;
}

// ===== Route =====
export async function POST(req: Request) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey)
    return NextResponse.json(
      { error: "OPENAI_API_KEY 미설정" },
      { status: 500 }
    );

  // Auth
  const token = cookies().get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let user_uuid: string | null = null;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    user_uuid = decoded?.sub ?? decoded?.user_uuid ?? null;
  } catch (e) {
    console.error("[chat/send] token verify failed", e);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user_uuid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Input
  const body = await req.json().catch(() => ({}));
  const query: string = (body?.query ?? "").toString().trim();
  const tone: "mild" | "spicy" = body?.tone === "spicy" ? "spicy" : "mild";
  if (!query)
    return NextResponse.json(
      { error: "질문(query)이 필요합니다." },
      { status: 400 }
    );

  // Ensure chat_state row exists & load summary
  const st = await sql`
    INSERT INTO chat_state (user_id, summary)
    VALUES (${user_uuid}::uuid, '')
    ON CONFLICT (user_id) DO NOTHING
    RETURNING summary
  `;
  let summary: string | null = st.rowCount ? st.rows[0].summary : null;
  if (summary == null) {
    const s2 =
      await sql`SELECT summary FROM chat_state WHERE user_id=${user_uuid}::uuid`;
    summary = s2.rowCount ? (s2.rows[0].summary ?? "") : "";
  }

  // Check daily message limit (KST timezone)
  // Skip limit check in development/debug mode
  const isDebugMode = process.env.NODE_ENV === "development";

  if (!isDebugMode) {
    // Calculate today's start time in KST (00:00:00 Asia/Seoul)
    const nowKST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );
    const todayStartKST = new Date(nowKST);
    todayStartKST.setHours(0, 0, 0, 0);
    const todayStartISO = todayStartKST.toISOString();

    const countResult = await sql`
      SELECT COUNT(*)::int as count
      FROM messages
      WHERE user_id = ${user_uuid}::uuid
        AND role = 'user'
        AND created_at >= ${todayStartISO}
    `;
    const todayCount = countResult.rows[0]?.count ?? 0;

    if (todayCount >= DAILY_CHAT_LIMIT) {
      // Calculate next reset time (next day 00:00:00 KST)
      const now = new Date();
      const kstNow = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
      );
      const nextReset = new Date(kstNow);
      nextReset.setDate(nextReset.getDate() + 1);
      nextReset.setHours(0, 0, 0, 0);
      const resetAtISO = nextReset.toISOString();

      return NextResponse.json(
        {
          error: "일일 대화 횟수 제한에 도달했습니다.",
          limit: DAILY_CHAT_LIMIT,
          used: todayCount,
          resetAt: resetAtISO,
        },
        { status: 429 }
      );
    }
  }

  // Save user message (pre-save)
  const userMsgId = randomUUID();
  await sql`
    INSERT INTO messages (id, user_id, role, content, tokens_in, tokens_out, model, created_at)
    VALUES (${userMsgId}::uuid, ${user_uuid}::uuid, 'user', ${query}, ${0}, ${0}, ${CHAT_MODEL}, ${nowISO()})
  `;

  // 1) Embed query
  const embRes = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({ model: EMB_MODEL, input: query }),
  });
  const embJson = await embRes.json();
  if (!embRes.ok) {
    console.error("[chat/send] embedding error", embJson);
    return NextResponse.json(
      { error: "임베딩 생성 실패", detail: embJson },
      { status: 502 }
    );
  }
  const queryVec: number[] = embJson?.data?.[0]?.embedding ?? [];
  const vecLit = makeVectorLiteral(queryVec);

  // 2) k-NN search
  const dbRes = await sql`
    SELECT id, text, source_timebox, topic, emotion, priority_score,
           created_at, created_at_inferred,
           (embedding <-> ${vecLit}::vector) AS distance
    FROM user_chunks
    WHERE user_id = ${user_uuid}::uuid
    ORDER BY embedding <-> ${vecLit}::vector
    LIMIT ${TOPK_DB}
  `;

  // 3) Re-rank
  const rescored = dbRes.rows
    .map((r: any) => {
      const sim = 1 - Number(r.distance);
      const rec = scoreRecency(String(r.created_at));
      const pri = Math.max(0, Math.min(1, Number(r.priority_score) || 0));
      const score = 0.6 * sim + 0.25 * rec + 0.15 * pri;
      return { row: r, score };
    })
    .sort((a, b) => b.score - a.score);

  const top = rescored.slice(0, TOPK_FINAL).map((x) => x.row);
  const contextBlocks = top.map(formatContextRow);
  const contextText = hardTruncateByChars(contextBlocks, MAX_CTX_CHARS).join(
    "\n\n"
  );

  // 4) Prompt
  const system = buildSystemPrompt(tone);
  const assistantMemory =
    summary && summary.trim()
      ? `\n\n## 이전 대화 요약:\n${summary.trim()}`
      : "";

  const messages = [
    { role: "system", content: system + assistantMemory },
    {
      role: "user",
      content: [
        "다음은 나의 과거 기록에서 발췌한 컨텍스트야. 이 내용을 바탕으로 답변해줘.",
        "",
        "## 컨텍스트 사용 규칙:",
        "- 컨텍스트에 있는 내용만 근거로 사용하고, 없으면 추측하지 말고 솔직하게 모른다고 답해",
        "- 여러 컨텍스트가 제공되면, 서로 연관성 있는 것들을 연결하여 더 풍부한 답변을 만들어",
        "- 컨텍스트를 자연스럽게 인용하되, 너무 기계적으로 인용하는 느낌을 주지 마",
        "",
        "=== 과거 기록 컨텍스트 ===",
        contextText || "(컨텍스트 없음 - 일반적인 조언만 제공)",
        "",
        "=== 사용자의 질문 ===",
        query,
      ].join("\n"),
    },
  ];

  // 5) OpenAI 호출 (스트리밍)
  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!aiRes.ok) {
    const errorData = await aiRes.json();
    console.error("[chat/send] chat error", errorData);
    return NextResponse.json(
      { error: "AI 응답 생성 실패", detail: errorData },
      { status: 502 }
    );
  }

  if (!aiRes.body) {
    return NextResponse.json(
      { error: "응답 스트림을 읽을 수 없습니다." },
      { status: 502 }
    );
  }

  // 스트리밍 응답 생성
  const assistantMsgId = randomUUID();
  const reader = aiRes.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";
  let tokensIn = 0;
  let tokensOut = 0;
  let usageReceived = false;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 메타데이터 전송 (초기 정보)
        const metadata =
          JSON.stringify({
            type: "metadata",
            msgId: assistantMsgId,
            context: top.map((r) => ({
              id: r.id,
              topic: r.topic,
              timebox: r.source_timebox,
              priority: r.priority_score,
            })),
            meta: {
              model: CHAT_MODEL,
              tone,
              used_contexts: top.length,
            },
          }) + "\n";
        controller.enqueue(new TextEncoder().encode(metadata));

        // 스트림 데이터 읽기
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // 마지막 불완전한 라인은 버퍼에 유지

          for (const line of lines) {
            if (!line.trim() || !line.startsWith("data: ")) continue;

            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              // 콘텐츠 델타 처리
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                const contentChunk =
                  JSON.stringify({
                    type: "content",
                    delta,
                  }) + "\n";
                controller.enqueue(new TextEncoder().encode(contentChunk));
              }

              // 토큰 사용량 추적 (OpenAI는 마지막 청크에 usage를 포함할 수 있음)
              if (parsed.usage) {
                tokensIn = parsed.usage.prompt_tokens || 0;
                tokensOut = parsed.usage.completion_tokens || 0;
                usageReceived = true;
              }
            } catch (e) {
              // JSON 파싱 오류는 무시
            }
          }
        }

        // 남은 버퍼 처리
        if (buffer.trim()) {
          const data = buffer.trim().replace("data: ", "");
          if (data && data !== "[DONE]") {
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                const contentChunk =
                  JSON.stringify({
                    type: "content",
                    delta,
                  }) + "\n";
                controller.enqueue(new TextEncoder().encode(contentChunk));
              }
              if (parsed.usage) {
                tokensIn = parsed.usage.prompt_tokens || 0;
                tokensOut = parsed.usage.completion_tokens || 0;
                usageReceived = true;
              }
            } catch (e) {
              // 무시
            }
          }
        }

        // 토큰 사용량 추정 (usage가 없을 경우)
        if (!usageReceived) {
          // 대략적인 추정: 한국어는 1토큰 ≈ 2-3자, 영어는 1토큰 ≈ 4자
          // 프롬프트: 쿼리 + 컨텍스트 + 시스템 프롬프트
          const promptLength =
            query.length + contextText.length + system.length;
          tokensIn = Math.ceil(promptLength / 3); // 한국어 기준으로 추정
          tokensOut = Math.ceil(fullContent.trim().length / 3);
        }

        // 완료 신호
        const doneChunk =
          JSON.stringify({
            type: "done",
            tokens: {
              in: tokensIn,
              out: tokensOut,
            },
          }) + "\n";
        controller.enqueue(new TextEncoder().encode(doneChunk));
        controller.close();

        // 스트림 완료 후 메시지 저장
        const trimmedContent = fullContent.trim();
        if (trimmedContent) {
          await persistAssistantMessage(
            user_uuid!,
            assistantMsgId,
            trimmedContent,
            tokensIn,
            tokensOut
          ).catch((err) =>
            console.error("[chat/send] save assistant message error", err)
          );

          // 사용자 메시지의 토큰 사용량도 업데이트 (프롬프트 토큰의 일부)
          // 실제로는 사용자 메시지만의 토큰은 정확히 계산하기 어려우므로,
          // 전체 프롬프트 토큰에서 컨텍스트와 시스템 프롬프트 토큰을 빼는 방식으로 추정
          const userQueryTokens = Math.ceil(query.length / 3);
          await sql`
            UPDATE messages
            SET tokens_in = ${userQueryTokens}
            WHERE id = ${userMsgId}::uuid
          `.catch((err) =>
            console.error("[chat/send] update user message tokens error", err)
          );

          await maybeUpdateUserSummary(user_uuid!).catch((err) =>
            console.error("[chat/send] update summary error", err)
          );
        }
      } catch (error) {
        console.error("[chat/send] stream error", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// ===== Storage helpers =====
async function persistAssistantMessage(
  userId: string,
  msgId: string,
  content: string,
  tokensIn: number = 0,
  tokensOut: number = 0
) {
  await sql`
    INSERT INTO messages (id, user_id, role, content, tokens_in, tokens_out, model, created_at)
    VALUES (${msgId}::uuid, ${userId}::uuid, 'assistant', ${content}, ${tokensIn}, ${tokensOut}, ${CHAT_MODEL}, ${nowISO()})
    ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, tokens_in = EXCLUDED.tokens_in, tokens_out = EXCLUDED.tokens_out
  `;
}

async function maybeUpdateUserSummary(userId: string) {
  const r = await sql`
    SELECT role, content
    FROM messages
    WHERE user_id = ${userId}::uuid
    ORDER BY created_at DESC
    LIMIT 10
  `;
  const transcript = r.rows
    .reverse()
    .map((m: any) => `${m.role}: ${m.content}`)
    .join("\n");

  const openaiKey = process.env.OPENAI_API_KEY!;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: "다음 대화를 5~8줄 한국어 요약으로 정리하라.",
        },
        { role: "user", content: transcript },
      ],
      temperature: 0.2,
      max_tokens: 300,
    }),
  });
  const data = await res.json();
  const summary = (data?.choices?.[0]?.message?.content ?? "").slice(0, 1500);

  await sql`
    INSERT INTO chat_state (user_id, summary, updated_at)
    VALUES (${userId}::uuid, ${summary}, ${nowISO()})
    ON CONFLICT (user_id)
    DO UPDATE SET summary = EXCLUDED.summary, updated_at = EXCLUDED.updated_at
  `;
}
