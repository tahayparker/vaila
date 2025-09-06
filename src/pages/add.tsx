// src/pages/add.tsx
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Save,
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  ChevronsUpDown,
  Users,
  Loader2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { Montserrat } from "next/font/google";
import { Turnstile } from "@marsidev/react-turnstile";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

// --- Data Structures ---
interface TeacherData {
  name: string;
  email: string | null;
  phone: string | null;
}

interface ProfessorFormData {
  name: string;
  email: string;
  phone: string;
}

// --- Constants ---
const FILTER_KEYWORDS = [
  "instructor",
  "adjunct",
  "tba",
  "new ",
  " ps",
  "tbd",
  "unknown",
  "staff",
];

// --- Main Page Component ---
export default function AddProfessorDetailsPage() {
  const router = useRouter();

  // --- State ---
  const [allTeachers, setAllTeachers] = useState<TeacherData[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [teachersError, setTeachersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(
    null,
  );

  const [formData, setFormData] = useState<ProfessorFormData>({
    name: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [issueUrl, setIssueUrl] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string | null;
    phone?: string | null;
  }>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false); // --- Effects ---
  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      setTeachersError(null);
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
        setTeachersError(err.message || "Failed to load teacher details.");
        setAllTeachers([]);
      } finally {
        setIsLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    // Pre-fill form with sessionStorage data when available and teachers are loaded
    if (
      router.isReady &&
      !selectedTeacher &&
      allTeachers.length > 0 &&
      !isLoadingTeachers
    ) {
      try {
        const storedData = sessionStorage.getItem("professor-form-data");
        if (storedData) {
          const professorData = JSON.parse(storedData);
          const queryName = professorData.name || "";

          // Only prefill the name, not email or phone
          setFormData((prev) => ({
            ...prev,
            name: queryName,
          }));

          // If name is provided, find and select the corresponding teacher
          if (queryName) {
            const teacher = allTeachers.find((t) => t.name === queryName);
            if (teacher) {
              setSelectedTeacher(teacher);
              // Set form data with teacher's existing details (they'll be read-only if they exist)
              setFormData({
                name: teacher.name,
                email: teacher.email || "", // Show existing email (will be read-only) or empty for editing
                phone: teacher.phone || "", // Show existing phone (will be read-only) or empty for editing
              });
            }
          }

          // Clear the sessionStorage data after reading it
          sessionStorage.removeItem("professor-form-data");
        }
      } catch (error) {
        console.error(
          "Error reading professor data from sessionStorage:",
          error,
        );
      }
    }
  }, [router.isReady, allTeachers, selectedTeacher, isLoadingTeachers]);

  // --- Computed Values ---
  const fuse = useMemo(() => {
    if (allTeachers.length === 0) return null;
    return new Fuse(allTeachers, {
      keys: ["name"],
      threshold: 0.4,
      includeScore: false,
    });
  }, [allTeachers]);

  const filteredTeachers = useMemo(() => {
    let baseList: TeacherData[];

    if (!fuse || !searchQuery.trim()) {
      baseList = [...allTeachers];
    } else {
      const searchResults = fuse.search(searchQuery);
      baseList = Array.isArray(searchResults)
        ? searchResults.map((result) => result.item)
        : [];
    }

    // Apply the same filtering logic as professors.tsx
    const filtered = baseList.filter((teacher) => {
      if (!teacher || typeof teacher.name !== "string") return false;
      const lowerCaseName = teacher.name.toLowerCase();
      return !FILTER_KEYWORDS.some((keyword) =>
        lowerCaseName.includes(keyword),
      );
    });

    // Sort alphabetically
    filtered.sort((a, b) => {
      const nameA = a?.name ?? "";
      const nameB = b?.name ?? "";
      return nameA.localeCompare(nameB, undefined, {
        sensitivity: "base",
      });
    });

    return filtered;
  }, [searchQuery, allTeachers, fuse]);

  // Check if professor has both email and phone details
  const hasBothDetails = useMemo(() => {
    return !!(selectedTeacher?.email && selectedTeacher?.phone);
  }, [selectedTeacher]);

  // --- Validation Functions ---
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return null; // Allow empty for optional fields

    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    // Check for UOW Dubai domain
    if (!email.endsWith("@uowdubai.ac.ae")) {
      return "Email must be from @uowdubai.ac.ae domain";
    }

    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) return null; // Allow empty for optional fields

    // Check if it's a 4-digit extension
    const extensionRegex = /^\d{4}$/;
    if (extensionRegex.test(phone)) {
      return null; // Valid 4-digit extension
    }

    // Check if it's a full UAE number
    const fullPhoneRegex = /^\+9715\d{8}$/;
    if (fullPhoneRegex.test(phone)) {
      return null; // Valid full UAE number
    }

    return "Phone must be either a 4-digit extension or in format +9715xxxxxxxx";
  };

  // Check if Turnstile is completed
  const turnstileCompleted = !!turnstileToken;

  // Check if form has validation errors
  const hasValidationErrors = useMemo(() => {
    return Object.values(validationErrors).some(
      (error) => error !== null && error !== undefined,
    );
  }, [validationErrors]);

  // --- Handlers ---
  const handleTeacherSelect = (teacher: TeacherData) => {
    setSelectedTeacher(teacher);
    // Clear fields first, then set the new teacher's data
    setFormData({
      name: teacher.name,
      email: teacher.email || "",
      phone: teacher.phone || "",
    });
    // Clear validation errors when switching teachers
    setValidationErrors({});
    setShowValidationErrors(false);
    setSelectionError(null);
    setComboboxOpen(false);
    setSearchQuery("");
  };
  const handleInputChange = (field: keyof ProfessorFormData, value: string) => {
    // Only allow editing of fields that were initially empty
    const initialEmail = selectedTeacher?.email || "";
    const initialPhone = selectedTeacher?.phone || "";

    if (field === "email" && initialEmail) return; // Don't allow editing if email exists
    if (field === "phone" && initialPhone) return; // Don't allow editing if phone exists
    if (field === "name") return; // Never allow editing name

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Validate the field but don't show errors until submit
    if (field === "email") {
      const emailError = validateEmail(value);
      setValidationErrors((prev) => ({
        ...prev,
        email: emailError,
      }));
    } else if (field === "phone") {
      const phoneError = validatePhone(value);
      setValidationErrors((prev) => ({
        ...prev,
        phone: phoneError,
      }));
    }

    // Reset show validation errors flag when user types
    setShowValidationErrors(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSelectionError(null);

    try {
      // Validate required fields
      if (!selectedTeacher) {
        setSelectionError("Please select a professor from the list");
        setIsLoading(false);
        return;
      }

      if (!formData.name.trim()) {
        setError("Professor name is required");
        setIsLoading(false);
        return;
      }

      if (!formData.email.trim() && !formData.phone.trim()) {
        setError("At least one contact detail (email or phone) is required");
        setIsLoading(false);
        return;
      }

      // Check for validation errors and show them if they exist
      const currentEmailError = validateEmail(formData.email);
      const currentPhoneError = validatePhone(formData.phone);

      setValidationErrors({
        email: currentEmailError,
        phone: currentPhoneError,
      });

      if (currentEmailError || currentPhoneError) {
        setShowValidationErrors(true);
        setIsLoading(false);
        return;
      }

      // Check if any new information is being added
      const existingEmail = selectedTeacher?.email || "";
      const existingPhone = selectedTeacher?.phone || "";
      const newEmail = formData.email.trim();
      const newPhone = formData.phone.trim();

      // Determine if user is adding new information
      const hasNewEmail = !existingEmail && newEmail;
      const hasNewPhone = !existingPhone && newPhone;
      const hasNewInfo = hasNewEmail || hasNewPhone;

      if (!hasNewInfo) {
        setError(
          "No new contact information to add. This professor already has the provided details or no new details were entered.",
        );
        setIsLoading(false);
        return;
      }

      // Verify Turnstile token
      if (!turnstileToken) {
        setError("Please complete the security verification");
        setIsLoading(false);
        return;
      }

      // Verify the Turnstile token with our API
      try {
        const turnstileResponse = await fetch("/api/verify-turnstile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: turnstileToken }),
        });

        if (!turnstileResponse.ok) {
          throw new Error("Security verification failed");
        }
      } catch (turnstileError) {
        console.error("Turnstile verification failed:", turnstileError);
        setError("Security verification failed. Please try again.");
        setTurnstileToken(null); // Reset turnstile
        setTurnstileError("Verification failed");
        setIsLoading(false);
        return;
      }

      // Get user's IP address, location data, and current time
      let ipData = null;
      let encodedIP = "Unknown";
      let encodedLocation = "Unknown";
      let encodedCoordinates = "Unknown";
      let localDateTime = "Unknown";

      try {
        const ipResponse = await fetch("https://free.freeipapi.com/api/json/");
        ipData = await ipResponse.json();

        // Encode IP address
        encodedIP = btoa(ipData.ipAddress || "Unknown");

        // Encode location (cityName, regionName, countryName, zipCode)
        const locationString = `${ipData.cityName || ""}, ${ipData.regionName || ""}, ${ipData.countryName || ""}, ${ipData.zipCode || ""}`;
        encodedLocation = btoa(locationString);

        // Encode coordinates (latitude, longitude)
        const coordinatesString = `${ipData.latitude || ""}, ${ipData.longitude || ""}`;
        encodedCoordinates = btoa(coordinatesString);

        // Get current time based on IP address using timeapi.io
        try {
          const timeResponse = await fetch(
            `https://timeapi.io/api/time/current/ip?ipAddress=${ipData.ipAddress}`,
          );
          const timeData = await timeResponse.json();

          // Format as "dayOfWeek, dateTime (timeZone)"
          localDateTime = `${timeData.dayOfWeek}, ${timeData.dateTime} (${timeData.timeZone})`;
        } catch (timeError) {
          console.warn("Could not fetch time data:", timeError);
          // Fallback to local time
          const now = new Date();
          localDateTime =
            now.toISOString().slice(0, -1) + now.toTimeString().slice(9);
        }
      } catch (ipError) {
        console.warn("Could not fetch IP/location data:", ipError);
        // Fallback to local time
        const now = new Date();
        localDateTime =
          now.toISOString().slice(0, -1) + now.toTimeString().slice(9);
      }

      // Determine contact types being submitted
      const hasEmail = formData.email.trim();
      const hasPhone = formData.phone.trim();
      const hasBoth = hasEmail && hasPhone;

      // Create GitHub issue
      const issueTitle = `[Add Contact] ${formData.name}`;
      const issueBody = `# Add / Update Professor Contact

Use this template to request adding or updating a professor's institutional email or phone number on vaila. Please attach proof the contact is accurate.

## Request type (type x between brackets)
- [ ] Add new contact
- [x] Update existing contact

## Professor details
**Full name**: ${formData.name}

**Contact type  (type x between brackets)**
- [${hasEmail && !hasBoth ? "x" : " "}] Email
- [${hasPhone && !hasBoth ? "x" : " "}] Phone
- [${hasBoth ? "x" : " "}] Both

**Contact Information**
Email: ${hasEmail ? formData.email : "[Not provided]"}
Phone: ${hasPhone ? formData.phone : "[Not provided]"}

## Source / proof
**Provide a URL or attach evidence that the contact is accurate. Could be a link, a text, email, etc.**

Submitted via [vaila](https://vaila.vercel.app)

## Additional context
${encodedIP}
${encodedLocation}
${encodedCoordinates}
${localDateTime}`; // Create the GitHub issue using GitHub API
      const response = await fetch("/api/github/create-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: ["contact"],
          professorName: formData.name,
          encodedIP,
          encodedLocation,
          encodedCoordinates,
          localDateTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create GitHub issue");
      }

      const issueData = await response.json();
      console.log("GitHub issue created:", issueData);

      setIssueUrl(issueData.issue?.url || null);
      setSuccess(true);
    } catch (err: any) {
      console.error("Error creating GitHub issue:", err);
      setError(err.message || "Failed to submit professor details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset all form state
    setSelectedTeacher(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
    });
    setValidationErrors({});
    setShowValidationErrors(false);
    setError(null);
    setSuccess(false);
    setIssueUrl(null);
    setSelectionError(null);
    setComboboxOpen(false);
    setSearchQuery("");
    setTurnstileToken(null);
    setTurnstileError(null);
  };

  // --- Animation Variants ---
  const pageVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const formVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2, duration: 0.4, ease: "easeOut" },
    },
  };

  // --- Render ---
  return (
    <div className="add-professor-page-container w-full max-w-2xl mx-auto px-4 py-6 pt-20 md:pt-24 flex flex-col items-center">
      <Head>
        <title>Add Professor Details - vaila</title>
      </Head>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
      >
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center text-white inline-block mr-2">
            Add Professor Details
          </h1>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
          <span>Fill in the missing contact information</span>
        </div>
      </motion.div>

      <motion.div
        variants={pageVariant}
        initial="hidden"
        animate="visible"
        className="space-y-6 w-full"
      >
        {/* Form */}
        <motion.div variants={formVariant} initial="hidden" animate="visible">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-5">
            {/* Professor Selection Dropdown */}
            <div className="space-y-2">
              <label
                htmlFor="teacher-search"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Select Professor
              </label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    disabled={isLoadingTeachers || !!teachersError}
                    className={`w-full justify-between bg-black/20 border-white/20 hover:bg-black/30 hover:border-white/30 text-white disabled:opacity-70 disabled:cursor-not-allowed font-sans ${montserrat.className}`}
                  >
                    <span className="flex items-center justify-between w-full">
                      <span
                        className={`truncate flex items-center gap-2 font-sans ${montserrat.className}`}
                      >
                        <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {isLoadingTeachers
                          ? "Loading professors..."
                          : teachersError
                            ? "Error loading professors"
                            : selectedTeacher
                              ? selectedTeacher.name
                              : "Select professor..."}
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
                      <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                    </div>
                  ) : teachersError ? (
                    <div className="p-4 text-center text-sm text-red-300">
                      {teachersError}
                    </div>
                  ) : (
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search professor..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        className={`h-9 text-white placeholder:text-gray-400 border-0 border-b border-white/20 rounded-none ring-offset-0 focus-visible:ring-0 focus-visible:border-b-purple-500 font-sans ${montserrat.className}`}
                      />
                      <CommandList className="hide-scrollbar">
                        <CommandEmpty>No professor found.</CommandEmpty>
                        <CommandGroup>
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
                                if (foundTeacher) {
                                  handleTeacherSelect(foundTeacher);
                                }
                              }}
                              className={`font-sans aria-selected:bg-purple-600/30 aria-selected:text-white text-sm cursor-pointer font-sans ${montserrat.className}`}
                            >
                              {teacher.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  )}
                </PopoverContent>
              </Popover>
              {teachersError && (
                <p className="text-xs text-red-400">
                  Error loading professors: {teachersError}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="text"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  readOnly={!!selectedTeacher?.email}
                  className={cn(
                    "pl-10",
                    selectedTeacher?.email
                      ? "bg-gray-800/50 border-gray-600/50 text-gray-300 cursor-not-allowed opacity-75"
                      : "bg-black/20 border-white/20 text-white placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500",
                  )}
                  placeholder="professor@uowdubai.ac.ae"
                />
              </div>
              {selectedTeacher?.email && (
                <p className="text-xs text-gray-500">
                  Email already exists and cannot be modified
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  readOnly={!!selectedTeacher?.phone}
                  className={cn(
                    "pl-10",
                    selectedTeacher?.phone
                      ? "bg-gray-800/50 border-gray-600/50 text-gray-300 cursor-not-allowed opacity-75"
                      : "bg-black/20 border-white/20 text-white placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500",
                  )}
                  placeholder="Extension or full number"
                />
              </div>
              {selectedTeacher?.phone && (
                <p className="text-xs text-gray-500">
                  Phone number already exists and cannot be modified
                </p>
              )}
            </div>

            {/* Turnstile Security Verification */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 mb-2.5">
                Security Verification
              </label>
              <div className="w-full">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setTurnstileError(null);
                  }}
                  onError={() => {
                    setTurnstileToken(null);
                    setTurnstileError("Verification failed");
                  }}
                  onExpire={() => {
                    setTurnstileToken(null);
                    setTurnstileError("Verification expired");
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={
                  isLoading || success || hasBothDetails || !turnstileCompleted
                }
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5 py-2.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Submit Details
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
                className="rounded-full border-white/30 bg-white/10 hover:bg-white/20 px-5 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-green-950/40 border border-green-500/50 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-green-200 font-bold text-sm mb-2">
                      GitHub issue created successfully!
                    </p>
                    <p className="text-green-300/80 text-sm mb-1">
                      Thank you for submitting the professor&apos;s contact
                      details.
                    </p>
                    <p className="text-green-300/80 text-sm">
                      {issueUrl ? (
                        <>
                          View the issue:{" "}
                          <a
                            href={issueUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 hover:text-blue-200 underline underline-offset-2"
                          >
                            GitHub Issue
                          </a>
                        </>
                      ) : (
                        "Processing your submission..."
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Selection Error Callout */}
            {selectionError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-orange-950/40 border border-orange-500/50 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-orange-200 font-bold text-sm mb-2">
                      Selection Required
                    </p>
                    <p className="text-orange-300/80 text-sm">
                      {selectionError}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-red-950/40 border border-red-500/50 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-200 font-bold text-sm mb-2">
                      Error saving details
                    </p>
                    <p className="text-red-300/80 text-sm">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Validation Errors Callout - Email Only */}
            {showValidationErrors &&
              validationErrors.email &&
              !validationErrors.phone && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-950/40 border border-red-500/50 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-200 font-bold text-sm mb-2">
                        Email Validation Error
                      </p>
                      <p className="text-red-300/90 text-sm">
                        {validationErrors.email}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

            {/* Validation Errors Callout - Phone Only */}
            {showValidationErrors &&
              validationErrors.phone &&
              !validationErrors.email && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-950/40 border border-red-500/50 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-200 font-bold text-sm mb-2">
                        Phone Validation Error
                      </p>
                      <p className="text-red-300/90 text-sm">
                        {validationErrors.phone}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

            {/* Validation Errors Callout - Both Email and Phone */}
            {showValidationErrors &&
              validationErrors.email &&
              validationErrors.phone && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-950/40 border border-red-500/50 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-200 font-bold text-sm mb-2">
                        Validation Errors
                      </p>
                      <div className="space-y-1">
                        <p className="text-red-300/90 text-sm">
                          • Email: {validationErrors.email}
                        </p>
                        <p className="text-red-300/90 text-sm">
                          • Phone: {validationErrors.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            {/* Turnstile Verification Error Callout */}
            {turnstileError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-950/40 border border-red-500/50 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-200 font-bold text-sm mb-2">
                      Security Verification Error
                    </p>
                    <p className="text-red-300/90 text-sm">
                      {turnstileError}. Please refresh the site and try again.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* GitHub Issue Callout */}
            {hasBothDetails && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-blue-950/40 border border-blue-500/50 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-blue-200 font-bold text-sm mb-2">
                      Professor has complete contact details
                    </p>
                    <p className="text-blue-300/80 text-sm mb-3">
                      If any of the existing contact information is incorrect,
                      please create an issue on our GitHub repository for
                      review.
                    </p>
                    <a
                      href="https://github.com/tahayparker/vaila/issues/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm font-medium hover:underline underline-offset-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Create GitHub Issue
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
