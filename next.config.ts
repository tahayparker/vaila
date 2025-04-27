// next.config.mjs (or next.config.ts)
import { NextConfig } from "next"; // Import type if using TypeScript

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // Use NextConfig type
  reactStrictMode: true,
  // Add other configurations if you have them

  async redirects() {
    return [
      // --- Redirects for "/available-now" ---
      {
        source: "/CurrentlyAvailable",
        destination: "/available-now",
        permanent: true,
      },
      {
        source: "/availablenow",
        destination: "/available-now",
        permanent: true,
      },
      {
        source: "/AvailableNow",
        destination: "/available-now",
        permanent: true,
      },
      {
        source: "/currentlyavailable",
        destination: "/available-now",
        permanent: true,
      },
      { source: "/available", destination: "/available-now", permanent: true }, // Common shortening
      { source: "/now", destination: "/available-now", permanent: true }, // Common shortening

      // --- Redirects for "/check" ---
      { source: "/CheckAvailability", destination: "/check", permanent: true },
      { source: "/checkAvailability", destination: "/check", permanent: true }, // camelCase
      { source: "/checkavailability", destination: "/check", permanent: true },
      { source: "/check-availability", destination: "/check", permanent: true },
      { source: "/availability", destination: "/check", permanent: true }, // Could redirect here too
      { source: "/search", destination: "/check", permanent: true }, // Based on icon

      // --- Redirects for "/professors" ---
      {
        source: "/ProfessorDetails",
        destination: "/professors",
        permanent: true,
      },
      { source: "/details", destination: "/professors", permanent: true },
      { source: "/deets", destination: "/professors", permanent: true },
      { source: "/professor", destination: "/professors", permanent: true },
      {
        source: "/professorslist",
        destination: "/professors",
        permanent: true,
      },
      {
        source: "/professorslist",
        destination: "/professors",
        permanent: true,
      },
      { source: "/professorlist", destination: "/professors", permanent: true },
      { source: "/faculty", destination: "/professors", permanent: true },
      { source: "/facultylist", destination: "/professors", permanent: true },
      { source: "/teachers", destination: "/professors", permanent: true },

      // --- Redirects for "/graph" (Optional additions) ---
      { source: "/GraphPage", destination: "/graph", permanent: true }, // From old example maybe
      { source: "/graphs", destination: "/graph", permanent: true }, // Plural to singular

      // --- Redirects for "/available-soon" (Optional additions) ---
      {
        source: "/AvailableSoon",
        destination: "/available-soon",
        permanent: true,
      },
      {
        source: "/availablesoon",
        destination: "/available-soon",
        permanent: true,
      },
      { source: "/soon", destination: "/available-soon", permanent: true },

      // --- Redirect for root variations (Optional but good) ---
      { source: "/home", destination: "/", permanent: true },
      { source: "/index", destination: "/", permanent: true },
      { source: "/test", destination: "/", permanent: true },

      { source: "/about", destination: "/docs", permanent: true }, // Example for about page
      // Add more redirects as needed following this pattern
    ];
  },
};

// Use default export for .mjs or .ts
export default nextConfig;
