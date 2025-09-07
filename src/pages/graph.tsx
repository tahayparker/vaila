// src/pages/graph.tsx
import { useState, useEffect } from "react";
import Head from "next/head";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDay } from "date-fns";
// UPDATED: Using User icon for the header
import { AlertCircle, User } from "lucide-react";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

// --- Data Structures ---
// UPDATED: Interface for professor data within a day's schedule
interface FrontendProfessorData {
  professor: string; // Changed from 'room'
  availability: number[];
}
// UPDATED: Interface for a day's schedule, containing professors
interface FrontendScheduleDay {
  day: string;
  professors: FrontendProfessorData[]; // Changed from 'rooms'
}
// --- End Data Structures ---

// Constants (Keep daysOfWeek, timeIntervals)
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const timeIntervals = [
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];

// --- Helper to get adjusted day index (Keep as is) ---
function getAdjustedDayIndex(): number {
  /* ... no change ... */
  const todayJsIndex = getDay(new Date());
  return todayJsIndex === 0 ? 6 : todayJsIndex - 1;
}

// --- Main Page Component ---
export default function GraphPage() {
  // State variable names remain the same, but type reflects new structure
  const [scheduleData, setScheduleData] = useState<FrontendScheduleDay[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() =>
    getAdjustedDayIndex(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isColumnCollapsed, setIsColumnCollapsed] = useState(false);

  // --- Data Fetching (Keep structure, check validation) ---
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // Assuming API endpoint remains /api/schedule but now serves professor data
    fetch("/api/schedule")
      .then((response) => {
        if (!response.ok) {
          return response
            .json()
            .then((errData) => {
              throw new Error(
                errData.error || `HTTP error! status: ${response.status}`,
              );
            })
            .catch(() => {
              throw new Error(`HTTP error! status: ${response.status}`);
            });
        }
        return response.json();
      })
      .then((data: FrontendScheduleDay[]) => {
        // Expecting updated data structure
        console.log("Fetched professor schedule data:", data);
        // Basic validation for the new structure
        if (
          !Array.isArray(data) ||
          data.length !== daysOfWeek.length ||
          !data.every((day) => Array.isArray(day.professors))
        ) {
          // Check for professors array
          throw new Error("Invalid schedule data format received from API");
        }
        setScheduleData(data);
      })
      .catch((error) => {
        console.error("Error fetching schedule:", error);
        setError(error.message || "Failed to load schedule.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Handle window resize to reset column state on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsColumnCollapsed(false);
      } else {
        // Start opened on mobile as well
        setIsColumnCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Animation Variants (Keep as is) ---
  const pageContainerVariants = {
    /* ... no change ... */ hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };
  const headerSectionVariants = {
    /* ... no change ... */ hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.1, duration: 0.4, ease: "easeOut" },
    },
  };
  const tableContainerVariants = {
    /* ... no change ... */ hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 0.1, duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
  };
  const tableRowVariants = {
    /* ... no change ... */ hidden: { opacity: 0, x: -15 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.025, duration: 0.3, ease: "easeOut" },
    }),
    exit: { opacity: 0, x: 15, transition: { duration: 0.15, ease: "easeIn" } },
  };

  // Column animation variants
  const columnVariants = {
    expanded: {
      width: "auto",
      minWidth: "200px",
      transition: {
        type: "tween",
        duration: 0.15,
        ease: "easeInOut",
      },
    },
    collapsed: {
      width: "48px",
      minWidth: "48px",
      transition: {
        type: "tween",
        duration: 0.15,
        ease: "easeInOut",
      },
    },
  };

  const textVariants = {
    expanded: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "tween",
        duration: 0.1,
        ease: "easeOut",
      },
    },
    collapsed: {
      opacity: 0,
      scale: 0.8,
      transition: {
        type: "tween",
        duration: 0.1,
        ease: "easeIn",
      },
    },
  };

  const initialsVariants = {
    expanded: {
      opacity: 0,
      scale: 0.8,
      transition: {
        type: "tween",
        duration: 0.1,
        ease: "easeIn",
      },
    },
    collapsed: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "tween",
        duration: 0.1,
        ease: "easeOut",
      },
    },
  };

  // --- Helper Functions ---
  // getCellColor remains the same
  const getCellColor = (avail: number) => {
    return avail === 1 ? "bg-green-500/70" : "bg-red-600/80";
  };
  // UPDATED: Helper to get professor name safely
  const getProfessorName = (
    profIdentifier: string | null | undefined,
  ): string => {
    return profIdentifier || "Unknown Professor";
  };

  // Helper to get professor initials from first two names
  const getProfessorInitials = (
    profIdentifier: string | null | undefined,
  ): string => {
    const name = getProfessorName(profIdentifier);
    const words = name.split(" ").filter((word) => word.length > 0);
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    } else if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return "UN";
  };

  // Get data for the currently selected day
  const currentDayData = scheduleData[selectedDayIndex];

  // --- Render Page Content ---
  return (
    <motion.div
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      // Adjusted layout classes slightly
      className="w-full mx-auto px-0 py-6 pt-20 md:pt-24 flex flex-col h-screen"
    >
      <Head>
        {/* UPDATED Title */}
        <title>Professor Availability Graph - vaila</title>
      </Head>

      {/* Header Section (Title + Dropdown) */}
      <motion.div
        variants={headerSectionVariants}
        className="px-4 md:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 flex-shrink-0"
      >
        {/* UPDATED Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-center md:text-left text-white flex-shrink-0">
          {" "}
          Professor Availability Graph{" "}
        </h1>
        {/* Day Selector Dropdown (Keep as is) */}
        <div className="flex items-center justify-center md:justify-end gap-2 flex-grow">
          <label
            htmlFor="day-select"
            className="text-sm font-medium text-gray-300 hidden sm:block"
          >
            Select Day:
          </label>
          <Select
            value={selectedDayIndex.toString()}
            onValueChange={(value) => setSelectedDayIndex(parseInt(value, 10))}
          >
            <SelectTrigger
              id="day-select"
              className="w-full sm:w-[180px] bg-black/20 border-white/20 text-white focus:ring-purple-500 focus:border-purple-500"
            >
              {" "}
              <SelectValue placeholder="Select a day" />{" "}
            </SelectTrigger>
            <SelectContent
              className={`bg-black/80 backdrop-blur-md border-white/20 text-white font-sans ${montserrat.variable}`}
            >
              {" "}
              {daysOfWeek.map((day, index) => (
                <SelectItem
                  key={index}
                  value={index.toString()}
                  className="focus:bg-purple-600/30 focus:text-white"
                >
                  {" "}
                  {day}{" "}
                </SelectItem>
              ))}{" "}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Schedule Table Area */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          // Loader (Keep as is)
          <motion.div
            key="loader-graph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-grow items-center justify-center pt-10"
          >
            {" "}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>{" "}
          </motion.div>
        ) : error ? (
          // Error display (Keep as is)
          <motion.div
            key="error-graph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-7xl mx-auto px-4 py-10 text-center pt-10"
          >
            {" "}
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-red-300 max-w-md mx-auto flex flex-col items-center gap-4">
              {" "}
              <AlertCircle className="w-8 h-8 text-red-400" />{" "}
              <p className="font-medium">Error loading schedule:</p>{" "}
              <p className="text-sm">{error}</p>{" "}
            </div>{" "}
          </motion.div>
        ) : // UPDATED: Check for currentDayData.professors
        currentDayData?.professors && currentDayData.professors.length > 0 ? (
          <motion.div
            key={`table-container-${selectedDayIndex}`}
            variants={tableContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative flex-grow flex flex-col min-h-0 px-4 pb-4" // Added px-4 pb-4
          >
            {/* Scrollable Container */}
            <div className="w-full overflow-auto flex-grow min-h-0 hide-scrollbar border-l border-t border-b border-white/15 rounded-lg shadow-lg bg-black/20 backdrop-blur-sm">
              <table className="border-separate border-spacing-0 w-full min-w-[1400px]">
                {" "}
                {/* Ensure minimum width */}
                <thead className="sticky top-0 z-30">
                  <tr>
                    {/* UPDATED: Header for Professor column */}
                    <motion.th
                      className="sticky left-0 top-0 bg-black text-white z-40 border-r border-b border-white/15 text-right text-sm font-semibold cursor-pointer hover:bg-zinc-900 transition-all duration-300 ease-in-out md:cursor-default md:hover:bg-black overflow-hidden"
                      variants={columnVariants}
                      animate={isColumnCollapsed ? "collapsed" : "expanded"}
                      onClick={() => {
                        // Only toggle on mobile (screen width < 768px)
                        if (window.innerWidth < 768) {
                          setIsColumnCollapsed(!isColumnCollapsed);
                        }
                      }}
                    >
                      <div className="h-full w-full px-3 py-3 flex items-center justify-center min-h-[48px] relative">
                        <AnimatePresence mode="wait">
                          {isColumnCollapsed ? (
                            <motion.div
                              key="initials"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{
                                type: "tween",
                                duration: 0.1,
                                ease: "easeOut",
                              }}
                              className="flex items-center justify-center"
                            >
                              <User className="w-4 h-4 opacity-80 flex-shrink-0" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="full-text"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{
                                type: "tween",
                                duration: 0.1,
                                ease: "easeOut",
                              }}
                              className="flex items-center justify-end gap-1.5 w-full"
                            >
                              <User className="w-4 h-4 opacity-80 flex-shrink-0" />
                              <span>Professor</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.th>
                    {/* Time Interval Headers (Keep as is) */}
                    {timeIntervals.map((time, index) => (
                      <th
                        key={time}
                        className={`sticky top-0 bg-black text-white z-30 px-3 py-3 border-b border-white/15 text-center text-xs md:text-sm font-medium whitespace-nowrap ${index === timeIntervals.length - 1 ? "" : "border-r border-white/15"}`}
                        style={{ minWidth: "65px" }}
                      >
                        {" "}
                        {time}{" "}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="relative z-0">
                  <AnimatePresence initial={false}>
                    {/* UPDATED: Iterate over professors, sort by name */}
                    {currentDayData.professors
                      .sort((a, b) => {
                        const profA = getProfessorName(a?.professor);
                        const profB = getProfessorName(b?.professor);
                        return profA.localeCompare(profB);
                      })
                      .map((profData, profIndex) => {
                        // Basic check for valid data
                        if (
                          !profData ||
                          typeof profData.professor !== "string" ||
                          !Array.isArray(profData.availability)
                        )
                          return null;
                        return (
                          <motion.tr
                            key={profData.professor} // Use professor name as key
                            custom={profIndex}
                            variants={tableRowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout="position"
                            className="group"
                          >
                            {/* Sticky Cell - Professor Name */}
                            <motion.td
                              className="sticky left-0 bg-black group-hover:bg-zinc-900 text-white z-20 border-r border-b border-white/10 text-right text-sm transition-all duration-300 ease-in-out cursor-pointer md:cursor-default overflow-hidden"
                              variants={columnVariants}
                              animate={
                                isColumnCollapsed ? "collapsed" : "expanded"
                              }
                              onClick={() => {
                                // Only toggle on mobile (screen width < 768px)
                                if (window.innerWidth < 768) {
                                  setIsColumnCollapsed(!isColumnCollapsed);
                                }
                              }}
                              title={getProfessorName(profData.professor)}
                            >
                              <div className="h-full w-full px-3 py-1.5 flex items-center justify-center min-h-[36px] relative">
                                <AnimatePresence mode="wait">
                                  {isColumnCollapsed ? (
                                    <motion.div
                                      key={`initials-${profData.professor}`}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      transition={{
                                        type: "tween",
                                        duration: 0.1,
                                        ease: "easeOut",
                                      }}
                                      className="text-xs font-bold text-center flex items-center justify-center"
                                    >
                                      {getProfessorInitials(profData.professor)}
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      key={`full-${profData.professor}`}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      transition={{
                                        type: "tween",
                                        duration: 0.1,
                                        ease: "easeOut",
                                      }}
                                      className="text-right w-full whitespace-nowrap flex items-center justify-end"
                                    >
                                      {getProfessorName(profData.professor)}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.td>
                            {/* Data Cells - Professor Availability */}
                            {profData.availability.map((avail, idx) => (
                              <td
                                key={idx}
                                className={`relative z-0 border-b border-black/50 ${getCellColor(avail)} transition-colors duration-150 group-hover:brightness-110 ${idx === profData.availability.length - 1 ? "" : "border-r border-black/50"}`}
                                // UPDATED: Title attribute
                                title={`${getProfessorName(profData.professor)} - ${timeIntervals[idx]}`}
                                style={{ minWidth: "65px" }}
                              >
                                <div className="h-6"></div>{" "}
                                {/* Keep for consistent cell height */}
                              </td>
                            ))}
                          </motion.tr>
                        );
                      })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          // Case for no professor data for the selected day
          <motion.p
            key="empty-graph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-400 py-10 px-4"
          >
            {/* UPDATED: Empty state message */}
            No schedule data available for professors on{" "}
            {daysOfWeek[selectedDayIndex]}.
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
