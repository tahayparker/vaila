// src/pages/available-now.tsx
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
// UPDATED: Changed DoorOpen to UserCheck icon, kept AlertCircle, Clock, Users
import { UserCheck, AlertCircle, Clock, Users } from "lucide-react";
import { DateTime } from "luxon"; // Use Luxon for formatting
import { Button } from "@/components/ui/button";

// --- Data Structures (Client-side representation for Professors) ---
interface ProfessorInfo {
  name: string;
  // Add other fields if needed from API later
}
// API response structure expected by the client
interface ApiResponseData {
  checkedAt: string;
  professors: ProfessorInfo[]; // Expecting professors array
}
interface ApiErrorResponse {
  error: string;
}

// --- Constants ---
const DUBAI_TIMEZONE = "Asia/Dubai"; // For formatting display time

export default function AvailableNowPage() {
  // UPDATED: State variable names
  const [availableProfessors, setAvailableProfessors] = useState<
    ProfessorInfo[]
  >([]);
  const [checkedAt, setCheckedAt] = useState<string | null>(null); // Store ISO string from API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchInitiated = useRef(false); // Ref to prevent double fetch in Strict Mode

  // --- Data Fetching Function (Client-side) ---
  const fetchData = useCallback(async () => {
    setError(null);
    setCheckedAt(null);
    setAvailableProfessors([]); // Reset professor state
    console.log(
      "[AvailableNowPage Client - Professors] Fetching /api/available-now via POST...",
    );

    try {
      const response = await fetch("/api/available-now", { method: "POST" });
      console.log(
        `[AvailableNowPage Client - Professors] API Response status: ${response.status}`,
      );

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = (await response.json()) as ApiErrorResponse;
          errorMsg = errData.error || errorMsg;
        } catch (_e) {
          console.warn("Couldn't parse error response body:", _e);
        }
        throw new Error(errorMsg);
      }

      const data: ApiResponseData = await response.json();
      console.log(
        "[AvailableNowPage Client - Professors] Received data:",
        data,
      );
      // UPDATED: Validate the 'professors' array
      if (
        !data ||
        !Array.isArray(data.professors) ||
        typeof data.checkedAt !== "string"
      ) {
        throw new Error("Invalid data format received from API");
      }

      // UPDATED: Set state with professor data
      setAvailableProfessors(data.professors);
      setCheckedAt(data.checkedAt);
    } catch (err: any) {
      console.error(
        "[AvailableNowPage Client - Professors] Error fetching available professors:",
        err,
      );
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load available professors.",
      );
      setAvailableProfessors([]); // Ensure empty on error
    } finally {
      setIsLoading(false);
      console.log("[AvailableNowPage Client - Professors] Fetch finished.");
    }
  }, []); // No dependencies needed

  // --- Effect to Fetch Data ONCE on Mount (Keep as is) ---
  useEffect(() => {
    if (!fetchInitiated.current) {
      console.log(
        "[AvailableNowPage Client - Professors] useEffect initiating fetchData.",
      );
      fetchInitiated.current = true;
      setIsLoading(true);
      fetchData();
    } else {
      console.log(
        "[AvailableNowPage Client - Professors] useEffect ran again (Strict Mode?), fetch already initiated.",
      );
    }
  }, [fetchData]);

  // --- Format Timestamp using Luxon (Keep as is) ---
  const formattedCheckedTime = useMemo(() => {
    if (!checkedAt) return "--:--";
    try {
      return DateTime.fromISO(checkedAt)
        .setZone(DUBAI_TIMEZONE)
        .toFormat("h:mm a");
    } catch {
      return "Invalid Time";
    }
  }, [checkedAt]);
  const formattedCheckedDay = useMemo(() => {
    if (!checkedAt) return "Loading...";
    try {
      return DateTime.fromISO(checkedAt)
        .setZone(DUBAI_TIMEZONE)
        .toFormat("cccc, LLL d");
    } catch {
      return "Invalid Date";
    }
  }, [checkedAt]);

  // --- Animation Variants (Keep as is) ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.1, staggerChildren: 0.08 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  // --- Render Logic (Client-side) ---
  const renderContent = () => {
    // Error State - UPDATED message
    if (error && !isLoading) {
      return (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-8 text-center bg-red-950/70 border border-red-500/60 rounded-lg p-6 text-red-200 max-w-md mx-auto flex flex-col items-center gap-4"
        >
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="font-semibold text-red-100">
            Error loading professors:
          </p>{" "}
          {/* Updated text */}
          <p className="text-sm">{error}</p>
          <Button
            variant="destructive"
            onClick={() => {
              fetchInitiated.current = false;
              setIsLoading(true);
              fetchData();
            }}
            className="mt-4 px-4 py-2 bg-red-600/50 hover:bg-red-600/60 rounded-md text-red-100 text-sm font-medium transition-colors"
          >
            Try Again
          </Button>
        </motion.div>
      );
    }

    // Loading, Empty, List States
    return (
      <AnimatePresence mode="wait">
        {isLoading ? (
          // Loader (Keep as is)
          <motion.div
            key="loader-now"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-20"
          >
            {" "}
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400"></div>{" "}
          </motion.div>
        ) : availableProfessors.length === 0 ? (
          // Empty State - UPDATED message
          <motion.p
            key="empty-now"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-400 py-10"
          >
            {" "}
            No professors appear to be available right now.{" "}
          </motion.p>
        ) : (
          // List State - UPDATED rendering
          <motion.ul
            key="list-now"
            className="flex flex-wrap justify-center gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {availableProfessors.map((prof) => (
              <motion.li
                key={prof.name}
                /* Use name as key if unique */ variants={itemVariants}
                layout
                className="w-fit bg-black/20 border border-white/15 rounded-full shadow-lg backdrop-blur-sm px-4 py-2 flex items-center gap-2.5 hover:bg-white/10 hover:border-white/25 transition-all duration-200 group cursor-default"
              >
                {/* UPDATED Icon */}
                <UserCheck className="w-4 h-4 text-purple-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                {/* UPDATED Display: Just professor name */}
                <span
                  className="text-white text-sm font-medium truncate"
                  title={prof.name}
                >
                  {" "}
                  {prof.name}{" "}
                </span>
                {/* Removed capacity display */}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    );
  };

  // --- Render Page Structure (Client-side) ---
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 pt-20 md:pt-24 flex-grow flex flex-col">
      <Head>
        {/* UPDATED Title */}
        <title>Available Now - vaila</title>
      </Head>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
      >
        <div className="text-center">
          {/* UPDATED Heading */}
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center text-white inline-block mr-2">
            {" "}
            Professors Available Now{" "}
          </h1>
          {/* UPDATED Count */}
          {!isLoading && !error && (
            <span className="inline-flex items-center gap-1.5 text-lg text-purple-300 font-medium align-middle">
              <Users className="w-5 h-5" />({availableProfessors.length})
            </span>
          )}
        </div>
        {/* Timestamp (Keep as is) */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
          <Clock className="w-4 h-4" />
          <span>
            {" "}
            Checked{" "}
            <span className="font-medium text-gray-300">
              {formattedCheckedDay}
            </span>{" "}
            at ~
            <span className="font-medium text-gray-300">
              {formattedCheckedTime}
            </span>{" "}
          </span>
        </div>
      </motion.div>

      <div className="flex-grow">
        {renderContent()} {/* Render the appropriate content */}
      </div>
    </div>
  );
}
