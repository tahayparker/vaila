// src/components/SiteFooter.tsx
import React from "react";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer
      className={
        "w-full border-t border-white/10 " +
        "px-4 sm:px-6 md:px-8 py-4 " +
        "bg-black/5 backdrop-blur-sm " +
        "flex-shrink-0" // Added flex-shrink-0 to prevent footer from growing unnecessarily
      }
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-y-2">
        {/* Left Links (Keep for now) */}
        <nav className="flex items-center gap-x-4 sm:gap-x-6">
          {/* TODO: Verify if these pages (Docs, Legal, Privacy) are still needed/relevant for "vaila" */}
          <Link
            href="/docs"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/legal"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Legal
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Privacy
          </Link>
        </nav>

        {/* UPDATED Right Copyright */}
        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} vaila{" "}
          {/* Replaced vacansee with vaila */}
        </p>
      </div>
    </footer>
  );
}
