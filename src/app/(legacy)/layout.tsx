import Image from "next/image";
import dynamic from "next/dynamic";
import styles from "./legacy.module.css";
import backgroundImg from "../../../public/images/background.webp";

// 2026 시즌까지의 화면(주머니, AI 자기 대화)이 쓰는 공통 배경과 로그인 상태 초기화
const AuthBootstrap = dynamic(() => import("@/components/auth/AuthBootstrap"), {
  ssr: false,
});

export default function LegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Image className={styles.background_img} src={backgroundImg} alt="img" />
      <AuthBootstrap />
      {children}
    </>
  );
}
