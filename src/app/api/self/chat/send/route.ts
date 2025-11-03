import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// ===== Config =====
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
const EMB_MODEL = process.env.OPENAI_EMBED_MODEL ?? "text-embedding-3-small";
const MAX_CTX_CHARS = 1200;
const TOPK_DB = 20;
const TOPK_FINAL = 5;

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
function buildSystemPrompt(tone: "mild" | "spicy") {
  const toneRule =
    tone === "spicy"
      ? "말투는 거칠고 직설적이어야 해. 때로는 '야', '너', '이런 X같은', '너 이자식', '정신좀 차려' 같은 말로 툭 쏘기도 해. 나를 깎아내려서 어떻게든 변화하게 만들어야 해."
      : "말투는 따뜻하고 다정해야 해. 마치 스스로를 토닥이며 얘기하듯 부드럽게 말해. ‘괜찮아’, ‘잘 하고 있어’ 같은 표현도 좋아.";

  return [
    "너는 ‘미래의 나’다. 지금의 나와 마주 앉아 솔직하게 대화하는 중이다.",
    "말은 항상 반말로 해. 친구처럼, 나 자신과 속 얘기하듯이.",
    "답변할 때는 내 기록(컨텍스트)에 근거해서만 이야기하고, 없으면 ‘그건 아직 몰라’라고 솔직하게 말해.",
    "지금의 너는 내 기록(컨텍스트)에 있는 목표를 달성한 상태야. 그래서 나에게 동기부여가 되는 조언을 해줘.",
    "다음 내용을 포함하면 좋아 : (1) 과거의 나에게 해줄 말 (2) 그 말의 근거 (3) 앞으로의 다짐이나 계획",
    "전체 내용은 친구와 대화하듯 자연스럽고 편안하게 작성해.",
    toneRule,
    "가끔은 한숨 섞이거나 웃기게 말해도 돼. 진짜 내 머릿속 목소리처럼 자연스러워야 해.",
  ].join(" ");
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
    summary = s2.rowCount ? s2.rows[0].summary ?? "" : "";
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
      ? `이전 대화 요약:\n${summary.trim()}`
      : "이전 대화 요약: (없음)";

  const messages = [
    { role: "system", content: system },
    { role: "assistant", content: assistantMemory },
    {
      role: "user",
      content: [
        "다음은 나의 과거 기록에서 발췌한 컨텍스트야.",
        "여기에 있는 내용에서만 근거를 인용하고, 없으면 모른다고 답해.",
        "",
        contextText || "(컨텍스트 없음)",
        "",
        "--- 사용자의 질문 ---",
        query,
      ].join("\n"),
    },
  ];

  // 5) OpenAI 호출 (비스트리밍)
  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      temperature: 0.4,
      stream: false,
    }),
  });

  const data = await aiRes.json();
  if (!aiRes.ok) {
    console.error("[chat/send] chat error", data);
    return NextResponse.json(
      { error: "AI 응답 생성 실패", detail: data },
      { status: 502 }
    );
  }

  const reply = data?.choices?.[0]?.message?.content?.trim() ?? "";

  // 6) 결과 저장
  const assistantMsgId = randomUUID();
  await persistAssistantMessage(user_uuid!, assistantMsgId, reply);
  await maybeUpdateUserSummary(user_uuid!);

  // 최종 응답 JSON으로 반환
  return NextResponse.json(
    {
      reply,
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
    },
    { status: 200 }
  );
}

// ===== Storage helpers =====
async function persistAssistantMessage(
  userId: string,
  msgId: string,
  content: string
) {
  await sql`
    INSERT INTO messages (id, user_id, role, content, tokens_in, tokens_out, model, created_at)
    VALUES (${msgId}::uuid, ${userId}::uuid, 'assistant', ${content}, ${0}, ${0}, ${CHAT_MODEL}, ${nowISO()})
    ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
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
