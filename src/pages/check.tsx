// src/pages/check.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  X,
  Calendar,
  ChevronsUpDown,
  CircleX,
  Loader2, // Keep Loader2 for the submit button spinner
  Users,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  format,
  getDay,
  setHours,
  setMinutes,
  startOfDay,
  addMinutes,
} from "date-fns";
import Fuse from "fuse.js";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

// --- Data Structures ---
// Interface for data fetched for the dropdown (name is sufficient)
interface ScheduledTeacherData {
  name: string;
}
// Interface for conflict details (remains the same)
interface ConflictDetails {
  subject: string;
  professor: string;
  startTime: string;
  endTime: string;
  room: string;
  classType: string;
}
// Interface for the check result from /api/check-availability (remains the same)
interface CheckResult {
  available: boolean;
  checked: {
    professorName: string;
    day: string;
    startTime: string;
    endTime: string;
  };
  classes?: ConflictDetails[];
  message?: string;
}

// --- Constants ---
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MIN_HOUR = 7;
const MAX_HOUR = 23;
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const referenceDate = startOfDay(new Date());
  const start = setMinutes(setHours(referenceDate, MIN_HOUR), 0);
  const end = setMinutes(setHours(referenceDate, MAX_HOUR), 0);
  let current = start;
  while (current <= end) {
    slots.push(format(current, "HH:mm"));
    current = addMinutes(current, 30);
  }
  return slots;
}
const timeSlots = generateTimeSlots();

// --- Main Page Component ---
export default function CheckAvailabilityPage() {
  // --- State ---
  const [selectedTeacher, setSelectedTeacher] =
    useState<ScheduledTeacherData | null>(null); // State holds the selected teacher {name: string}
  const [allTeachers, setAllTeachers] = useState<ScheduledTeacherData[]>([]); // State holds the list fetched from the new API
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [teacherFetchError, setTeacherFetchError] = useState<string | null>(
    null,
  );
  const [day, setDay] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);

  // --- Fetch Teachers (FOR DROPDOWN) ---
  useEffect(() => {
    const fetchScheduledTeachers = async () => {
      setIsLoadingTeachers(true);
      setTeacherFetchError(null);
      setFormError(null); // Clear form error on fetch attempt
      try {
        // *** FETCH FROM NEW ENDPOINT ***
        const response = await fetch("/api/scheduled-teachers");
        if (!response.ok) {
          let errorMsg = "Failed to fetch scheduled teachers list";
          try {
            const errData = await response.json();
            errorMsg = errData.error || `API Error (${response.status})`;
          } catch {
            /* ignore parsing error */
          }
          throw new Error(errorMsg);
        }
        // Data is expected to be { name: string }[]
        const data: ScheduledTeacherData[] = await response.json();
        setAllTeachers(data);
        setTeacherFetchError(null);
      } catch (err: any) {
        console.error("Error fetching scheduled teachers:", err);
        setTeacherFetchError(
          err.message || "Could not load scheduled teacher list.",
        );
        setAllTeachers([]);
      } finally {
        setIsLoadingTeachers(false);
      }
    };
    fetchScheduledTeachers();
  }, []); // Empty dependency array means run once on mount

  // --- Fuzzy Search ---
  const fuse = useMemo(() => {
    if (allTeachers.length === 0) return null;
    // Initialize Fuse with the list of { name: string } objects
    return new Fuse(allTeachers, { keys: ["name"], threshold: 0.4 });
  }, [allTeachers]);

  const filteredTeachers = useMemo(() => {
    if (!fuse || searchQuery === "") return allTeachers;
    // Fuse search returns results containing the original items
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, allTeachers, fuse]);

  // --- Event Handlers ---
  const handleNow = useCallback(() => {
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const startMinutes = currentMinutes < 30 ? 0 : 30;
    const startTimeExact = setMinutes(
      setHours(now, now.getHours()),
      startMinutes,
    );
    const endMinutes = startMinutes === 0 ? 30 : 0;
    const endHour = startMinutes === 0 ? now.getHours() : now.getHours() + 1;
    const endTimeExact = setMinutes(setHours(now, endHour), endMinutes);
    const todayJsIndex = getDay(now);
    const todayAdjusted = todayJsIndex === 0 ? 6 : todayJsIndex - 1;
    if (!day) {
      setDay(daysOfWeek[todayAdjusted]);
    }
    setStartTime(format(startTimeExact, "HH:mm"));
    const endFormatted = format(endTimeExact, "HH:mm");
    if (timeSlots.includes(endFormatted)) {
      setEndTime(endFormatted);
    } else {
      setEndTime(timeSlots[timeSlots.length - 1]);
    }
    setFormError(null);
    setCheckResult(null);
  }, [day]);
  const handleAllDay = useCallback(() => {
    if (!day) {
      const todayJsIndex = getDay(new Date());
      const todayAdjusted = todayJsIndex === 0 ? 6 : todayJsIndex - 1;
      setDay(daysOfWeek[todayAdjusted]);
    }
    setStartTime(timeSlots[0]);
    setEndTime(timeSlots[timeSlots.length - 1]);
    setFormError(null);
    setCheckResult(null);
  }, [day]);
  const handleReset = useCallback(() => {
    setSelectedTeacher(null);
    setSearchQuery("");
    setDay("");
    setStartTime("");
    setEndTime("");
    setFormError(null);
    setCheckResult(null);
    setComboboxOpen(false);
  }, []);

  // Submit Handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setCheckResult(null);
      if (teacherFetchError) {
        setFormError("Cannot check availability: Teacher list failed to load.");
        return;
      }
      if (!selectedTeacher || !day || !startTime || !endTime) {
        setFormError(
          "Please select a professor, day, start time, and end time.",
        );
        return;
      }
      if (startTime >= endTime) {
        setFormError("End time must be after start time.");
        return;
      }
      setIsChecking(true);
      try {
        const response = await fetch("/api/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            professorName: selectedTeacher.name,
            day: day,
            startTime: startTime,
            endTime: endTime,
          }),
        });
        if (!response.ok) {
          let errorMsg = `API Error: ${response.status}`;
          try {
            const errData = await response.json();
            errorMsg = errData.error || errorMsg;
          } catch {
            /* ignore */
          }
          throw new Error(errorMsg);
        }
        const data: CheckResult = await response.json();
        setCheckResult(data);
      } catch (err: any) {
        console.error("Check availability error:", err);
        setFormError(err.message || "Failed to check availability.");
        setCheckResult(null);
      } finally {
        setIsChecking(false);
      }
    },
    [selectedTeacher, day, startTime, endTime, teacherFetchError],
  );

  // --- Animation Variants ---
  const formItemVariant = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" },
    }),
  };
  const resultVariant = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      height: "auto",
      marginTop: "2rem",
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      height: 0,
      marginTop: 0,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };
  const alertStyleSuccess =
    "bg-green-950/50 border-green-500/60 text-green-100";
  const alertStyleDestructive = "bg-red-950/30 border-red-500/60 text-red-100";
  const alertStyleWarning =
    "bg-yellow-950/80 border-yellow-600/80 text-yellow-100";

  // --- Render ---
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pt-20 md:pt-24 flex-grow flex flex-col">
      <Head>
        {" "}
        <title>Check Availability - vaila</title>{" "}
      </Head>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-3xl md:text-4xl font-bold mb-10 text-center text-white"
      >
        {" "}
        Check Professor Availability{" "}
      </motion.h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
      >
        {/* Professor Selector */}
        <motion.div
          variants={formItemVariant}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <label
            htmlFor="teacher-search"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            {" "}
            Professor{" "}
          </label>
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={comboboxOpen}
                disabled={isLoadingTeachers || !!teacherFetchError}
                className={`w-full justify-between bg-black/20 border-white/20 hover:bg-black/30 hover:border-white/30 text-white disabled:opacity-70 disabled:cursor-not-allowed font-sans ${montserrat.className}`}
              >
                <span className="flex items-center justify-between w-full">
                  <span
                    className={`truncate flex items-center gap-2 font-sans ${montserrat.className}`}
                  >
                    {" "}
                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />{" "}
                    {isLoadingTeachers
                      ? "Loading professors..."
                      : teacherFetchError
                        ? "Error loading professors"
                        : selectedTeacher
                          ? selectedTeacher.name
                          : "Select professor..."}{" "}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={`max-h-[--radix-popover-content-available-height] p-0 bg-black/80 backdrop-blur-md border-white/20 text-white font-sans ${montserrat.className}`}
              style={{
                width: "var(--radix-popover-trigger-width)",
              }}
            >
              {isLoadingTeachers ? (
                <div className="flex items-center justify-center p-4 h-20">
                  {" "}
                  <Loader2 className="h-6 w-6 animate-spin text-purple-400" />{" "}
                </div>
              ) : teacherFetchError ? (
                <div className="p-4 text-center text-sm text-red-300">
                  {" "}
                  {teacherFetchError}{" "}
                </div>
              ) : (
                <Command shouldFilter={false}>
                  {" "}
                  <CommandInput
                    placeholder="Search professor..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    className={`h-9 text-white placeholder:text-gray-400 border-0 border-b border-white/20 rounded-none ring-offset-0 focus-visible:ring-0 focus-visible:border-b-purple-500 font-sans ${montserrat.className}`}
                  />{" "}
                  <CommandList className="hide-scrollbar">
                    {" "}
                    <CommandEmpty>No professor found.</CommandEmpty>{" "}
                    <CommandGroup>
                      {" "}
                      {filteredTeachers.map((teacher) => (
                        <CommandItem
                          key={teacher.name}
                          value={teacher.name}
                          onSelect={(currentValue) => {
                            const foundTeacher = allTeachers.find(
                              (t) =>
                                t.name.toLowerCase() ===
                                currentValue.toLowerCase(),
                            );
                            setSelectedTeacher(foundTeacher || null);
                            setComboboxOpen(false);
                            setSearchQuery("");
                          }}
                          className={`font-sans aria-selected:bg-purple-600/30 aria-selected:text-white text-sm cursor-pointer font-sans ${montserrat.className}`}
                        >
                          {" "}
                          {teacher.name}{" "}
                        </CommandItem>
                      ))}{" "}
                    </CommandGroup>{" "}
                  </CommandList>{" "}
                </Command>
              )}
            </PopoverContent>
          </Popover>
        </motion.div>

        {/* Day Selector */}
        <motion.div
          variants={formItemVariant}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <label
            htmlFor="day"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Day
          </label>
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger
              id="day"
              className="w-full bg-black/20 border-white/20 text-white focus:ring-purple-500 focus:border-purple-500"
            >
              {" "}
              <SelectValue placeholder="Select a day" />{" "}
            </SelectTrigger>
            <SelectContent
              className={`bg-black/80 backdrop-blur-md border-white/20 text-white font-sans ${montserrat.className}`}
            >
              {" "}
              {daysOfWeek.map((d) => (
                <SelectItem
                  key={d}
                  value={d}
                  className="font-sans focus:bg-purple-600/30 focus:text-white"
                >
                  {d}
                </SelectItem>
              ))}{" "}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Start Time Selector */}
        <motion.div
          variants={formItemVariant}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Start Time
          </label>
          <Select value={startTime} onValueChange={setStartTime}>
            <SelectTrigger
              id="startTime"
              className="w-full bg-black/20 border-white/20 text-white focus:ring-purple-500 focus:border-purple-500"
            >
              {" "}
              <SelectValue placeholder="Select start time" />{" "}
            </SelectTrigger>
            <SelectContent
              className={`bg-black/80 backdrop-blur-md border-white/20 text-white max-h-60 font-sans ${montserrat.className}`}
            >
              {" "}
              {timeSlots.map((t) => (
                <SelectItem
                  key={`start-${t}`}
                  value={t}
                  className="font-sans focus:bg-purple-600/30 focus:text-white"
                >
                  {t}
                </SelectItem>
              ))}{" "}
            </SelectContent>
          </Select>
        </motion.div>

        {/* End Time Selector */}
        <motion.div
          variants={formItemVariant}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            End Time
          </label>
          <Select value={endTime} onValueChange={setEndTime}>
            <SelectTrigger
              id="endTime"
              className="w-full bg-black/20 border-white/20 text-white focus:ring-purple-500 focus:border-purple-500"
            >
              {" "}
              <SelectValue placeholder="Select end time" />{" "}
            </SelectTrigger>
            <SelectContent
              className={`bg-black/80 backdrop-blur-md border-white/20 text-white max-h-60 font-sans ${montserrat.className}`}
            >
              {" "}
              {timeSlots.map((t) => (
                <SelectItem
                  key={`end-${t}`}
                  value={t}
                  className="font-sans focus:bg-purple-600/30 focus:text-white"
                >
                  {t}
                </SelectItem>
              ))}{" "}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={formItemVariant}
          initial="hidden"
          animate="visible"
          custom={4}
          className="md:col-span-2 grid grid-cols-2 md:flex md:flex-wrap gap-3 mt-3"
        >
          <Button
            type="submit"
            disabled={isChecking || isLoadingTeachers || !!teacherFetchError}
            className="md:flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5 py-2.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {" "}
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}{" "}
            <span className="hidden md:inline">Check Availability</span>
            <span className="md:hidden">Check</span>{" "}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleNow}
            className="md:w-auto rounded-full border-white/30 bg-white/10 hover:bg-white/20 px-5 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
          >
            {" "}
            <Clock className="w-4 h-4" /> Now{" "}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleAllDay}
            className="md:w-auto rounded-full border-white/30 bg-white/10 hover:bg-white/20 px-5 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
          >
            {" "}
            <Calendar className="w-4 h-4" /> All Day{" "}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="text-red-400 hover:bg-red-950/50 hover:text-red-300 border-red-500/40 hover:border-red-500/60 bg-black/30 rounded-full px-5 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
          >
            {" "}
            <X className="w-4 h-4" /> Reset{" "}
          </Button>
        </motion.div>
      </form>

      {/* Results Area */}
      <div className="mt-8 w-full">
        {formError && (
          <div key="form-error" className="mb-8">
            {" "}
            <Alert variant="destructive" className={alertStyleWarning}>
              {" "}
              <AlertCircle className="h-6 w-6 flex-shrink-0 self-start mt-1 text-yellow-300" />{" "}
              <div className="col-start-2">
                {" "}
                <AlertTitle className="text-lg font-semibold !text-yellow-100">
                  Input Error
                </AlertTitle>{" "}
                <AlertDescription className="text-yellow-100/90">
                  {formError}
                </AlertDescription>{" "}
              </div>{" "}
            </Alert>{" "}
          </div>
        )}
        <AnimatePresence mode="wait">
          {checkResult && (
            <motion.div
              key="check-result"
              variants={resultVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Professor Not Found/Info Message */}
              {checkResult.message && (
                <Alert
                  variant="default"
                  className={cn(alertStyleWarning, "items-start")}
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-300 mt-0.5" />
                  <div className="col-start-2">
                    <AlertTitle className="font-semibold !text-yellow-100 mb-1">
                      Information
                    </AlertTitle>
                    <AlertDescription className="text-yellow-100/90">
                      {checkResult.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {/* Availability Message */}
              {!checkResult.message && (
                <Alert
                  variant={checkResult.available ? undefined : "destructive"}
                  className={cn(
                    "transition-colors duration-300",
                    checkResult.available
                      ? alertStyleSuccess +
                          " flex items-center gap-3 !grid-cols-[auto_1fr]"
                      : alertStyleDestructive + " items-start",
                  )}
                >
                  {checkResult.available ? (
                    <>
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-300" />
                      <span className="text-base text-green-100 mt-0.5">
                        {" "}
                        Professor{" "}
                        <span className="font-semibold">
                          {checkResult.checked.professorName}
                        </span>{" "}
                        is available.{" "}
                      </span>
                    </>
                  ) : (
                    <>
                      <CircleX className="h-6 w-6 flex-shrink-0 self-start mt-1 !text-red-300" />
                      <div className="col-start-2">
                        <span className="block text-base text-red-100 font-medium mt-0.5">
                          {" "}
                          Professor{" "}
                          <span className="font-semibold">
                            {checkResult.checked.professorName}
                          </span>{" "}
                          is not available.{" "}
                        </span>
                        {/* Fallback Message Handling */}
                        {Array.isArray(checkResult.classes) &&
                        checkResult.classes.length > 0 ? (
                          <div className="mt-2 border-t border-red-400/80 pt-2">
                            <ul className="space-y-2.5">
                              {checkResult.classes?.map((c, index) => (
                                <li key={index} className="text-red-200/90">
                                  {" "}
                                  <div className="text-sm font-medium text-red-100">
                                    {" "}
                                    {c.subject} {c.classType} | {c.startTime} -{" "}
                                    {c.endTime}{" "}
                                  </div>{" "}
                                  <div className="font-mono text-sm text-red-200/80 flex items-center gap-1.5">
                                    {" "}
                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />{" "}
                                    {c.room}{" "}
                                  </div>{" "}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="mt-3">
                            <Alert
                              variant="default"
                              className={cn(
                                alertStyleWarning,
                                "py-2 px-3 flex items-start gap-2 !grid-cols-[auto_1fr]",
                              )}
                            >
                              <AlertCircle className="h-4 w-4 flex-shrink-0 text-yellow-300 mt-0.5" />
                              <AlertDescription className="text-sm text-yellow-100/90">
                                {" "}
                                Could not determine specific conflicts.
                                Availability check failed for unknown
                                reasons.{" "}
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </Alert>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
