// src/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import PlasmaBackground from "@/components/PlasmaBackground";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Onboarding } from "@/components/Onboarding";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { TimeFormatProvider } from "@/contexts/TimeFormatContext";
import { ToastProvider } from "@/components/ui/toast";
import { montserrat, fontOptimization } from "@/lib/fonts";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  // Register service worker for PWA functionality
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered successfully:",
            registration.scope,
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  useEffect(() => {
    fontOptimization.preloadFonts();
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
    router.events.on("routeChangeStart", handleRouteChange);
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <ToastProvider>
      <div
        className={`${montserrat.className} bg-background text-foreground min-h-screen flex flex-col relative`}
      >
        <PlasmaBackground />
        <TimeFormatProvider>
          <SiteHeader maintenanceMode={isMaintenanceMode} />
          <main
            className={cn(
              "flex flex-col flex-grow items-center z-10 w-full px-4 sm:px-8",
              router.pathname === "/" && !isMaintenanceMode
                ? "justify-center pt-16 md:pt-0"
                : router.pathname === "/maintenance"
                  ? "justify-center pt-16"
                  : router.pathname === "/404"
                    ? "justify-center pt-16"
                    : router.pathname === "/500"
                      ? "justify-center pt-16"
                      : "pt-4",
            )}
          >
            <Component {...pageProps} />
          </main>
          <SiteFooter />
        </TimeFormatProvider>

        <ScrollToTop />
        <Onboarding />
        <PWAInstallPrompt />

        <Analytics />
        <SpeedInsights />
      </div>
    </ToastProvider>
  );
}
