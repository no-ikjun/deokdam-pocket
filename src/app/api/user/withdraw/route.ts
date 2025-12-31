import { NextRequest, NextResponse } from "next/server";
import { withAuthAndDb } from "@/utils/db";
import { v4 as uuidv4 } from "uuid";
import { toPgArray } from "@/utils/pgArray";

/**
 * 회원 탈퇴 처리
 * 1. 탈퇴 정보를 user_withdrawal 테이블에 저장
 * 2. 사용자 관련 데이터 삭제 또는 비활성화
 */
export async function POST(req: NextRequest) {
  return withAuthAndDb(async (user_uuid, client) => {
    try {
      const body = await req.json();
      const { reason, other_reason } = body as {
        reason?: string;
        other_reason?: string;
      };

      // 사용자 정보 조회 (탈퇴 기록용)
      const userData = await client.sql`
        SELECT name, email FROM "user" WHERE user_uuid = ${user_uuid}
      `;

      if (userData.rowCount === 0) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      const user = userData.rows[0];
      const withdrawalUuid = uuidv4();

      // 1. 탈퇴 정보 저장
      await client.sql`
        INSERT INTO user_withdrawal (
          withdrawal_uuid,
          user_uuid,
          reason,
          other_reason,
          withdrawn_at
        ) VALUES (
          ${withdrawalUuid},
          ${user_uuid},
          ${reason || null},
          ${other_reason || null},
          NOW()
        )
      `;

      // 2. 사용자 관련 데이터 삭제
      // 트랜잭션으로 처리하는 것이 좋지만, Vercel Postgres의 경우 간단하게 순차 처리

      // self 데이터 삭제
      await client.sql`DELETE FROM self WHERE user_uuid = ${user_uuid}`;

      // user_chunks 데이터 삭제 (AI 학습 데이터)
      await client.sql`DELETE FROM user_chunks WHERE user_id = ${user_uuid}`;

      // pocket 관련 처리
      // 1. 사용자가 만든 주머니는 soft delete (disabled = true)
      const madePockets = await client.sql`
        SELECT pocket_uuid FROM pocket 
        WHERE made_by = ${user_uuid} 
          AND (disabled IS NULL OR disabled = false)
      `;

      if (madePockets.rows.length > 0) {
        await client.sql`
          UPDATE pocket 
          SET disabled = true, deleted_at = NOW()
          WHERE made_by = ${user_uuid}
        `;
      }

      // 2. 사용자가 참여한 주머니에서 members 배열에서 제거
      const participatedPockets = await client.sql`
        SELECT pocket_uuid, members 
        FROM pocket 
        WHERE ${user_uuid} = ANY(members)
          AND made_by != ${user_uuid}
          AND (disabled IS NULL OR disabled = false)
      `;

      for (const pocket of participatedPockets.rows) {
        const members: string[] = pocket.members || [];
        const updatedMembers = members.filter((id: string) => id !== user_uuid);
        const pgArray = toPgArray(updatedMembers);

        await client.sql`
          UPDATE pocket
          SET members = ${pgArray}::text[]
          WHERE pocket_uuid = ${pocket.pocket_uuid}
        `;
      }

      // deokdam 데이터: 사용자가 작성한 덕담은 유지 (다른 사용자와 공유된 데이터)
      // 단, 사용자 정보는 익명 처리하거나 삭제 정책에 따라 결정
      // 여기서는 일단 유지

      // ment 데이터: 사용자가 작성한 멘트는 유지

      // 3. 사용자 계정 삭제
      await client.sql`DELETE FROM "user" WHERE user_uuid = ${user_uuid}`;

      return NextResponse.json(
        { message: "Withdrawal completed successfully" },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error processing withdrawal:", error);
      return NextResponse.json(
        { message: "Internal server error", error: error.message },
        { status: 500 }
      );
    }
  });
}
