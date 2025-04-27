// src/pages/legal.tsx
import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Scale } from "lucide-react"; // Keep Scale icon for legal
import Link from "next/link";

export default function LegalPage() {
  const sectionVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // --- SET THIS DATE ---
  const currentDate = "April 27, 2025"; // CHANGE THIS DATE

  // --- SET YOUR CONTACT URL ---
  const contactPageUrl = "https://tahayparker.vercel.app/contact"; // CHANGE THIS URL

  const websiteUrl = "https://vaila.vercel.app"; // Base URL for the website

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pt-20 md:pt-24 flex-grow flex flex-col text-white">
      <Head>
        <title>Terms of Service - vaila</title>
      </Head>

      {/* Keep the main motion container */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-8 text-white/80" // Base text color
      >
        {/* --- Header --- */}
        <motion.div variants={sectionVariant} className="text-center mb-10">
          <Scale className="mx-auto h-12 w-12 text-purple-400 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white/95">
            Terms of Service
          </h1>
          <p className="text-lg text-white/70 mt-2">
            Last Updated: {currentDate}
          </p>
        </motion.div>

        {/* --- NEW LEGAL TEXT START --- */}

        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            Acknowledgment
          </h2>
          <p>
            Please read these Terms and Conditions of Use carefully before
            accessing or using the vaila application or website (collectively,
            &quot;Our Service&quot;).
          </p>
          <p>
            By accessing or using Our Service, you agree to be bound by these
            Terms and Conditions (&quot;Terms&quot;) and our{" "}
            <Link href="/privacy" className="text-purple-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
          <p>
            If You do not agree with any part of these Terms, You may not access
            or use the Service.
          </p>
          <p>
            These Terms govern the relationship between You and Taha Parker, the
            provider of the Service, and set out the rights and obligations of
            all users regarding the use of the Service.
          </p>
        </motion.section>

        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            Definitions
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Service</strong> refers to the vaila application and
              website, accessible via {websiteUrl} or any other designated URL.
            </li>
            <li>
              <strong>We, Us, or Our</strong> refers to Taha Parker, the owner
              and operator of the Service.
            </li>
            <li>
              <strong>You</strong> refers to the individual accessing or using
              the Service.
            </li>
            <li>
              <strong>Device</strong> means any device that can access the
              Service, such as a computer, cellphone, or digital tablet.
            </li>
          </ul>
        </motion.section>

        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            Service Description and Use
          </h2>
          <p>
            Our Service provides access to information regarding professor
            schedules by scraping and processing publicly available university
            timetable data.
          </p>
          <p>
            It is intended solely for informational purposes and personal use.
          </p>
          <p>By using the Service, You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Attempt to interfere with or compromise the integrity, security,
              or performance of the Service.
            </li>
            <li>
              Scrape, copy, reproduce, republish, redistribute, or exploit any
              data, code, or content from the Service without explicit written
              permission from Us.
            </li>
            <li>
              Use the Service in a manner that violates applicable laws or the
              rights of others.
            </li>
            <li>
              Attempt to gain unauthorized access to any part of the Service or
              its infrastructure.
            </li>
          </ul>
        </motion.section>

        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            Intellectual Property and Open Source
          </h2>
          <p>
            The underlying application code for the Service is made available
            under an open-source license and can be viewed publicly.
          </p>
          <p>However, You may not:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Copy, modify, distribute, sublicense, or otherwise use parts of
              the Service&apos;s code without complying with its specific
              open-source license terms (if any).
            </li>
            <li>
              Claim ownership of, or commercialize, the Service, its
              functionality, or its presentation.
            </li>
            <li>
              Use any trademarks, service marks, logos, or other brand elements
              without Our prior written consent.
            </li>
          </ul>
          <p>
            The data accessed through the Service is scraped from public
            university websites and is not owned by Us. We make no claim of
            ownership over that data.
          </p>
        </motion.section>

        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            No Warranty and &quot;As Is&quot; Disclaimer
          </h2>
          <p>
            The Service is provided &quot;AS IS&quot; and &quot;AS
            AVAILABLE&quot; without any warranties of any kind, express or
            implied, including but not limited to warranties of merchantability,
            fitness for a particular purpose, non-infringement, or availability.
          </p>
          <p>We do not warrant that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The Service will meet your requirements.</li>
            <li>The Service will be uninterrupted, error-free, or secure.</li>
            <li>The scraped data will be accurate, complete, or up-to-date.</li>
          </ul>
          <p>
            All data may change at any time without notice, and we are not
            responsible for any discrepancies, inaccuracies, or consequences
            arising from its use.
          </p>
        </motion.section>

        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            Limitation of Liability
          </h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL TAHA
            PARKER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
            CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS
            OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES,
            RESULTING FROM:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Your access to or use of the Service;</li>
            <li>Any conduct or content of any third party;</li>
            <li>Any content obtained from the Service;</li>
            <li>
              Unauthorized access, use, or alteration of your transmissions or
              content.
            </li>
          </ul>
          <p>
            YOUR SOLE REMEDY FOR DISSATISFACTION WITH THE SERVICE IS TO STOP
            USING THE SERVICE.
          </p>
        </motion.section>

        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            Copyright and Copying Restrictions
          </h2>
          <p>You may not:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Copy, scrape, or reproduce any part of the Service&apos;s
              structure, features, or functionality without prior written
              consent.
            </li>
            <li>
              Distribute, commercialize, or create derivative works based on the
              Service.
            </li>
            <li>
              Use the Service or its codebase in a way that misleads others as
              to its source or ownership.
            </li>
          </ul>
          <p>All rights not expressly granted are reserved by Us.</p>
        </motion.section>

        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            Governing Law
          </h2>
          <p>
            These Terms and any related disputes shall be governed by and
            construed under the laws of the United Arab Emirates, without regard
            to its conflict of law provisions.
          </p>
        </motion.section>

        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            Disputes Resolution
          </h2>
          <p>
            If You have any concerns or disputes regarding the Service, You
            agree to first try to resolve the issue by contacting Us directly.
          </p>
        </motion.section>

        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            Severability
          </h2>
          <p>
            If any provision of these Terms is deemed invalid or unenforceable,
            the remaining provisions shall remain in full force and effect.
          </p>
        </motion.section>

        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            Changes to Terms
          </h2>
          <p>We reserve the right to modify these Terms at any time.</p>
          <p>
            Changes will be indicated by updating the &quot;Last Updated&quot;
            date.
          </p>
          <p>
            Your continued use of the Service after any such changes constitutes
            Your acceptance of the new Terms.
          </p>
        </motion.section>

        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            Contact Us
          </h2>
          <p>
            For any questions about these Terms, You may contact Us by visiting{" "}
            <Link
              href={contactPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              this page
            </Link>
            .
          </p>
          {/* Make sure the link text matches the actual URL or is descriptive */}
        </motion.section>

        {/* --- END NEW LEGAL TEXT --- */}
      </motion.div>
    </div>
  );
}
