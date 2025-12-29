import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface PocketReminderEmailProps {
  email: string;
  userName: string;
  pocketName: string;
  pocketOpenDate: string;
  viewUrl: string;
}

export const PocketReminderEmail = ({
  userName = "사용자",
  pocketName = "덕담 주머니",
  pocketOpenDate = "2024년 1월 1일",
  viewUrl = "https://example.com/pocket",
}: PocketReminderEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        {pocketName}이 오늘 오픈되었어요! 받은 덕담을 확인해보세요.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h2}>덕담 주머니 오픈 알림</Heading>
          </Section>
          <Section style={content}>
            <Text style={greeting}>{userName}님, 안녕하세요.</Text>
            <Text style={paragraph}>
              기다리셨던 <strong>{pocketName}</strong>이(가) 드디어
              오픈되었어요!
            </Text>
            <Text style={paragraph}>
              이제 {pocketOpenDate}에 담겨진 {userName}님의 소중한 덕담을 확인할
              수 있어요.
            </Text>
            <Text style={paragraph}>
              소중한 사람들이 남긴 메시지를 확인하고, 그 마음을 느껴보세요.
            </Text>
            <Section style={buttonContainer}>
              <Link href={viewUrl} style={button}>
                받은 덕담 확인하기
              </Link>
            </Section>
            <Text style={paragraph}>
              내게 온 덕담을 언제든지 웹사이트에서 확인할 수 있어요.
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              이 이메일은 {pocketName}의 오픈일 알림입니다.
            </Text>
            <Text style={footerText}>
              덕담 주머니(deokdam.app)에서 발송되었습니다.
            </Text>
            <Img
              src="https://deokdam.app/images/deokdam_logo_crop.png"
              alt="덕담 주머니"
              width={120}
              height={120}
              style={logo}
            />
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

PocketReminderEmail.PreviewProps = {
  userName: "홍길동",
  pocketName: "2024년 새해 덕담",
  pocketOpenDate: "2024년 1월 1일",
  viewUrl: "https://example.com/pocket",
} as PocketReminderEmailProps;

export default PocketReminderEmail;

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

const logo = {
  display: "block",
  margin: "24px auto 0",
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
