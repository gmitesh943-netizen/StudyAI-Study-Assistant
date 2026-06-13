"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useAppAuth } from "@/hooks/useAppAuth";

const FEATURE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/ai-tutor": "AI Tutor",
  "/dashboard/quiz": "Quiz",
  "/dashboard/notes": "Notes",
  "/dashboard/flashcards": "Flashcards",
  "/dashboard/planner": "Study Planner",
  "/dashboard/pdf": "PDF Tools",
  "/dashboard/courses": "Courses",
  "/dashboard/voice": "Voice Assistant",
  "/dashboard/settings": "Settings",
  "/dashboard/admin": "Admin",
};

function featureFromPath(pathname: string) {
  return FEATURE_LABELS[pathname] ?? pathname.split("/").filter(Boolean).pop()?.replaceAll("-", " ") ?? "Dashboard";
}

export function useUsageAnalytics() {
  const pathname = usePathname();
  const { getToken, isLoaded, isSignedIn } = useAppAuth();
  const lastFlushRef = useRef(0);
  const feature = useMemo(() => featureFromPath(pathname), [pathname]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let cancelled = false;
    lastFlushRef.current = Date.now();

    const send = async (event_type: "view" | "heartbeat" | "leave", duration_seconds = 0) => {
      try {
        const token = await getToken();
        if (!token || cancelled) return;
        await api.trackUsage({ path: pathname, feature, event_type, duration_seconds }, token);
      } catch {
        // Usage analytics should never interrupt study workflows.
      }
    };

    const flush = (eventType: "heartbeat" | "leave" = "heartbeat") => {
      const now = Date.now();
      const seconds = Math.max(1, Math.round((now - lastFlushRef.current) / 1000));
      lastFlushRef.current = now;
      send(eventType, seconds);
    };

    send("view");
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") flush("heartbeat");
    }, 30000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush("leave");
      else lastFlushRef.current = Date.now();
    };

    const onBeforeUnload = () => flush("leave");
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
      const seconds = Math.max(1, Math.round((Date.now() - lastFlushRef.current) / 1000));
      if (seconds >= 3) {
        getToken()
          .then((token) => {
            if (token) {
              api.trackUsage({ path: pathname, feature, event_type: "leave", duration_seconds: seconds }, token);
            }
          })
          .catch(() => {});
      }
    };
  }, [feature, getToken, isLoaded, isSignedIn, pathname]);
}
