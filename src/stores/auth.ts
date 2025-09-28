"use client";

import { create } from "zustand";

type AuthStatus = "idle" | "checking" | "authenticated" | "unauthenticated";

interface AuthUser {
  // Extend as needed once user shape is known
  id?: string;
  name?: string;
  provider?: string;
}

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  checkAuth: () => Promise<void>;
  setAuthenticated: (user?: AuthUser | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "idle",
  user: null,
  error: null,

  checkAuth: async () => {
    set({ status: "checking", error: null });
    try {
      const res = await fetch("/api/auth/test", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
        credentials: "include",
      });

      if (res.ok) {
        // If API returns user info later, parse here
        set({ status: "authenticated", user: null, error: null });
      } else if (res.status === 401) {
        set({ status: "unauthenticated", user: null });
      } else {
        set({ status: "unauthenticated", user: null, error: "auth_error" });
      }
    } catch (err) {
      set({ status: "unauthenticated", user: null, error: "network_error" });
    }
  },

  setAuthenticated: (user: AuthUser | null = null) => {
    set({ status: "authenticated", user, error: null });
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {
      // ignore
    } finally {
      set({ status: "unauthenticated", user: null, error: null });
    }
  },
}));

