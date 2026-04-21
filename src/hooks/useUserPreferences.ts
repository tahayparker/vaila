// src/hooks/useUserPreferences.ts
//
// vaila has no auth — persist UI prefs in localStorage instead of
// Supabase user_metadata. Public shape stays identical so the
// consumer components (Onboarding, PWAInstallPrompt) did not need
// to change.

import { useState, useEffect, useCallback } from "react";

export interface UserPreferences {
  hasSeenOnboarding: boolean;
  hasSeenPwaPrompt: boolean;
}

const STORAGE_KEY = "vaila:preferences";

function readStored(): UserPreferences {
  if (typeof window === "undefined") {
    return { hasSeenOnboarding: false, hasSeenPwaPrompt: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { hasSeenOnboarding: false, hasSeenPwaPrompt: false };
    const parsed = JSON.parse(raw);
    return {
      hasSeenOnboarding: Boolean(parsed?.hasSeenOnboarding),
      hasSeenPwaPrompt: Boolean(parsed?.hasSeenPwaPrompt),
    };
  } catch {
    return { hasSeenOnboarding: false, hasSeenPwaPrompt: false };
  }
}

function writeStored(next: UserPreferences) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota or unavailable */
  }
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    hasSeenOnboarding: false,
    hasSeenPwaPrompt: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPreferences(readStored());
    setIsLoading(false);
  }, []);

  const update = useCallback((patch: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...patch };
      writeStored(next);
      return next;
    });
  }, []);

  const markOnboardingAsSeen = useCallback(async () => {
    update({ hasSeenOnboarding: true });
  }, [update]);

  const resetOnboarding = useCallback(async () => {
    update({ hasSeenOnboarding: false });
  }, [update]);

  const markPwaPromptAsSeen = useCallback(async () => {
    update({ hasSeenPwaPrompt: true });
  }, [update]);

  return {
    preferences,
    isLoading,
    // Kept for API parity with the previous Supabase-backed hook.
    // Callers use this to decide whether to skip the "save to server"
    // paths; for vaila everything is local so we always return true.
    isAuthenticated: true,
    markOnboardingAsSeen,
    resetOnboarding,
    markPwaPromptAsSeen,
  };
}
