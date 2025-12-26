"use client";

import { useAuthStore } from "@/stores/auth";

/**
 * 로그아웃 후 지정한 경로로 리다이렉트합니다.
 * 내부적으로 /api/auth/logout 호출과 localStorage 초기화를 수행합니다.
 */
export async function logoutAndRedirect(redirectTo = "/") {
  await useAuthStore.getState().logout();
  if (typeof window !== "undefined") {
    window.location.href = redirectTo;
  }
}
