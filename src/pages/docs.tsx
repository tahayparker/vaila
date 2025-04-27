// src/pages/docs.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
// Icons remain the same
import {
  ListChecks,
  Zap,
  Info,
  Target,
  Settings,
  Clock,
  Search,
  Users,
  Grid3x3,
  Mail,
} from "lucide-react";

export default function DocsPage() {
  const sectionVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // ListItem variant remains the same
  const listItemVariant = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pt-20 md:pt-24 flex-grow flex flex-col text-white">
      <Head>
        <title>Documentation - vaila</title>
      </Head>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-10"
      >
        {/* --- Header Section --- */}
        <motion.div variants={sectionVariant} className="text-center mb-12">
          <Settings className="mx-auto h-12 w-12 text-purple-400 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white/95">
            vaila Documentation
          </h1>
          <p className="text-lg text-white/70 mt-2">
            An overview of what vaila does and how to use it.
          </p>
        </motion.div>

        {/* --- What is vaila? Section --- */}
        <motion.section variants={sectionVariant} className="space-y-4">
          <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-3">
            <Info className="h-6 w-6 text-purple-400 flex-shrink-0" />
            <h2 className="text-2xl font-semibold text-white/90">
              What is vaila?
            </h2>
          </div>
          <p className="text-white/80 text-lg">
            vaila is a web application designed to quickly show schedule
            availability based on the official university timetable data.
          </p>
          <p className="text-white/80 text-lg">
            Finding time with professors or simply understanding the daily
            schedule can often be confusing with traditional timetables. vaila
            simplifies this process. It takes the official university schedule
            data and presents it through a clean, fast web interface. You can
            quickly see who is likely busy with classes, check availability for
            specific times, and explore the weekly schedule at a glance.
          </p>
        </motion.section>

        {/* --- Goal Section --- */}
        <motion.section variants={sectionVariant} className="space-y-4">
          <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-3">
            <Target className="h-6 w-6 text-purple-400 flex-shrink-0" />
            <h2 className="text-2xl font-semibold text-white/90">Our Goal</h2>
          </div>
          <p className="text-white/80 text-lg">
            Knowing when professors are free outside of their scheduled classes
            can often be unclear. vaila&apos;s main goal is to address this lack
            of clarity. By analysing the official timetable, it quickly shows
            when professors are not occupied with teaching duties, helping
            students and staff easily identify potential windows for meetings,
            consultations, or quick questions.
          </p>
        </motion.section>

        {/* Features Section --- Styling Updated --- */}
        <motion.section variants={sectionVariant} className="space-y-4">
          <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-3">
            <ListChecks className="h-6 w-6 text-purple-400 flex-shrink-0" />
            <h2 className="text-2xl font-semibold text-white/90">
              Key Features
            </h2>
          </div>
          {/* *** UPDATED: Removed list styles, adjusted spacing/alignment *** */}
          <ul className="space-y-3 text-white/80 text-lg">
            {" "}
            {/* Increased space-y */}
            <motion.li
              variants={listItemVariant}
              className="flex items-start gap-3"
            >
              {" "}
              {/* Use flex items-start */}
              <Users className="h-5 w-5 mt-1 flex-shrink-0 text-purple-300" />{" "}
              {/* Added mt-1 for alignment */}
              <div>
                {" "}
                {/* Wrap text in div */}
                {/* *** UPDATED: Bolding fixed *** */}
                <span className="font-semibold text-white/95">
                  Currently Available:
                </span>{" "}
                Instantly see who is likely free right now based on the
                schedule.
              </div>
            </motion.li>
            <motion.li
              variants={listItemVariant}
              className="flex items-start gap-3"
            >
              <Clock className="h-5 w-5 mt-1 flex-shrink-0 text-purple-300" />
              <div>
                <span className="font-semibold text-white/95">
                  Available Soon:
                </span>{" "}
                Check who might become available in the near future.
              </div>
            </motion.li>
            <motion.li
              variants={listItemVariant}
              className="flex items-start gap-3"
            >
              <Search className="h-5 w-5 mt-1 flex-shrink-0 text-purple-300" />
              <div>
                <span className="font-semibold text-white/95">
                  Check Availability:
                </span>{" "}
                Look up a specific person and time slot to see if they are
                scheduled then.
              </div>
            </motion.li>
            <motion.li
              variants={listItemVariant}
              className="flex items-start gap-3"
            >
              <Grid3x3 className="h-5 w-5 mt-1 flex-shrink-0 text-purple-300" />
              <div>
                <span className="font-semibold text-white/95">
                  Schedule Graph:
                </span>{" "}
                Visualize the weekly schedule for listed individuals in a grid
                format.
              </div>
            </motion.li>
            <motion.li
              variants={listItemVariant}
              className="flex items-start gap-3"
            >
              <Users className="h-5 w-5 mt-1 flex-shrink-0 text-purple-300" />
              <div>
                <span className="font-semibold text-white/95">Professors:</span>{" "}
                Browse a list of professors with quick contact actions.
              </div>
            </motion.li>
          </ul>
        </motion.section>

        {/* How it Works / Updates Section */}
        <motion.section variants={sectionVariant} className="space-y-4">
          <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-3">
            <Zap className="h-6 w-6 text-purple-400 flex-shrink-0" />
            <h2 className="text-2xl font-semibold text-white/90">
              How It Works & Updates
            </h2>
          </div>
          <p className="text-white/80 text-lg">
            vaila uses schedule data sourced directly from the official
            university timetable viewer.
          </p>
          <p className="text-white/80 text-lg">
            This data is automatically refreshed every 4 hours using a
            background process to ensure the information is reasonably
            up-to-date throughout the day.
          </p>
          <p className="text-white/80 text-lg">
            The application is built with modern web technologies (Next.js on
            Vercel) for a fast and smooth experience on both desktop and mobile
            devices.
          </p>
        </motion.section>

        {/* Contact Section */}
        <motion.section variants={sectionVariant} className="space-y-4">
          <div className="flex items-center gap-3 border-b border-white/20 pb-2 mb-3">
            <Mail className="h-6 w-6 text-purple-400 flex-shrink-0" />
            <h2 className="text-2xl font-semibold text-white/90">
              Contact & Feedback
            </h2>
          </div>
          <p className="text-white/80 text-lg">
            Have questions, suggestions, or found a bug? Please contact the
            developer, Taha Parker, via his
            <Link
              href="https://tahayparker.vercel.app/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline ml-1"
            >
              website
            </Link>
            .
          </p>
          <p className="text-white/80 text-lg">
            Project Link:{" "}
            <Link
              href="https://github.com/tahayparker/vaila"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              https://github.com/tahayparker/vaila
            </Link>
          </p>
        </motion.section>
      </motion.div>
    </div>
  );
}
