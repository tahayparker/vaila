// src/contexts/TimeFormatContext.tsx
//
// Persists the 12/24-hour toggle in localStorage. vaila has no auth,
// so there is no server-side preferences store — the toggle is
// device-local.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface TimeFormatContextValue {
  use24h: boolean;
  setTimeFormat: (use24h: boolean) => Promise<void>;
  isLoading: boolean;
}

const TimeFormatContext = createContext<TimeFormatContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "vaila:time-format";

export function TimeFormatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [use24h, setUse24h] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        setUse24h(raw === "24");
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setTimeFormat = useCallback(async (newUse24h: boolean) => {
    setUse24h(newUse24h);
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, newUse24h ? "24" : "12");
    } catch {
      /* quota / unavailable */
    }
  }, []);

  return (
    <TimeFormatContext.Provider value={{ use24h, setTimeFormat, isLoading }}>
      {children}
    </TimeFormatContext.Provider>
  );
}

export function useTimeFormat() {
  const context = useContext(TimeFormatContext);
  if (context === undefined) {
    throw new Error("useTimeFormat must be used within a TimeFormatProvider");
  }
  return context;
}
