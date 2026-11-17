import type { Metadata } from "next";
import TestClient from "./TestClient";
import { SEASON } from "@/config/season";

export const metadata: Metadata = {
  title: "테스트",
  alternates: { canonical: `${SEASON.siteUrl}/test` },
};

export default function TestPage() {
  return <TestClient />;
}
