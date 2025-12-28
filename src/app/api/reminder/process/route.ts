/**
 * 리마인드 처리 API
 * Self 리마인드를 처리하여 오늘 날짜의 리마인드에 해당하는 이메일을 발송합니다.
 * Cron job이나 스케줄러에서 호출됩니다.
 */

import { NextResponse } from "next/server";
import { withDbClient } from "@/utils/db";
import { sendSelfReminderEmail, sendPocketReminderEmail } from "@/utils/email";
import type { VercelPoolClient } from "@vercel/postgres";

export const dynamic = "force-dynamic";

interface RemindAtData {
  timestamp: string; // ISO date string
  timing: string; // "1주 후", "1개월 후" 등
  method: string; // "goal_check", "progress_check" 등
}

// Self 타입별 레이블 매핑
const SELF_TYPE_LABELS: Record<string, string> = {
  GOALS: "올해 목표",
  ONEYEAR: "1년 남은 나에게",
  RETROSPECT: "지난 1년 되돌아보기",
};

// Method별 레이블 매핑
const METHOD_LABELS: Record<string, string> = {
  goal_check: "목표 재확인",
  progress_check: "진행 상황 점검",
  motivation: "동기부여 메시지",
  priority_check: "우선순위 재확인",
  meaning_revisit: "의미 재발견",
  quiet_reminder: "조용한 상기",
  growth_check: "성장 확인",
  gratitude_revisit: "감사 재확인",
  past_present_compare: "과거와 현재 비교",
};

/**
 * 오늘 날짜가 리마인드 날짜인지 확인
 * 날짜만 비교 (시간 제외)
 */
function isToday(dateString: string): boolean {
  const today = new Date();
  const targetDate = new Date(dateString);

  return (
    today.getFullYear() === targetDate.getFullYear() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getDate() === targetDate.getDate()
  );
}

/**
 * 딜레이 헬퍼 함수 (Rate limit 방지)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 리마인드 처리 로직 (공통 함수)
 */
async function processReminders(client: VercelPoolClient) {
  // 1. 오늘 날짜에 리마인드가 설정된 Self 찾기
  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const selfReminders = await client.sql`
        SELECT 
          s.self_uuid,
          s.self_type,
          s.user_uuid,
          s.remind_at,
          u.email,
          u.name
        FROM self s
        INNER JOIN "user" u ON s.user_uuid = u.user_uuid
        WHERE s.remind = true
          AND s.remind_at IS NOT NULL
          AND u.email IS NOT NULL
      `;

  const remindersToSend: Array<{
    selfUuid: string;
    selfType: string;
    userUuid: string;
    email: string;
    userName: string;
    timing: string;
    method: string;
    methodLabel: string;
    selfTypeLabel: string;
    remindAtData: RemindAtData;
  }> = [];

  // 2. remind_at JSON 파싱 및 오늘 날짜 확인
  for (const row of selfReminders.rows) {
    try {
      const remindAtData: RemindAtData = row.remind_at;
      const reminderDate = new Date(remindAtData.timestamp);

      // 오늘 날짜인지 확인 (날짜만 비교)
      if (isToday(remindAtData.timestamp)) {
        // 이미 오늘 발송했는지 확인
        const existingLog = await client.sql`
              SELECT reminder_id FROM reminder_log
              WHERE reminder_type = 'self'
                AND target_id = ${row.self_uuid}
                AND DATE(sent_at) = DATE(${today.toISOString()})
                AND status = 'sent'
              LIMIT 1
            `;

        // 오늘 이미 발송하지 않았다면 추가
        if (existingLog.rows.length === 0) {
          remindersToSend.push({
            selfUuid: row.self_uuid,
            selfType: row.self_type,
            userUuid: row.user_uuid,
            email: row.email,
            userName: row.name,
            timing: remindAtData.timing,
            method: remindAtData.method,
            methodLabel:
              METHOD_LABELS[remindAtData.method] || remindAtData.method,
            selfTypeLabel: SELF_TYPE_LABELS[row.self_type] || row.self_type,
            remindAtData,
          });
        }
      }
    } catch (error) {
      console.error(
        `[reminder/process] Failed to parse remind_at for self_uuid ${row.self_uuid}:`,
        error
      );
    }
  }

  // 3. 오늘 오픈일인 Pocket 찾기
  const pocketsToNotify = await client.sql`
    SELECT 
      p.pocket_uuid,
      p.name,
      p.open_at,
      p.members
    FROM pocket p
    WHERE DATE(p.open_at) = DATE(${today.toISOString()})
  `;

  const pocketRemindersToSend: Array<{
    pocketUuid: string;
    pocketName: string;
    pocketOpenDate: string;
    userUuid: string;
    email: string;
    userName: string;
  }> = [];

  // 4. Pocket 멤버들의 이메일 정보 가져오기
  for (const pocket of pocketsToNotify.rows) {
    const members = pocket.members || [];

    for (const memberUuid of members) {
      try {
        // 이미 오늘 발송했는지 확인
        const existingLog = await client.sql`
          SELECT reminder_id FROM reminder_log
          WHERE reminder_type = 'pocket'
            AND target_id = ${pocket.pocket_uuid}
            AND user_uuid = ${memberUuid}
            AND DATE(sent_at) = DATE(${today.toISOString()})
            AND status = 'sent'
          LIMIT 1
        `;

        if (existingLog.rows.length === 0) {
          // 사용자 정보 가져오기
          const userInfo = await client.sql`
            SELECT user_uuid, name, email
            FROM "user"
            WHERE user_uuid = ${memberUuid}
              AND email IS NOT NULL
            LIMIT 1
          `;

          if (userInfo.rows.length > 0) {
            const user = userInfo.rows[0];
            const openDate = new Date(pocket.open_at);
            const formattedDate = `${openDate.getFullYear()}년 ${
              openDate.getMonth() + 1
            }월 ${openDate.getDate()}일`;

            pocketRemindersToSend.push({
              pocketUuid: pocket.pocket_uuid,
              pocketName: pocket.name,
              pocketOpenDate: formattedDate,
              userUuid: user.user_uuid,
              email: user.email,
              userName: user.name,
            });
          }
        }
      } catch (error) {
        console.error(
          `[reminder/process] Failed to process pocket member ${memberUuid} for pocket ${pocket.pocket_uuid}:`,
          error
        );
      }
    }
  }

  // 5. Self 이메일 발송 및 로그 저장
  const selfResults = {
    processed: remindersToSend.length,
    succeeded: 0,
    failed: 0,
    errors: [] as Array<{ selfUuid: string; error: string }>,
  };

  for (let i = 0; i < remindersToSend.length; i++) {
    const reminder = remindersToSend[i];

    // Rate limit 방지: 첫 번째 요청이 아니면 딜레이 추가
    if (i > 0) {
      await delay(600); // 0.6초 딜레이 (초당 2개 = 500ms 간격, 여유를 두고 600ms)
    }
    try {
      // 이메일 발송
      const viewUrl = `https://deokdam.app/self?type=${reminder.selfType.toLowerCase()}`;
      const result = await sendSelfReminderEmail({
        email: reminder.email,
        userName: reminder.userName,
        selfType: reminder.selfType as "GOALS" | "ONEYEAR" | "RETROSPECT",
        selfTypeLabel: reminder.selfTypeLabel,
        timing: reminder.timing,
        method: reminder.method,
        methodLabel: reminder.methodLabel,
        viewUrl,
      });

      // 로그 저장
      const reminderDate = new Date(reminder.remindAtData.timestamp);
      await client.sql`
            INSERT INTO reminder_log (
              user_uuid,
              reminder_type,
              target_id,
              remind_at,
              sent_at,
              status,
              error_message
            ) VALUES (
              ${reminder.userUuid},
              'self',
              ${reminder.selfUuid},
              ${reminderDate.toISOString()},
              ${new Date().toISOString()},
              ${result.success ? "sent" : "failed"},
              ${result.error || null}
            )
          `;

      if (result.success) {
        selfResults.succeeded++;
      } else {
        selfResults.failed++;
        selfResults.errors.push({
          selfUuid: reminder.selfUuid,
          error: result.error || "Unknown error",
        });
      }
    } catch (error) {
      selfResults.failed++;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      selfResults.errors.push({
        selfUuid: reminder.selfUuid,
        error: errorMessage,
      });

      // 실패 로그도 저장
      const reminderDate = new Date(reminder.remindAtData.timestamp);
      await client.sql`
            INSERT INTO reminder_log (
              user_uuid,
              reminder_type,
              target_id,
              remind_at,
              sent_at,
              status,
              error_message
            ) VALUES (
              ${reminder.userUuid},
              'self',
              ${reminder.selfUuid},
              ${reminderDate.toISOString()},
              ${new Date().toISOString()},
              'failed',
              ${errorMessage}
            )
          `;

      console.error(
        `[reminder/process] Failed to send reminder for self_uuid ${reminder.selfUuid}:`,
        error
      );
    }
  }

  // 6. Pocket 이메일 발송 및 로그 저장
  const pocketResults = {
    processed: pocketRemindersToSend.length,
    succeeded: 0,
    failed: 0,
    errors: [] as Array<{
      pocketUuid: string;
      userUuid: string;
      error: string;
    }>,
  };

  for (let i = 0; i < pocketRemindersToSend.length; i++) {
    const reminder = pocketRemindersToSend[i];

    // Rate limit 방지: 첫 번째 요청이 아니면 딜레이 추가
    // Self와 Pocket을 합쳐서 카운트 (연속된 요청이므로)
    if (i > 0 || remindersToSend.length > 0) {
      await delay(600);
    }
    try {
      // 이메일 발송
      const viewUrl = `https://deokdam.app/pocket/${reminder.pocketUuid}`;
      const result = await sendPocketReminderEmail({
        email: reminder.email,
        userName: reminder.userName,
        pocketName: reminder.pocketName,
        pocketOpenDate: reminder.pocketOpenDate,
        viewUrl,
      });

      // 로그 저장
      const openDate = new Date(
        pocketsToNotify.rows.find((p) => p.pocket_uuid === reminder.pocketUuid)
          ?.open_at || today.toISOString()
      );

      await client.sql`
        INSERT INTO reminder_log (
          user_uuid,
          reminder_type,
          target_id,
          remind_at,
          sent_at,
          status,
          error_message
        ) VALUES (
          ${reminder.userUuid},
          'pocket',
          ${reminder.pocketUuid},
          ${openDate.toISOString()},
          ${new Date().toISOString()},
          ${result.success ? "sent" : "failed"},
          ${result.error || null}
        )
      `;

      if (result.success) {
        pocketResults.succeeded++;
      } else {
        pocketResults.failed++;
        pocketResults.errors.push({
          pocketUuid: reminder.pocketUuid,
          userUuid: reminder.userUuid,
          error: result.error || "Unknown error",
        });
      }
    } catch (error) {
      pocketResults.failed++;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      pocketResults.errors.push({
        pocketUuid: reminder.pocketUuid,
        userUuid: reminder.userUuid,
        error: errorMessage,
      });

      // 실패 로그도 저장
      const openDate = new Date(
        pocketsToNotify.rows.find((p) => p.pocket_uuid === reminder.pocketUuid)
          ?.open_at || today.toISOString()
      );

      await client.sql`
        INSERT INTO reminder_log (
          user_uuid,
          reminder_type,
          target_id,
          remind_at,
          sent_at,
          status,
          error_message
        ) VALUES (
          ${reminder.userUuid},
          'pocket',
          ${reminder.pocketUuid},
          ${openDate.toISOString()},
          ${new Date().toISOString()},
          'failed',
          ${errorMessage}
        )
      `;

      console.error(
        `[reminder/process] Failed to send pocket reminder for pocket ${reminder.pocketUuid} to user ${reminder.userUuid}:`,
        error
      );
    }
  }

  // 7. 결과 통합
  const totalProcessed = selfResults.processed + pocketResults.processed;
  const totalSucceeded = selfResults.succeeded + pocketResults.succeeded;
  const totalFailed = selfResults.failed + pocketResults.failed;

  return NextResponse.json(
    {
      success: true,
      message: `처리 완료: 총 ${totalProcessed}개 (Self: ${selfResults.processed}, Pocket: ${pocketResults.processed}) 중 ${totalSucceeded}개 성공, ${totalFailed}개 실패`,
      results: {
        self: selfResults,
        pocket: pocketResults,
        total: {
          processed: totalProcessed,
          succeeded: totalSucceeded,
          failed: totalFailed,
        },
      },
    },
    { status: 200 }
  );
}

/**
 * POST: 리마인드 처리 (수동 호출용)
 */
export async function POST(req: Request) {
  return withDbClient(async (client) => {
    try {
      return await processReminders(client);
    } catch (error) {
      console.error("[reminder/process] 처리 중 오류:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        },
        { status: 500 }
      );
    }
  });
}

/**
 * GET: Cron job 호출 (자동 호출용)
 */
export async function GET() {
  return withDbClient(async (client) => {
    try {
      return await processReminders(client);
    } catch (error) {
      console.error("[reminder/process] 처리 중 오류:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        },
        { status: 500 }
      );
    }
  });
}
