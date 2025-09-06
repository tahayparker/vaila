// src/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Montserrat } from "next/font/google";
import GradientBackground from "@/components/GradientBackground";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// --- Font Setup ---
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"],
});

// --- App Component ---
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Render the component directly (no auth loading)
  return (
    <div
      className={`${montserrat.className} bg-background text-foreground min-h-screen flex flex-col relative`}
    >
      <GradientBackground />
      <SiteHeader />
      {/* --- MODIFIED <main> Styling --- */}
      <main
        className={cn(
          // Base styles: flex column, grow, center items horizontally
          "flex flex-col flex-grow items-center z-10 w-full px-4 sm:px-8",
          // Conditional styles for pages that should be vertically centered:
          // Homepage, 404, and 500 error pages should be vertically centered
          // Apply vertical centering on all screen sizes, with appropriate padding adjustments
          (router.pathname === "/" ||
            router.pathname === "/404" ||
            router.pathname === "/500") &&
            "justify-center pt-16 sm:pt-20 md:pt-0",
          // REMOVED: The general 'justify-center' that was applied to all non-homepage routes.
          // Now, pages other than '/', '/404', '/500' will naturally start their content flow from the top
          // of the main area (below the header).
        )}
      >
        <Component {...pageProps} />
      </main>
      {/* --- End MODIFIED <main> Styling --- */}
      <SiteFooter />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
