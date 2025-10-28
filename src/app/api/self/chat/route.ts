import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type IncomingMessage = {
  role?: string;
  content?: string;
};

const SYSTEM_PROMPT =
  "당신은 새해 목표를 계획하고 다짐을 구체화하도록 돕는 AI 코치입니다. " +
  "친절하고 명확하게 사용자의 상황을 되짚어 주고, 실행 가능한 다음 행동을 제안하세요. " +
  "질문을 통해 사용자가 스스로 생각을 정리할 수 있게 도와주세요.";

const DEFAULT_MODEL = "gpt-3.5-turbo";

export async function POST(req: Request) {
  const token = cookies().get("token")?.value;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!openaiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    console.error("[self/chat] token verify failed", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { messages?: IncomingMessage[] };

  try {
    payload = await req.json();
  } catch (error) {
    console.error("[self/chat] invalid json", error);
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const incomingMessages = payload.messages ?? [];

  const sanitizedMessages = incomingMessages
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: (message.content ?? "").toString().trim(),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-12); // 최근 12개의 메시지만 전달

  if (sanitizedMessages.length === 0) {
    return NextResponse.json(
      { error: "대화 내용이 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL ?? DEFAULT_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...sanitizedMessages,
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[self/chat] openai error", result);
      return NextResponse.json(
        { error: "AI 응답을 가져오지 못했습니다." },
        { status: 502 }
      );
    }

    const reply =
      result?.choices?.[0]?.message?.content?.toString().trim() ?? "";

    if (!reply) {
      return NextResponse.json(
        { error: "AI 응답이 비어 있습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[self/chat] request failed", error);
    return NextResponse.json(
      { error: "AI와의 통신에 실패했습니다." },
      { status: 500 }
    );
  }
}
