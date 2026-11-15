import type { Metadata } from "next";
import { SEASON } from "@/config/season";
import DailyClient from "./DailyClient";

export const metadata: Metadata = {
  title: "오늘의 복주머니",
  description: "설날까지 하루 한 번, 오늘의 운세와 덕담 카드를 받아보세요.",
  alternates: { canonical: `${SEASON.siteUrl}/daily` },
};

export default function DailyPage() {
  return <DailyClient />;
}
