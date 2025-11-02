import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sql } from "@vercel/postgres";

// ==== 시스템 프롬프트 ====

const PREPROCESS_SYSTEM_PROMPT = `너는 텍스트 전처리 전문가야.
  목표: 사용자가 쓴 긴 답변을 “의미 단위”로 안정적으로 쪼개고, 각 단위에 주제/시간축/감정/우선순위 같은 메타데이터를 붙여 RAG에 저장 가능한 JSON으로 내보낸다.

  핵심 규칙:
  - "완결된 생각" 단위로 분리(한 조각은 독립적으로 읽혀야 함).
  - 길이 가이드: 한 조각 300~700자(한국어), 너무 길면 분리, 너무 짧으면 인접 문장과 결합.
  - 경계 안전장치: 앞뒤 1문장을 20~40자 겹침(overlap_text)에 넣어 경계 손실을 줄인다.
  - 금지: 새 사실 발명, 감정/우선순위 과장. 원문 외 추론은 금지.
  - 날짜/수량 표준화(예: “올해”→ “2025년”), 오탈자·띄어쓰기만 최소 교정.
  - priority_score는 0~1 사이 소수(“반드시/꼭/중요” 등 강조 신호가 있을 때만 0.7 이상).
  - emotion은 { "긍정","중립","불안","후회","결의" } 중 택1. 모호하면 "중립".
  - topic은 상위 카테고리에서 택1~2: { "목표","습관","일/커리어","학업","관계","건강","재정","자기계발","여가","정체성","기타" }.
  - created_at_inferred: 작성 시점이 추론 가능하면 "YYYY-MM-DD" 형식 문자열, 불명확하면 null.

  출력 형식은 STRICT JSON으로만. 주석/설명 금지.`;

const EMBEDDING_MODEL = "text-embedding-3-small";

// ==== 유저 프롬프트 생성기 ====
const makeUserPrompt = (rawText: string) => {
  return `아래 <입력 텍스트>를 위 규칙에 따라 정제·분리·태깅해 JSON만 출력해줘.
    가능하면 조각 수는 3~12개 사이로 맞춰줘.

    <입력 텍스트>
    ${rawText}
    </입력 텍스트>`;
};

function tryParseJSON<T = unknown>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function normalizeChunks(parsed: any, sourceTimebox: any) {
  const EMOTIONS = new Set(["긍정", "중립", "불안", "후회", "결의"]);
  const TOPICS = new Set([
    "목표",
    "습관",
    "일/커리어",
    "학업",
    "관계",
    "건강",
    "재정",
    "자기계발",
    "여가",
    "정체성",
    "기타",
  ]);

  const raw = Array.isArray(parsed?.chunks)
    ? parsed.chunks
    : Array.isArray(parsed?.data)
    ? parsed.data
    : [];

  return raw
    .map((c: any, i: number) => {
      const id = typeof c?.id === "string" ? c.id : randomUUID();
      const text = (c?.text ?? "").toString();
      const overlap_text =
        typeof c?.overlap_text === "string" ? c.overlap_text : null;

      // topic: 문자열 → 배열 치환, 허용 외 값은 "기타"
      let topicArr: string[] = Array.isArray(c?.topic)
        ? c.topic
        : typeof c?.topic === "string"
        ? [c.topic]
        : [];
      topicArr = topicArr.map((t) => (TOPICS.has(t) ? t : "기타")).slice(0, 2);
      if (topicArr.length === 0) topicArr = ["기타"];

      const timebox = c?.timebox ?? c?.source_timebox ?? sourceTimebox ?? null;
      const emotion = EMOTIONS.has(c?.emotion) ? c.emotion : "중립";

      let priority = Number(c?.priority_score);
      if (!Number.isFinite(priority)) priority = 0;
      if (priority < 0) priority = 0;
      if (priority > 1) priority = 1;

      const created_at_inferred =
        typeof c?.created_at_inferred === "string"
          ? c.created_at_inferred
          : null;

      return {
        id,
        text,
        overlap_text,
        topic: topicArr,
        timebox,
        emotion,
        priority_score: priority,
        created_at_inferred,
      };
    })
    .filter((c: any) => c.text && c.text.length > 0);
}

// ---- helpers (파일 상단 어딘가에 추가) ----
function makeVectorLiteral(vec: number[]) {
  // number[] -> '[0.12,-0.03,...]' (pgvector literal)
  return `[${vec.map((n) => Number(n).toString()).join(",")}]`;
}

function toPgTextArrayLiteral(arr: string[]) {
  // string[] -> '{"a","b"}' (Postgres text[] literal)
  if (!arr || arr.length === 0) return "{}";
  const escaped = arr.map((s) => `"${String(s).replace(/"/g, '\\"')}"`);
  return `{${escaped.join(",")}}`;
}

type RefineRequest = {
  raw_text?: string;
  messages?: Array<{ role: string; content: string }>;
  source_timebox?: string;
};

export async function refineText(refineReq: RefineRequest) {
  const token = cookies().get("token")?.value;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!openaiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY가 설정되어 있지 않습니다." },
      { status: 500 }
    );
  }

  const requestBody = refineReq;
  const rawText =
    requestBody.raw_text ||
    requestBody.messages
      ?.map((msg: any) => (msg.role === "user" ? msg.content : ""))
      .join("\n")
      .trim();

  if (!rawText) {
    return NextResponse.json(
      { error: "원문 텍스트(raw_text)가 제공되지 않았습니다." },
      { status: 400 }
    );
  }

  const source_timebox = requestBody.source_timebox;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: PREPROCESS_SYSTEM_PROMPT },
          {
            role: "user",
            content: makeUserPrompt(rawText),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[self/refine] OpenAI error:", data);
      return NextResponse.json(
        { error: "OpenAI API 호출 실패", detail: data },
        { status: 502 }
      );
    }

    const content = data.choices?.[0]?.message?.content || "";
    const parsed = tryParseJSON<any>(content);

    if (!parsed) {
      console.error("[self/refine] JSON parse error:", content);
      return NextResponse.json(
        { error: "OpenAI 응답의 JSON 파싱에 실패했습니다." },
        { status: 500 }
      );
    }

    const chunks: Array<{
      id: string;
      text: string;
      overlap_text: string | null;
      topic: string[];
      timebox: string | null;
      emotion: string;
      priority_score: number;
      created_at_inferred: string | null;
    }> = normalizeChunks(parsed, source_timebox);

    if (!chunks.length) {
      return NextResponse.json(
        { error: "정제된 청크가 비어 있습니다." },
        { status: 400 }
      );
    }

    const embRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: chunks.map((c) => c.text), // text만 임베딩
      }),
    });

    const embJson = await embRes.json();
    if (!embRes.ok) {
      console.error("[self/refine] Embedding error:", embJson);
      return NextResponse.json(
        { error: "임베딩 생성에 실패했습니다.", detail: embJson },
        { status: 502 }
      );
    }

    const vectors: number[][] =
      embJson?.data?.map((d: any) => d.embedding) ?? [];
    if (vectors.length !== chunks.length) {
      return NextResponse.json(
        { error: "임베딩 결과 수가 청크 수와 일치하지 않습니다." },
        { status: 502 }
      );
    }

    let user_uuid: string | null = null;
    try {
      const decoded: any = jwt.verify(token!, process.env.JWT_SECRET!);
      user_uuid = decoded?.sub ?? decoded?.user_uuid ?? null;
    } catch {
      // 위에서 이미 검증했지만 방어적으로
    }
    if (!user_uuid) {
      return NextResponse.json(
        { error: "사용자 식별자(user_uuid)를 확인할 수 없습니다." },
        { status: 401 }
      );
    }

    let inserted = 0;

    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const v = vectors[i];
      const id = randomUUID();

      const topicLiteral = toPgTextArrayLiteral(
        Array.isArray(c.topic) ? c.topic : []
      );
      const vectorLiteral = makeVectorLiteral(v);

      await sql`
    INSERT INTO user_chunks (
      id, user_id, source_timebox, topic, emotion, priority_score,
      created_at_inferred, text, overlap_text, embedding
    )
    VALUES (
      ${id}::uuid,
      ${user_uuid}::uuid,
      ${c.timebox},
      ${topicLiteral}::text[],       -- ← text[] 리터럴로 캐스팅
      ${c.emotion},
      ${c.priority_score},
      ${c.created_at_inferred},
      ${c.text},
      ${c.overlap_text},
      ${vectorLiteral}::vector       -- ← '[...]'::vector 로 캐스팅
    )
    ON CONFLICT (id) DO UPDATE SET
      source_timebox      = EXCLUDED.source_timebox,
      topic               = EXCLUDED.topic,
      emotion             = EXCLUDED.emotion,
      priority_score      = EXCLUDED.priority_score,
      created_at_inferred = EXCLUDED.created_at_inferred,
      text                = EXCLUDED.text,
      overlap_text        = EXCLUDED.overlap_text,
      embedding           = EXCLUDED.embedding
  `;

      inserted++;
    }

    return NextResponse.json({
      ok: true,
      inserted,
    });
  } catch (err: any) {
    console.error("[self/refine] request failed", err);
    return NextResponse.json(
      {
        error: "서버 요청 중 오류가 발생했습니다.",
        detail: err.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  return refineText(body);
}
