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
      if (!name && email === undefined) {
        return NextResponse.json(
          { message: "name or email is required" },
          { status: 400 }
        );
      }

      // 업데이트할 필드 구성
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length === 0) {
          return NextResponse.json(
            { message: "name must be a non-empty string" },
            { status: 400 }
          );
        }
        updates.push(`name = $${paramIndex}`);
        values.push(name.trim());
        paramIndex++;
      }

      if (email !== undefined) {
        // email이 빈 문자열이면 null로 처리
        const emailValue = email && email.trim().length > 0 ? email.trim() : null;
        
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
        
        updates.push(`email = $${paramIndex}`);
        values.push(emailValue);
        paramIndex++;
      }

      // user_uuid 추가
      values.push(user_uuid);

      // SQL 쿼리 실행
      const query = `
        UPDATE "user" 
        SET ${updates.join(", ")}, updated_at = NOW()
        WHERE user_uuid = $${paramIndex}
        RETURNING user_uuid, name, email
      `;

      const result = await client.query(query, values);

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

