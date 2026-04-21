// src/pages/available-soon.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
// UPDATED: Changed DoorOpen to UserCheck icon
import { UserCheck, AlertCircle, Clock, Users } from "lucide-react";
// Keep date-fns for parsing ISO string, but Luxon could also be used here
import { parseISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

// --- Data Structures ---
// UPDATED: Professor Info structure
interface ProfessorInfo {
  name: string /* Add others if needed */;
}
// UPDATED: API Response structure
interface ApiResponseData {
  checkedAtFutureTime: string;
  professors: ProfessorInfo[];
}
interface ApiErrorResponse {
  error: string;
}

// --- Duration Options (Keep as is) ---
const durationOptions = [
  { label: "in 30 minutes", value: 30 },
  { label: "in 1 hour", value: 60 },
  { label: "in 1.5 hours", value: 90 },
  { label: "in 2 hours", value: 120 },
];

// --- UTC+4 Timezone Identifier (Keep as is) ---
const TARGET_TIMEZONE = "Etc/GMT-4"; // Represents UTC+4

// --- REMOVED Room Groupings ---

export default function AvailableSoonPage() {
  // UPDATED: State variable names
  const [availableProfessors, setAvailableProfessors] = useState<
    ProfessorInfo[]
  >([]);
  const [selectedDuration, setSelectedDuration] = useState<number>(
    durationOptions[0].value,
  );
  const [checkedAtFutureTime, setCheckedAtFutureTime] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching and Filtering ---
  const fetchData = useCallback(async (duration: number) => {
    setIsLoading(true);
    setError(null);
    setCheckedAtFutureTime(null);
    setAvailableProfessors([]);
    console.log(
      `[AvailableSoonPage - Professors] Fetching for duration: ${duration} minutes`,
    );
    try {
      const response = await fetch("/api/available-soon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationMinutes: duration }),
      });
      const responseTimestamp = new Date(); // Keep fallback timestamp
      console.log(
        `[AvailableSoonPage - Professors] API Response status: ${response.status}`,
      );
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errData = (await response.json()) as ApiErrorResponse;
            if (errData && typeof errData.error === "string") {
              errorMsg = errData.error;
            }
          } else {
            const textError = await response.text();
            console.warn("API error response was not JSON:", textError);
            errorMsg = textError.length < 100 ? textError : errorMsg;
          }
        } catch (_e) {
          console.warn(
            "Couldn't parse error response body or read as text:",
            _e,
          );
        }
        throw new Error(errorMsg);
      }
      const data: ApiResponseData = await response.json();
      console.log(
        "[AvailableSoonPage - Professors] Received initial data:",
        data,
      );
      // UPDATED: Validate 'professors' array
      if (
        !data ||
        !Array.isArray(data.professors) ||
        typeof data.checkedAtFutureTime !== "string"
      ) {
        throw new Error("Invalid data format received from API");
      }

      // REMOVED: Client-side room filtering logic

      // UPDATED: Set state with professor data directly from API
      setAvailableProfessors(data.professors);
      setCheckedAtFutureTime(
        data.checkedAtFutureTime || responseTimestamp.toISOString(),
      );
    } catch (err: any) {
      console.error(
        "[AvailableSoonPage - Professors] Error fetching/processing available professors:",
        err,
      );
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setAvailableProfessors([]);
    } finally {
      setIsLoading(false);
      console.log("[AvailableSoonPage - Professors] Fetch finished.");
    }
  }, []);

  // Effect to fetch data when duration changes (Keep as is)
  useEffect(() => {
    fetchData(selectedDuration);
  }, [selectedDuration, fetchData]);

  // --- Format Timestamp in UTC+4 (Keep as is) ---
  const formattedCheckedTime = useMemo(() => {
    if (!checkedAtFutureTime) return "--:--";
    try {
      const dateObj = parseISO(checkedAtFutureTime);
      return dateObj.toLocaleTimeString("en-US", {
        timeZone: TARGET_TIMEZONE,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid Time";
    }
  }, [checkedAtFutureTime]);
  const formattedCheckedDay = useMemo(() => {
    if (!checkedAtFutureTime) return "Loading...";
    try {
      const dateObj = parseISO(checkedAtFutureTime);
      return dateObj.toLocaleDateString("en-US", {
        timeZone: TARGET_TIMEZONE,
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  }, [checkedAtFutureTime]);

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

  // --- Render Logic ---
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
          {" "}
          <AlertCircle className="w-8 h-8 text-red-400" />{" "}
          <p className="font-semibold text-red-100">
            Error loading professors:
          </p>{" "}
          <p className="text-sm">{error}</p>{" "}
          <Button
            variant="destructive"
            onClick={() => fetchData(selectedDuration)}
            className="mt-4 px-4 py-2 bg-red-600/50 hover:bg-red-600/60 rounded-md text-red-100 text-sm font-medium transition-colors"
          >
            {" "}
            Try Again{" "}
          </Button>{" "}
        </motion.div>
      );
    }
    // Loading, Empty, List States
    return (
      <AnimatePresence mode="wait">
        {isLoading ? (
          // Loader (Keep as is)
          <motion.div
            key="loader-soon"
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
            key="empty-soon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-400 py-10"
          >
            {" "}
            No professors seem to be available around {formattedCheckedTime}
            .{" "}
          </motion.p>
        ) : (
          // List State - UPDATED rendering
          <motion.ul
            key={`list-soon-${selectedDuration}`}
            className="flex flex-wrap justify-center gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {availableProfessors.map((prof) => (
              <motion.li
                key={prof.name}
                /* Use name as key */ variants={itemVariants}
                layout
                className="w-fit bg-black/20 border border-white/15 rounded-full shadow-lg backdrop-blur-sm px-4 py-2 flex items-center gap-2.5 hover:bg-white/10 hover:border-white/25 transition-all duration-200 group cursor-default"
              >
                {/* UPDATED Icon */}
                <UserCheck className="w-4 h-4 text-purple-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                {/* UPDATED Display */}
                <span
                  className="text-white text-sm font-medium truncate"
                  title={prof.name}
                >
                  {" "}
                  {prof.name}{" "}
                </span>
                {/* Removed capacity */}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    );
  };

  // --- Render Page Content ---
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 pt-20 md:pt-24 flex-grow flex flex-col">
      <Head>
        {/* UPDATED Title */}
        <title>Available Soon - vaila</title>
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
            Professors Available Soon{" "}
          </h1>
          {/* UPDATED Count */}
          {!isLoading && !error && (
            <span className="inline-flex items-center gap-1.5 text-lg text-purple-300 font-medium align-middle">
              {" "}
              <Users className="w-5 h-5" /> ({availableProfessors.length}){" "}
            </span>
          )}
        </div>
        {/* Timestamp Display (Keep as is) */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
          <Clock className="w-4 h-4" />
          <span>
            {" "}
            Checking availability for ~
            <span className="font-medium text-gray-300">
              {formattedCheckedTime}
            </span>{" "}
            on{" "}
            <span className="font-medium text-gray-300">
              {formattedCheckedDay}
            </span>{" "}
          </span>
        </div>
        {/* Duration Select (Keep as is) */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <label
            htmlFor="duration-select"
            className="text-sm font-medium text-gray-300"
          >
            Show professors available:
          </label>
          <Select
            value={selectedDuration.toString()}
            onValueChange={(value) => setSelectedDuration(parseInt(value, 10))}
          >
            <SelectTrigger
              id="duration-select"
              className="w-[180px] bg-black/20 border-white/20 text-white focus:ring-purple-500 focus:border-purple-500"
            >
              {" "}
              <SelectValue placeholder="Select duration" />{" "}
            </SelectTrigger>
            <SelectContent
              className={`bg-black/80 backdrop-blur-md border-white/20 text-white font-sans ${montserrat.className}`}
            >
              {" "}
              {durationOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value.toString()}
                  className="focus:bg-purple-600/30 focus:text-white"
                >
                  {" "}
                  {option.label}{" "}
                </SelectItem>
              ))}{" "}
            </SelectContent>
          </Select>
        </div>
      </motion.div>
      <div className="flex-grow"> {renderContent()} </div>
    </div>
  );
}
