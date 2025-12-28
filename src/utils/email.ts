/**
 * 이메일 발송 유틸리티
 * 서버 사이드에서만 사용해야 하며, 동적 import를 통해 클라이언트 번들에 포함되지 않도록 함
 */

import { Resend } from "resend";
import type { SelfReminderEmailProps } from "../../emails/SelfReminderEmail";
import type { PocketReminderEmailProps } from "../../emails/PocketReminderEmail";

// Resend 클라이언트 초기화
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY 환경변수가 설정되지 않았습니다.");
  }
  return new Resend(apiKey);
};

// 발신자 정보 (Resend에서 도메인을 인증한 주소 사용)
const FROM_NAME = process.env.RESEND_FROM_NAME || "덕담 주머니";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@deokdam.app";
const FROM = `${FROM_NAME} <${FROM_EMAIL}>`;

/**
 * Self 리마인드 이메일 발송
 */
export async function sendSelfReminderEmail(
  props: SelfReminderEmailProps
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // 동적 import로 React Email 템플릿 및 render 함수 로드
    const { SelfReminderEmail } =
      await import("../../emails/SelfReminderEmail");
    const { render } = await import("@react-email/render");

    // React 컴포넌트를 HTML로 렌더링
    const emailHtml = await render(SelfReminderEmail(props));

    // Resend를 사용하여 이메일 발송
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [props.email],
      subject: `${props.timing}에 작성하신 ${props.selfTypeLabel || "작성 내용"} 리마인드`,
      html: emailHtml,
    });

    if (error) {
      console.error("[email] Self 리마인드 발송 실패:", error);
      return { success: false, error: JSON.stringify(error) };
    }

    console.log("[email] Self 리마인드 발송 성공:", data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("[email] Self 리마인드 발송 중 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Pocket 오픈 알림 이메일 발송
 */
export async function sendPocketReminderEmail(
  props: PocketReminderEmailProps
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // 동적 import로 React Email 템플릿 및 render 함수 로드
    const { PocketReminderEmail } =
      await import("../../emails/PocketReminderEmail");
    const { render } = await import("@react-email/render");

    // React 컴포넌트를 HTML로 렌더링
    const emailHtml = await render(PocketReminderEmail(props));

    // Resend를 사용하여 이메일 발송
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [props.email],
      subject: `${props.pocketName}이 오늘 오픈되었어요!`,
      html: emailHtml,
    });

    if (error) {
      console.error("[email] Pocket 리마인드 발송 실패:", error);
      return { success: false, error: JSON.stringify(error) };
    }

    console.log("[email] Pocket 리마인드 발송 성공:", data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("[email] Pocket 리마인드 발송 중 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
