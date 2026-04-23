import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a time string in 24-hour format (HH:mm)
 * @param time - Time string in HH:mm format (e.g., "14:30", "09:00")
 * @returns Formatted time string in HH:mm format
 */
export function formatTime(time: string): string {
  if (!time) return "";

  // Always return time in 24-hour format as requested
  return time;
}
