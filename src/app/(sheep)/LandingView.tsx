"use client";

import { useEffect } from "react";
import { track } from "@/sheep/events";

/** 랜딩 방문 수를 남긴다. 화면에는 아무것도 그리지 않는다. */
export default function LandingView() {
  useEffect(() => {
    track("landing_view");
  }, []);
  return null;
}
