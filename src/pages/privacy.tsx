// src/pages/privacy.tsx
import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react"; // Keep Shield icon
import Link from "next/link"; // Import Link

export default function PrivacyPage() {
  const sectionVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // --- REPLACE PLACEHOLDERS ---
  const currentDate = "April 27, 2025"; // CHANGE THIS DATE
  const developerName = "Taha Parker"; // Or your name/entity
  const contactPageUrl = "https://tahayparker.vercel.app/contact"; // Your contact page
  const websiteName = "vaila";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pt-20 md:pt-24 flex-grow flex flex-col text-white">
      <Head>
        <title>Privacy Policy - vaila</title>
      </Head>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-8 text-white/80" // Base text color
      >
        <motion.div variants={sectionVariant} className="text-center mb-10">
          <ShieldCheck className="mx-auto h-12 w-12 text-purple-400 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white/95">
            Privacy Policy
          </h1>
          <p className="text-lg text-white/70 mt-2">
            Last Updated: {currentDate}
          </p>
        </motion.div>

        {/* --- Introduction --- */}
        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            1. Introduction
          </h2>
          <p>
            Welcome to {websiteName}. This Privacy Policy explains how{" "}
            {developerName} (&quot;We&quot;, &quot;Us&quot;, or &quot;Our&quot;)
            handles information when You use the {websiteName} application or
            website (the &quot;Service&quot;).
          </p>
          <p>
            By using the Service, You agree to the collection and use of
            information in accordance with this policy. Please also review our{" "}
            <Link href="/legal" className="text-purple-400 hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </motion.section>

        {/* --- Information We Collect (Focus on Analytics) --- */}
        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            2. Information We Collect
          </h2>
          <p>
            We strive to minimize data collection. We do not require You to
            create an account or provide personal identification information
            (like name or email) to use the core features of the Service. The
            information We collect is primarily limited to:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>
              <strong>Usage Data (Analytics):</strong> When You use the Service,
              We automatically collect certain information through Vercel
              Analytics and Vercel Speed Insights. This may include:
              <ul className="list-['-_'] list-inside pl-6 text-base space-y-1 mt-1">
                <li>
                  Your Device&apos;s Internet Protocol (IP) address (often
                  anonymized or aggregated).
                </li>
                <li>Browser type and version.</li>
                <li>The pages of Our Service that You visit.</li>
                <li>The time and date of Your visit.</li>
                <li>The time spent on those pages.</li>
                <li>Unique device identifiers and other diagnostic data.</li>
                <li>Website performance metrics.</li>
              </ul>
              This data helps Us understand how the Service is used, monitor its
              performance, and identify areas for improvement. Vercel&apos;s
              data handling is subject to its own privacy policy.
            </li>
            <li>
              <strong>Cookies:</strong> We do not use cookies for tracking or
              advertising. Any cookies used are strictly necessary for the basic
              functionality provided by Our hosting platform (Vercel) or
              potentially for analytics aggregation (e.g., distinguishing unique
              visits within a session). You can typically configure Your browser
              to refuse cookies, but some parts of the Service may not function
              properly.
            </li>
          </ul>
          <p>
            <strong>Schedule Data Source:</strong> Please note that the
            professor schedule information displayed in the Service is sourced
            from publicly available university timetable data. We do not collect
            this schedule data directly from individuals.
          </p>
        </motion.section>

        {/* --- How We Use Information --- */}
        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            3. How We Use Your Information
          </h2>
          <p>
            We use the collected Usage Data primarily for the following
            purposes:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>To provide, maintain, and monitor the usage of Our Service.</li>
            <li>
              To analyze trends and improve the Service&apos;s features,
              performance, and user experience.
            </li>
            <li>
              To detect, prevent, and address technical issues or security
              threats.
            </li>
          </ul>
        </motion.section>

        {/* --- Sharing of Information --- */}
        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            4. Sharing of Information
          </h2>
          <p>
            We do not sell Your information. We only share Usage Data in the
            following limited circumstances:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>
              <strong>Service Providers:</strong> We use Vercel for hosting and
              analytics. Vercel processes Usage Data on Our behalf according to
              their terms and privacy policies. We use Supabase for database
              hosting, accessed primarily by Our backend scripts and APIs.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose information
              if required to do so by law or in response to valid requests by
              public authorities (e.g., a court or government agency).
            </li>
            <li>
              <strong>Protect Rights:</strong> We may share information if We
              believe it&apos;s necessary to investigate, prevent, or take
              action regarding potential violations of Our policies, suspected
              fraud, situations involving potential threats to the safety of any
              person, or as evidence in litigation.
            </li>
          </ul>
        </motion.section>

        {/* --- Data Security --- */}
        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            5. Data Security
          </h2>
          <p>
            We rely on the security measures implemented by Our service
            providers (Vercel, Supabase) to protect the infrastructure and any
            collected data. This includes measures like encryption and access
            controls. However, please be aware that no method of transmission
            over the Internet or method of electronic storage is 100% secure.
            While We strive to use commercially acceptable means to protect
            information, We cannot guarantee its absolute security.
          </p>
        </motion.section>

        {/* --- Data Retention --- */}
        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            6. Data Retention
          </h2>
          <p>
            Usage Data collected via Vercel Analytics is retained according to
            Vercel&apos;s policies, typically for a limited period necessary for
            analysis and reporting. We do not store long-term logs containing
            personal identifiers derived from Usage Data.
          </p>
        </motion.section>

        {/* --- Children's Privacy --- */}
        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            7. Children&apos;s Privacy
          </h2>
          <p>
            Our Service is not intended for use by anyone under the age of 13
            (or the relevant age of digital consent in your jurisdiction). We do
            not knowingly collect personally identifiable information from
            children. If You are a parent or guardian and You are aware that
            Your child has provided Us with information without Your consent,
            please contact Us.
          </p>
        </motion.section>

        {/* --- Links to Other Websites --- */}
        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            8. Links to Other Websites
          </h2>
          <p>
            Our Service may contain links to other websites that are not
            operated by Us (e.g., the developer&apos;s contact page). If You
            click on a third-party link, You will be directed to that third
            party&apos;s site. We strongly advise You to review the Privacy
            Policy of every site You visit. We have no control over and assume
            no responsibility for the content, privacy policies or practices of
            any third-party sites or services.
          </p>
        </motion.section>

        {/* --- Changes to This Policy --- */}
        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            9. Changes to This Privacy Policy
          </h2>
          <p>
            We may update Our Privacy Policy from time to time. We will notify
            You of any changes by posting the new Privacy Policy on this page
            and updating the &quot;Last Updated&quot; date at the top.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any
            changes. Changes to this Privacy Policy are effective when they are
            posted on this page.
          </p>
        </motion.section>

        {/* --- Contact Us --- */}
        <motion.section variants={sectionVariant} className="space-y-3">
          <h2 className="text-2xl font-semibold text-white/90 border-b border-white/20 pb-2 mb-4">
            Contact Us
          </h2>
          <p>
            For any questions about this Privacy Policy, You may contact Us by
            visiting{" "}
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
      </motion.div>
    </div>
  );
}
