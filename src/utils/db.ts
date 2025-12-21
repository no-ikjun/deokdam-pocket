import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import type { VercelPoolClient } from "@vercel/postgres";

/**
 * 데이터베이스 클라이언트를 안전하게 관리하는 헬퍼 함수
 * @param handler - DB 작업을 수행하는 비동기 함수
 * @returns NextResponse 또는 handler의 반환값
 */
export async function withDbClient<T extends NextResponse>(
  handler: (client: VercelPoolClient) => Promise<T>
): Promise<T> {
  const client = await db.connect();
  try {
    return await handler(client);
  } catch (error) {
    console.error("Database operation error:", error);
    return NextResponse.json({ message: "error" }, { status: 500 }) as T;
  } finally {
    client.release();
  }
}

/**
 * 인증이 필요한 DB 작업을 수행하는 헬퍼 함수
 * @param handler - DB 작업을 수행하는 비동기 함수 (user_uuid와 client를 받음)
 * @returns NextResponse
 */
export async function withAuthAndDb(
  handler: (
    user_uuid: string,
    client: VercelPoolClient
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  const client = await db.connect();
  try {
    const { requireAuth } = await import("./auth");
    const { user_uuid, errorResponse } = await requireAuth();

    if (!user_uuid || errorResponse) {
      return errorResponse!;
    }

    return await handler(user_uuid, client);
  } catch (error) {
    console.error("Database operation error:", error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  } finally {
    client.release();
  }
}
