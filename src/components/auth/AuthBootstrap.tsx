"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";

export default function AuthBootstrap() {
  const status = useAuthStore((s) => s.status);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    // Only trigger once when idle to avoid redundant calls
    if (status === "idle") {
      checkAuth();
    }
  }, [status, checkAuth]);

  return null;
}

