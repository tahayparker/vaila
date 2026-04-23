// src/hooks/useUserPreferences.ts
// vaila has no auth — no user preferences stored since we don't require signins
// and don't want to save any user metadata

import { useState, useEffect } from "react";

export function useUserPreferences() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return {
    // Empty preferences object since we don't store any user preferences
    preferences: {},
    isLoading,
    // For API compatibility - always true since we don't have auth
    isAuthenticated: true,
    // No-op functions for compatibility
    markPwaPromptAsSeen: async () => {},
  };
}
