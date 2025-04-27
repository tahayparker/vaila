// src/pages/teachers.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Search,
  ArrowUp,
  ArrowDown,
  User,
  Mail,
  Phone,
  Copy,
  Check,
  PhoneForwarded,
  PhoneCall,
  MoreHorizontal,
  X,
} from "lucide-react"; // Loader2 import needed again if we use it
import Fuse from "fuse.js";
import { cn } from "@/lib/utils";
// TooltipProvider import removed

// --- Data Structures ---
interface TeacherData {
  name: string;
  email: string | null;
  phone: string | null;
}
type SortKey = "name" | "email" | "phone";
interface SortConfig {
  key: SortKey | null;
  direction: "asc" | "desc";
}

// --- Constants ---
const FILTER_KEYWORDS = ["instructor", "adjunct", "tba", "new ", " ps"];

// --- Helper Function ---
const formatTelUriWithExtension = (
  baseNumber: string,
  extension: string | null,
  addPause: boolean = false,
): string => {
  if (!extension) return `tel:${baseNumber}`;
  const digitsOnlyExtension = extension.replace(/\D/g, "");
  if (!digitsOnlyExtension) return `tel:${baseNumber}`;
  const pause = addPause ? "," : "";
  return `tel:${baseNumber}${pause}${digitsOnlyExtension}`;
};

// --- Main Page Component ---
export default function TeacherDetailsPage() {
  // --- State ---
  const [allTeachers, setAllTeachers] = useState<TeacherData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  });
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const isSearching = searchQuery.trim() !== "";

  // --- Hooks ---
  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/teachers");
        if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
            const errData = await response.json();
            errorMsg = errData.error || errorMsg;
          } catch {
            /* ignore */
          }
          throw new Error(errorMsg);
        }
        const data: TeacherData[] = await response.json();
        setAllTeachers(data);
      } catch (err: any) {
        console.error("Error fetching teacher details:", err);
        setError(err.message || "Failed to load teacher details.");
        setAllTeachers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, []);
  const fuse = useMemo(() => {
    if (allTeachers.length === 0) return null;
    return new Fuse(allTeachers, {
      keys: ["name"],
      threshold: 0.4,
      includeScore: false,
    });
  }, [allTeachers]);
  const processedTeachers = useMemo(() => {
    let baseList: TeacherData[];
    if (!fuse || !isSearching) {
      baseList = [...allTeachers];
    } else {
      const searchResults = fuse.search(searchQuery);
      baseList = Array.isArray(searchResults)
        ? searchResults.map((result) => result.item)
        : [];
    }
    const filteredList = baseList.filter((teacher) => {
      if (!teacher || typeof teacher.name !== "string") return false;
      const lowerCaseName = teacher.name.toLowerCase();
      return !FILTER_KEYWORDS.some((keyword) =>
        lowerCaseName.includes(keyword),
      );
    });
    if (sortConfig.key === "name" && !isSearching && filteredList.length > 0) {
      filteredList.sort((a, b) => {
        const nameA = a?.name ?? "";
        const nameB = b?.name ?? "";
        const comparison = nameA.localeCompare(nameB, undefined, {
          sensitivity: "base",
        });
        return sortConfig.direction === "asc" ? comparison : comparison * -1;
      });
    }
    return filteredList ?? [];
  }, [searchQuery, isSearching, allTeachers, fuse, sortConfig]);
  const handleSort = useCallback(
    (key: SortKey) => {
      if (isSearching || key !== "name") return;
      let direction: "asc" | "desc" = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      }
      setSortConfig({ key, direction });
    },
    [isSearching, sortConfig],
  );
  const getSortIcon = useCallback(
    (key: SortKey) => {
      if (isSearching || sortConfig.key !== key) {
        return null;
      }
      if (sortConfig.direction === "asc") {
        return (
          <ArrowUp className="ml-1.5 h-4 w-4 text-purple-400 flex-shrink-0" />
        );
      }
      return (
        <ArrowDown className="ml-1.5 h-4 w-4 text-purple-400 flex-shrink-0" />
      );
    },
    [isSearching, sortConfig],
  );
  const handleCopy = useCallback((emailToCopy: string | null) => {
    if (!emailToCopy || typeof navigator.clipboard?.writeText !== "function") {
      console.warn("Clipboard API not available or email is null.");
      return;
    }
    navigator.clipboard
      .writeText(emailToCopy)
      .then(() => {
        setCopiedEmail(emailToCopy);
        setTimeout(() => {
          setCopiedEmail((currentCopied) =>
            currentCopied === emailToCopy ? null : currentCopied,
          );
        }, 1500);
      })
      .catch((err) => {
        console.error("Failed to copy email: ", err);
        setCopiedEmail(null);
      });
  }, []);

  // --- Animation Variants ---
  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };
  const listItemVariant = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };
  const tableRowVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };
  const pageHeaderVariant = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.1, duration: 0.4, ease: "easeOut" },
    },
  };
  const searchBarVariant = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2, duration: 0.4, ease: "easeOut" },
    },
  };
  const legendVariant = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.3, duration: 0.4, ease: "easeOut" },
    },
  };
  const tableContainerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 0.4, duration: 0.5, ease: "easeOut" },
    },
  };
  const mobileActionsVariant = {
    hidden: { opacity: 0, x: 20, width: 0 },
    visible: {
      opacity: 1,
      x: 0,
      width: "auto",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: 20,
      width: 0,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  // --- Render Page ---
  return (
    // <TooltipProvider delayDuration={100}> // Removed
    <div className="teachers-page-container w-full max-w-6xl mx-auto px-4 py-6 pt-20 md:pt-24 flex flex-col items-center">
      <Head>
        <title>Professor Details - vaila</title>
      </Head>
      <motion.div
        variants={pageHeaderVariant}
        initial="hidden"
        animate="visible"
        className="flex-shrink-0 w-full text-center"
      >
        {" "}
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white">
          {" "}
          Professor Details{" "}
        </h1>{" "}
      </motion.div>
      <motion.div
        variants={searchBarVariant}
        initial="hidden"
        animate="visible"
        className="relative mb-4 flex-shrink-0 max-w-lg w-full mx-auto"
      >
        {" "}
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />{" "}
        <Input
          type="text"
          placeholder="Search by professor name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 h-11 py-2.5 bg-black/30 border-white/25 text-white placeholder:text-gray-500 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 rounded-full"
          aria-label="Search professors"
        />{" "}
      </motion.div>
      <motion.div
        variants={legendVariant}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-400 mb-6 px-2 w-fit mx-auto"
      >
        {" "}
        <span className="inline-flex items-center gap-1.5">
          <Copy className="w-4 h-4" /> Copy Email
        </span>{" "}
        <span className="inline-flex items-center gap-1.5">
          <Mail className="w-4 h-4" /> Send Email
        </span>{" "}
        <span className="inline-flex items-center gap-1.5">
          <PhoneForwarded className="w-4 h-4" /> Call Toll-Free (800-UOWD)
        </span>{" "}
        <span className="inline-flex items-center gap-1.5">
          <PhoneCall className="w-4 h-4" /> Call Direct Line
        </span>{" "}
      </motion.div>

      <div className="w-full md:flex md:justify-center">
        {/* Loading State */}
        {isLoading && (
          <div className="h-40 flex justify-center items-center text-gray-400 py-4 px-6">
            {" "}
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400"></div>{" "}
          </div>
        )}
        {/* Error State */}
        {!isLoading && error && !isSearching && (
          <div className="h-24 flex justify-center items-center p-4 py-4 px-6">
            {" "}
            <div className="flex items-center justify-center text-red-400 gap-2 bg-red-950/40 border border-red-500/50 p-3 rounded-md max-w-md mx-auto">
              {" "}
              <AlertCircle className="w-5 h-5" />{" "}
              <span>Error: {error}</span>{" "}
            </div>{" "}
          </div>
        )}
        {/* No Results State */}
        {!isLoading &&
          (!Array.isArray(processedTeachers) ||
            processedTeachers.length === 0) && (
            <div className="h-24 text-center text-gray-400 italic py-10 px-6">
              {" "}
              {isSearching
                ? "No professors found matching search."
                : error
                  ? `Error: ${error}`
                  : "No professor data available or all filtered out."}{" "}
            </div>
          )}

        {/* Data Display Area */}
        {!isLoading &&
          Array.isArray(processedTeachers) &&
          processedTeachers.length > 0 && (
            <>
              {/* --- MOBILE LAYOUT --- */}
              <motion.div
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
                className="md:hidden divide-y divide-white/15 border border-white/20 rounded-lg shadow-lg bg-black/50 backdrop-blur-md overflow-hidden max-h-[65vh] overflow-y-auto hide-scrollbar"
              >
                <AnimatePresence initial={false}>
                  {processedTeachers.map((teacher) => {
                    const isCopied = copiedEmail === teacher.email;
                    const isFullPhoneNumber = teacher.phone?.startsWith("+");
                    const isExpanded = expandedTeacher === teacher.name;
                    const canPerformAction = !!teacher.email || !!teacher.phone;

                    return (
                      <motion.div
                        key={teacher.name + "-mobile"}
                        variants={listItemVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="p-4 flex flex-row items-center justify-between gap-3 overflow-hidden"
                      >
                        <p
                          className="font-semibold text-white text-base truncate flex-grow mr-2"
                          title={teacher.name}
                        >
                          {" "}
                          {teacher.name}{" "}
                        </p>
                        {canPerformAction && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  key="mobile-actions"
                                  variants={mobileActionsVariant}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  className="flex items-center gap-2 overflow-hidden"
                                >
                                  {/* Copy Button */}
                                  {teacher.email && (
                                    <Button
                                      // *** REMOVED key from Button ***
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-2.5 bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white active:bg-white/15"
                                      onClick={() => handleCopy(teacher.email)}
                                      aria-label={
                                        isCopied
                                          ? "Email copied"
                                          : `Copy email for ${teacher.name}`
                                      }
                                      disabled={isCopied} // Keep disabled state
                                    >
                                      {/* *** ADDED key back to ICONS *** */}
                                      {isCopied ? (
                                        <Check
                                          key={`${teacher.name}-m-check`}
                                          className="w-4 h-4 text-green-400"
                                        />
                                      ) : (
                                        <Copy
                                          key={`${teacher.name}-m-copy`}
                                          className="w-4 h-4"
                                        />
                                      )}
                                    </Button>
                                  )}
                                  {/* Mail Button */}
                                  {teacher.email && (
                                    <a
                                      href={`mailto:${teacher.email}`}
                                      aria-label={`Send Email to ${teacher.name}`}
                                      className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white/5 border border-white/20 text-gray-300 hover:bg-purple-500/20 hover:text-purple-200 hover:border-purple-400/50 active:bg-purple-500/30 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400"
                                    >
                                      {" "}
                                      <Mail className="w-4 h-4" />{" "}
                                    </a>
                                  )}
                                  {/* Call Buttons */}
                                  {teacher.phone &&
                                    (isFullPhoneNumber ? (
                                      <a
                                        href={`tel:${teacher.phone}`}
                                        aria-label={`Call ${teacher.name} (${teacher.phone})`}
                                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white/5 border border-white/20 text-gray-300 hover:bg-green-500/20 hover:text-green-200 hover:border-green-400/50 active:bg-green-500/30 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-400"
                                      >
                                        <PhoneCall className="w-4 h-4" />
                                      </a>
                                    ) : (
                                      <>
                                        <a
                                          href={formatTelUriWithExtension(
                                            "+9718008693",
                                            teacher.phone,
                                            true,
                                          )}
                                          aria-label={`Call ${teacher.name} via Toll-Free Ext ${teacher.phone}`}
                                          className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white/5 border border-white/20 text-gray-300 hover:bg-blue-500/20 hover:text-blue-200 hover:border-blue-400/50 active:bg-blue-500/30 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
                                        >
                                          <PhoneForwarded className="w-4 h-4" />
                                        </a>
                                        <a
                                          href={formatTelUriWithExtension(
                                            "+9714278",
                                            teacher.phone,
                                            false,
                                          )}
                                          aria-label={`Call ${teacher.name} Direct Ext ${teacher.phone}`}
                                          className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white/5 border border-white/20 text-gray-300 hover:bg-green-500/20 hover:text-green-200 hover:border-green-400/50 active:bg-green-500/30 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-400"
                                        >
                                          <PhoneCall className="w-4 h-4" />
                                        </a>
                                      </>
                                    ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {/* Ellipsis/Cross Button */}
                            <button
                              onClick={() =>
                                setExpandedTeacher(
                                  isExpanded ? null : teacher.name,
                                )
                              }
                              aria-label={`More actions for ${teacher.name}`}
                              aria-expanded={isExpanded}
                              className="flex items-center justify-center h-8 w-8 rounded-md text-gray-400 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
                            >
                              {isExpanded ? (
                                <X className="w-5 h-5" />
                              ) : (
                                <MoreHorizontal className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {isSearching && (
                  <div className="text-center text-xs text-gray-400 py-3 px-4 border-t border-white/10">
                    {" "}
                    End of search results{" "}
                  </div>
                )}
              </motion.div>

              {/* --- DESKTOP LAYOUT --- */}
              <motion.div
                variants={tableContainerVariant}
                initial="hidden"
                animate="visible"
                className="hidden md:inline-block border border-white/20 rounded-lg shadow-lg overflow-hidden bg-black/50 backdrop-blur-md"
              >
                <div className="overflow-auto hide-scrollbar max-h-[70vh] w-full">
                  <table className="border-collapse">
                    <thead>
                      <tr className="text-left">
                        <th
                          scope="col"
                          className={cn(
                            "sticky top-0 left-0 z-20",
                            "group px-4 py-3 text-left text-sm font-semibold text-white",
                            "bg-gradient-to-b from-black/95 via-black/85 to-black/80 backdrop-blur-sm",
                            "border-b border-r border-white/15",
                            !isSearching && "cursor-pointer hover:bg-white/10",
                            isSearching && "cursor-default",
                          )}
                          onClick={() => handleSort("name")}
                          aria-sort={
                            isSearching || sortConfig.key !== "name"
                              ? "none"
                              : sortConfig.direction === "asc"
                                ? "ascending"
                                : "descending"
                          }
                        >
                          {" "}
                          <div className="flex items-center whitespace-nowrap">
                            {" "}
                            <User className="mr-2 h-4 w-4 opacity-80" /> Name{" "}
                            {getSortIcon("name")}{" "}
                          </div>{" "}
                        </th>
                        <th
                          scope="col"
                          className={cn(
                            "sticky top-0 z-10",
                            "group px-4 py-3 text-left text-sm font-semibold text-white",
                            "bg-gradient-to-b from-black/95 via-black/85 to-black/80 backdrop-blur-sm",
                            "border-b border-r border-white/15",
                            "cursor-default",
                          )}
                        >
                          {" "}
                          <div className="flex items-center whitespace-nowrap">
                            {" "}
                            <Mail className="mr-2 h-4 w-4 opacity-80" />{" "}
                            Email{" "}
                          </div>{" "}
                        </th>
                        <th
                          scope="col"
                          className={cn(
                            "sticky top-0 z-10",
                            "group px-4 py-3 text-left text-sm font-semibold text-white",
                            "bg-gradient-to-b from-black/95 via-black/85 to-black/80 backdrop-blur-sm",
                            "border-b border-white/15",
                            "cursor-default",
                            "min-w-[12rem]",
                          )}
                        >
                          {" "}
                          <div className="flex items-center whitespace-nowrap">
                            {" "}
                            <Phone className="mr-2 h-4 w-4 opacity-80" /> Phone
                            / Call{" "}
                          </div>{" "}
                        </th>
                      </tr>
                    </thead>
                    <motion.tbody
                      variants={listContainerVariants}
                      initial="hidden"
                      animate="visible"
                      className="divide-y divide-white/10"
                    >
                      <AnimatePresence initial={false}>
                        {processedTeachers.map((teacher) => {
                          const isCopied = copiedEmail === teacher.email;
                          const isFullPhoneNumber =
                            teacher.phone?.startsWith("+");
                          return (
                            <motion.tr
                              key={teacher.name + "-desktop"}
                              variants={tableRowVariant}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              layout
                              className="group transition-colors duration-100"
                            >
                              <td
                                className={cn(
                                  "sticky left-0 z-10",
                                  "font-medium text-white py-2.5 px-4 text-left",
                                  "border-b border-r border-white/10",
                                  "bg-black/70 group-hover:bg-white/10 backdrop-blur-sm transition-colors duration-100 whitespace-nowrap",
                                )}
                              >
                                {" "}
                                {teacher.name}{" "}
                              </td>
                              <td
                                className={cn(
                                  "text-gray-300 py-2.5 px-4 border-b border-r border-white/10 text-left",
                                  "bg-black/70 group-hover:bg-white/10 backdrop-blur-sm transition-colors duration-100",
                                )}
                              >
                                {" "}
                                <div className="flex items-center justify-between gap-2">
                                  {" "}
                                  {teacher.email ? (
                                    <a
                                      href={`mailto:${teacher.email}`}
                                      className="text-purple-400 hover:text-purple-300 hover:underline underline-offset-2 truncate"
                                      title={teacher.email}
                                    >
                                      {" "}
                                      {teacher.email}{" "}
                                    </a>
                                  ) : (
                                    <span className="text-gray-500 italic text-xs">
                                      N/A
                                    </span>
                                  )}{" "}
                                  {teacher.email && (
                                    <button
                                      key={isCopied ? "copied" : "copy"}
                                      onClick={() => handleCopy(teacher.email)}
                                      className="p-1 rounded text-gray-400 hover:text-purple-100 hover:bg-purple-500/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black/50 transition-all duration-150 flex-shrink-0"
                                      aria-label={
                                        isCopied
                                          ? "Email copied"
                                          : `Copy email for ${teacher.name}`
                                      }
                                      disabled={isCopied}
                                    >
                                      {" "}
                                      {isCopied ? (
                                        <Check className="w-3.5 h-3.5 text-green-400" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}{" "}
                                    </button>
                                  )}{" "}
                                </div>{" "}
                              </td>
                              <td
                                className={cn(
                                  "py-2.5 px-4 border-b border-white/10 text-left",
                                  "bg-black/70 group-hover:bg-white/10 backdrop-blur-sm transition-colors duration-100",
                                  "min-w-[12rem]",
                                )}
                              >
                                {" "}
                                <div className="flex flex-row items-center justify-between gap-x-3">
                                  {" "}
                                  <span className="text-gray-300 text-sm whitespace-nowrap font-mono flex-shrink-0">
                                    {" "}
                                    {teacher.phone || (
                                      <span className="text-gray-500 italic text-xs">
                                        N/A
                                      </span>
                                    )}{" "}
                                  </span>{" "}
                                  {teacher.phone && (
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      {" "}
                                      {isFullPhoneNumber ? (
                                        <a
                                          href={`tel:${teacher.phone}`}
                                          className="p-2 rounded text-gray-300 hover:text-green-300 hover:bg-green-500/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-400 transition-colors duration-150"
                                          aria-label={`Call ${teacher.name} (${teacher.phone})`}
                                        >
                                          {" "}
                                          <PhoneCall className="w-4 h-4" />{" "}
                                        </a>
                                      ) : (
                                        <>
                                          <a
                                            href={formatTelUriWithExtension(
                                              "+9718008693",
                                              teacher.phone,
                                              true,
                                            )}
                                            className="p-2 rounded text-gray-300 hover:text-blue-300 hover:bg-blue-500/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 transition-colors duration-150"
                                            aria-label={`Call ${teacher.name} via Toll-Free Ext ${teacher.phone}`}
                                          >
                                            {" "}
                                            <PhoneForwarded className="w-4 h-4" />{" "}
                                          </a>{" "}
                                          <a
                                            href={formatTelUriWithExtension(
                                              "+9714278",
                                              teacher.phone,
                                              false,
                                            )}
                                            className="p-2 rounded text-gray-300 hover:text-green-300 hover:bg-green-500/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-400 transition-colors duration-150"
                                            aria-label={`Call ${teacher.name} Direct Ext ${teacher.phone}`}
                                          >
                                            {" "}
                                            <PhoneCall className="w-4 h-4" />{" "}
                                          </a>
                                        </>
                                      )}{" "}
                                    </div>
                                  )}{" "}
                                </div>{" "}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                      {isSearching && (
                        <tr className="bg-transparent">
                          <td
                            colSpan={3}
                            className="text-center text-xs text-gray-400 py-3 px-4 border-t border-white/10"
                          >
                            {" "}
                            End of search results{" "}
                          </td>
                        </tr>
                      )}
                    </motion.tbody>
                  </table>
                </div>
              </motion.div>
            </>
          )}
      </div>
    </div>
    // </TooltipProvider> // Removed
  );
}
