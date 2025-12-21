import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export interface JWTPayload {
  user_uuid: string;
  [key: string]: unknown;
}

/**
 * JWT 토큰을 검증하고 user_uuid를 반환합니다.
 * @returns user_uuid 또는 null (인증 실패 시)
 */
export async function verifyToken(): Promise<string | null> {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return null;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not defined");
      return null;
    }

    const payload = jwt.verify(token, jwtSecret) as JWTPayload;
    return payload.user_uuid || null;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * 인증이 필요한 API 라우트에서 사용하는 헬퍼 함수
 * @returns { user_uuid, errorResponse } - user_uuid가 null이면 errorResponse가 설정됨
 */
export async function requireAuth(): Promise<{
  user_uuid: string | null;
  errorResponse: NextResponse | null;
}> {
  const user_uuid = await verifyToken();

  if (!user_uuid) {
    return {
      user_uuid: null,
      errorResponse: NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { user_uuid, errorResponse: null };
}
