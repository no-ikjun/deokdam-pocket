import { NextRequest, NextResponse } from "next/server";
import { withAuthAndDb } from "@/utils/db";

/**
 * 사용자 정보 업데이트 (닉네임, 이메일)
 */
export async function PATCH(req: NextRequest) {
  return withAuthAndDb(async (user_uuid, client) => {
    try {
      const body = await req.json();
      const { name, email } = body;

      // name과 email 중 하나라도 제공되어야 함
      if (name === undefined && email === undefined) {
        return NextResponse.json(
          { message: "name or email is required" },
          { status: 400 }
        );
      }

      // name 검증 및 처리
      if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length === 0) {
          return NextResponse.json(
            { message: "name must be a non-empty string" },
            { status: 400 }
          );
        }
      }

      // email 검증 및 처리
      let emailValue: string | null = null;
      if (email !== undefined) {
        // email이 빈 문자열이면 null로 처리
        emailValue = email && email.trim().length > 0 ? email.trim() : null;
        
        // 이메일 형식 검증 (null이 아닌 경우)
        if (emailValue !== null) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailValue)) {
            return NextResponse.json(
              { message: "Invalid email format" },
              { status: 400 }
            );
          }
        }
      }

      // SQL 쿼리 실행 (client.sql 사용)
      let result;
      if (name !== undefined && email !== undefined) {
        // 둘 다 업데이트
        result = await client.sql`
          UPDATE "user" 
          SET name = ${name.trim()}, email = ${emailValue}
          WHERE user_uuid = ${user_uuid}
          RETURNING user_uuid, name, email
        `;
      } else if (name !== undefined) {
        // name만 업데이트
        result = await client.sql`
          UPDATE "user" 
          SET name = ${name.trim()}
          WHERE user_uuid = ${user_uuid}
          RETURNING user_uuid, name, email
        `;
      } else {
        // email만 업데이트
        result = await client.sql`
          UPDATE "user" 
          SET email = ${emailValue}
          WHERE user_uuid = ${user_uuid}
          RETURNING user_uuid, name, email
        `;
      }

      if (result.rowCount === 0) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          user_uuid: result.rows[0].user_uuid,
          name: result.rows[0].name,
          email: result.rows[0].email || null,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { message: "Internal server error", error: error.message },
        { status: 500 }
      );
    }
  });
}

