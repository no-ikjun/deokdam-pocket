import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface SelfReminderEmailProps {
  email: string;
  userName: string;
  selfType: "GOALS" | "ONEYEAR" | "RETROSPECT";
  selfTypeLabel: string;
  timing: string;
  method: string;
  methodLabel: string;
  viewUrl: string;
}

const getSelfTypeLabel = (selfType: string): string => {
  switch (selfType) {
    case "RETROSPECT":
      return "지난 1년 되돌아보기";
    case "ONEYEAR":
      return "1년 남은 나에게";
    case "GOALS":
      return "올해 목표";
    default:
      return "작성 내용";
  }
};

export const SelfReminderEmail = ({
  userName = "사용자",
  selfType = "GOALS",
  selfTypeLabel,
  timing = "1개월 전",
  method = "goal_check",
  methodLabel = "목표 재확인",
  viewUrl = "https://example.com/self",
}: SelfReminderEmailProps) => {
  const displaySelfTypeLabel = selfTypeLabel || getSelfTypeLabel(selfType);
  const methodMessages: Record<string, string> = {
    goal_check: "작성하신 목표를 다시 한 번 확인해보시는 시간을 가져보세요.",
    progress_check: "목표를 향한 진행 상황을 점검해보세요.",
    motivation: "처음 그 마음을 다시 떠올려보세요.",
    priority_check: "무엇이 가장 중요한지 다시 생각해보세요.",
    meaning_revisit: "그때 느꼈던 의미를 다시 되새겨보세요.",
    quiet_reminder: "조용히 자신의 마음을 돌아보세요.",
    growth_check: "지금까지의 성장을 확인해보세요.",
    gratitude_revisit: "그때 느꼈던 감사를 다시 떠올려보세요.",
    past_present_compare: "과거와 현재를 비교하며 변화를 확인해보세요.",
  };

  const methodMessage =
    methodMessages[method] || "작성하신 내용을 다시 확인해보세요.";

  return (
    <Html>
      <Head />
      <Preview>
        {timing}에 작성하신 {selfTypeLabel}을 다시 확인해보세요.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>덕담 주머니</Heading>
            <Heading style={h2}>리마인드 알림</Heading>
          </Section>
          <Section style={content}>
            <Text style={greeting}>{userName}님, 안녕하세요.</Text>
            <Text style={paragraph}>
              {timing}에 작성하신 <strong>{displaySelfTypeLabel}</strong>을(를)
              다시 확인해볼 시간이 되었어요.
            </Text>
            <Text style={paragraph}>
              <strong>{methodLabel}</strong> 관점에서 {methodMessage}
            </Text>
            <Section style={buttonContainer}>
              <Link href={viewUrl} style={button}>
                작성 내용 확인하기
              </Link>
            </Section>
            <Text style={paragraph}>
              <strong>{displaySelfTypeLabel}</strong>은(는) 언제든지
              웹사이트에서 다시 확인할 수 있어요.
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              이 이메일은 {timing}에 설정하신 리마인드 알림입니다.
            </Text>
            <Text style={footerText}>
              덕담 주머니(deokdam.app)에서 발송되었습니다.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

SelfReminderEmail.PreviewProps = {
  userName: "홍길동",
  selfType: "GOALS",
  selfTypeLabel: "올해의 목표",
  timing: "1개월 전",
  method: "goal_check",
  methodLabel: "목표 재확인",
  viewUrl: "https://example.com/self",
} as SelfReminderEmailProps;

export default SelfReminderEmail;

const main = {
  backgroundColor: "#f8fafc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "transparent",
  margin: "0 auto",
  padding: "0",
  marginBottom: "64px",
  maxWidth: "600px",
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.62))",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.75)",
  boxShadow:
    "0 18px 40px rgba(248, 113, 113, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.65)",
};

const header = {
  padding: "32px 24px",
  background:
    "linear-gradient(180deg, rgba(249, 80, 80, 0.95), rgba(229, 87, 87, 0.9))",
  borderRadius: "20px 20px 0 0",
  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.3)",
};

const h1 = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
  textAlign: "center" as const,
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
};

const h2 = {
  color: "rgba(255, 255, 255, 0.95)",
  fontSize: "18px",
  fontWeight: "500",
  margin: "0",
  textAlign: "center" as const,
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
};

const content = {
  padding: "32px 48px",
  backgroundColor: "rgba(255, 255, 255, 0.4)",
};

const greeting = {
  fontSize: "18px",
  lineHeight: "28px",
  marginBottom: "20px",
  color: "#1e293b",
  fontWeight: "600",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "16px",
  color: "#475569",
};

const buttonContainer = {
  padding: "24px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#f95050",
  borderRadius: "12px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
  boxShadow:
    "0 6px 18px rgba(229, 87, 87, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
  background: "linear-gradient(145deg, #f56d6d, #e25757)",
};

const footer = {
  padding: "24px 48px 32px",
  borderTop: "1px solid rgba(226, 232, 240, 0.6)",
  marginTop: "16px",
  backgroundColor: "rgba(248, 250, 252, 0.5)",
  borderRadius: "0 0 20px 20px",
};

const footerText = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#94a3b8",
  margin: "4px 0",
  textAlign: "center" as const,
};
