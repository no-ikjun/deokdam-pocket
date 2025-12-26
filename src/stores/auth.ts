"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthStatus = "idle" | "checking" | "authenticated" | "unauthenticated";

export interface AuthUser {
  user_uuid: string;
  name: string;
}

interface AuthState {
  // state
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;

  // derived
  isAuthenticated: () => boolean;

  // actions
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setAuthenticated: (user: AuthUser) => void;
  logout: () => Promise<void>;
  getCurrentUserName: () => Promise<string | null>;
  reset: () => void;
}

/**
 * 서버 응답 형식 예시(권장):
 * GET /api/auth/me  -> 200 { user_uuid: string, name: string }
 *                    -> 401 (세션 없음)
 * POST /api/auth/logout -> 204/200
 *
 * 만약 기존 엔드포인트를 쓰고 싶다면 아래 fetch 경로만 교체하세요.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      status: "idle",
      user: null,
      error: null,

      isAuthenticated: () => get().status === "authenticated" && !!get().user,

      setUser: (user) => set({ user }),

      setAuthenticated: (user) =>
        set({ status: "authenticated", user, error: null }),

      reset: () => set({ status: "unauthenticated", user: null, error: null }),

      checkAuth: async () => {
        set({ status: "checking", error: null });
        try {
          // 세션과 유저 정보를 한 번에 확인
          const res = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Expires: "0",
            },
          });

          if (res.ok) {
            const data = (await res.json()) as Partial<AuthUser>;
            if (data?.user_uuid && data?.name) {
              set({
                status: "authenticated",
                user: { user_uuid: data.user_uuid, name: data.name },
                error: null,
              });
            } else {
              // 응답이 200이지만 필드가 없을 때 방어적으로 처리
              set({ status: "authenticated", user: null, error: null });
              // 필요하면 여기서 추가 fetch 또는 로그 남기기
            }
          } else if (res.status === 401) {
            set({ status: "unauthenticated", user: null, error: null });
          } else {
            set({ status: "unauthenticated", user: null, error: "auth_error" });
          }
        } catch {
          set({
            status: "unauthenticated",
            user: null,
            error: "network_error",
          });
        }
      },

      refreshUser: async () => {
        try {
          const res = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          });
          if (res.ok) {
            const data = (await res.json()) as Partial<AuthUser>;
            if (data?.user_uuid && data?.name) {
              set({ user: { user_uuid: data.user_uuid, name: data.name } });
              if (get().status !== "authenticated")
                set({ status: "authenticated" });
            }
          } else if (res.status === 401) {
            // 세션 만료 시 정리
            set({ status: "unauthenticated", user: null });
          }
        } catch {
          // 조용히 무시(네트워크 오류 등)
        }
      },

      logout: async () => {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch {
          // ignore
        } finally {
          try {
            if (typeof window !== "undefined") {
              localStorage.clear();
            }
          } catch {
            // ignore storage errors
          }
          set({ status: "unauthenticated", user: null, error: null });
        }
      },

      getCurrentUserName: async () => {
        // 스토어에 이미 있으면 그대로 반환
        const current = get().user?.name ?? null;
        if (current) return current;

        // 없으면 서버에서 갱신 시도
        try {
          const res = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          });
          if (!res.ok) return null;

          const data = (await res.json()) as Partial<AuthUser>;
          console.log(data);
          if (data?.user_uuid && data?.name) {
            const user: AuthUser = {
              user_uuid: data.user_uuid,
              name: data.name,
            };
            set({ user });
            if (get().status !== "authenticated")
              set({ status: "authenticated" });
            return user.name;
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
    {
      name: "auth-store", // localStorage key
      // HttpOnly 쿠키로 세션을 제어하므로 민감정보는 저장하지 않되,
      // UX를 위해 최소한의 user info는 저장합니다.
      // 세션 만료 시 checkAuth/refreshUser가 동기화합니다.
      partialize: (state) => ({
        user: state.user,
        status: state.status,
      }),
      version: 1,
      // 마이그레이션(필요 시)
      migrate: (persisted, version) => {
        return persisted as any;
      },
    }
  )
);

/**
 * 사용 예시
 *
 * 1) 앱 시작 시 클라이언트에서:
 *    useEffect(() => { useAuthStore.getState().checkAuth(); }, []);
 *
 * 2) 라우트 이동/포커스 때 세션 동기화:
 *    useEffect(() => {
 *      const onVis = () => useAuthStore.getState().refreshUser();
 *      window.addEventListener("visibilitychange", onVis);
 *      return () => window.removeEventListener("visibilitychange", onVis);
 *    }, []);
 *
 * 3) 유저명 필요할 때:
 *    const name = await useAuthStore.getState().getCurrentUserName();
 */
