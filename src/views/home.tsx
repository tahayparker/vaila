"use client";
// pages/index.tsx
import React from "react";
import { motion } from "framer-motion";
import { staggerContainerVariants, slideUpVariants } from "@/lib/animations";
import { UserRound } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative text-center max-w-6xl py-10">
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={slideUpVariants}
          className="text-5xl sm:text-6xl md:text-7xl font-bold mb-5 tracking-tight leading-tight text-white"
        >
          availability, <br className="sm:hidden" /> instantly.
        </motion.h1>
        <motion.p
          variants={slideUpVariants}
          className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
        >
          Stop waiting by the door. vaila shows you professors&apos;
          availabilities right when you need them.
        </motion.p>
        <motion.div
          variants={slideUpVariants}
          className="flex gap-4 items-center justify-center flex-col sm:flex-row"
        >
          <Link
            className="group relative inline-flex items-center justify-center rounded-full border border-solid border-transparent transition-colors bg-purple-500 text-white gap-2 shadow-lg hover:bg-purple-500 hover:shadow-purple-500/30 font-medium text-sm sm:text-base h-11 sm:h-12 px-6 sm:px-8 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-background"
            href="/available-now"
          >
            <UserRound className="h-5 w-5 transition-transform duration-200 group-hover:translate-y-[-2px]" />
            Available Now
          </Link>
          <Link
            className="rounded-full border border-solid border-white/[.3] transition-colors flex items-center justify-center hover:bg-white/[.1] hover:border-white/[.5] font-medium text-sm sm:text-base h-11 sm:h-12 px-6 sm:px-8 w-full sm:w-auto text-white"
            href="/docs"
          >
            Learn More
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

