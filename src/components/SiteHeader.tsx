// src/components/SiteHeader.tsx
//
// vaila site header. No auth (public app). Mirrors vacansee's
// navigation aesthetic — fixed glass bar, hover-revealed labels on
// desktop, motion panel on mobile.

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserRound,
  Clock,
  Search,
  Grid3x3,
  BadgeInfo,
  DoorOpen,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { qurovaFont } from "@/lib/fonts";

const navItems = [
  { name: "Available Now", href: "/available-now", icon: UserRound },
  { name: "Available Soon", href: "/available-soon", icon: Clock },
  { name: "Check Availability", href: "/check", icon: Search },
  { name: "Graph", href: "/graph", icon: Grid3x3 },
  { name: "Professors", href: "/professors", icon: BadgeInfo },
];
type NavItemType = (typeof navItems)[0];

const vacanseeLink = {
  name: "vacansee",
  href: "https://vacan.see/",
  icon: DoorOpen,
};

const NavLink = React.forwardRef<
  React.ElementRef<"li">,
  Omit<React.ComponentPropsWithoutRef<typeof Link>, "href" | "children"> & {
    item: NavItemType;
    isMobile?: boolean;
    isDesktop?: boolean;
    currentPath: string;
    isHovered: boolean;
    onHoverStart: () => void;
    onHoverEnd: () => void;
    onClick?: () => void;
  }
>(
  (
    {
      className,
      item,
      isMobile,
      isDesktop,
      currentPath,
      isHovered,
      onHoverStart,
      onHoverEnd,
      onClick,
    },
    ref,
  ) => {
    const isActuallyActive = item.href === currentPath;
    const labelTransition = { duration: 0.2, ease: "easeInOut" };

    if (isMobile) {
      return (
        <li ref={ref}>
          <Link
            href={item.href}
            className={
              "flex items-center gap-3 w-full p-3 rounded-md transition-colors duration-200 ease-in-out " +
              (isActuallyActive
                ? "text-purple-500 font-semibold bg-white/5"
                : "text-white/80 hover:text-white hover:bg-white/10 ") +
              (className ?? "")
            }
            onClick={onClick}
            aria-current={isActuallyActive ? "page" : undefined}
          >
            {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
            <span className="flex-grow text-base">{item.name}</span>
          </Link>
        </li>
      );
    }

    if (isDesktop) {
      const showActiveState = isHovered || isActuallyActive;
      const textColorClass = isHovered
        ? "text-white"
        : isActuallyActive
          ? "text-white/90"
          : "text-white/70";

      return (
        <motion.li
          ref={ref}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
          className="flex"
        >
          <Link
            href={item.href}
            aria-current={isActuallyActive ? "page" : undefined}
            className={
              `relative flex items-center justify-center rounded-full transition-colors duration-200 ease-in-out overflow-hidden ` +
              (showActiveState
                ? `bg-white/10 px-3 py-1.5 `
                : `p-2 hover:bg-white/10 `) +
              textColorClass +
              (className ?? "")
            }
          >
            {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
            <AnimatePresence>
              {showActiveState && (
                <motion.span
                  key="label"
                  initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                  animate={{
                    width: "auto",
                    opacity: 1,
                    marginLeft: "0.375rem",
                  }}
                  exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                  transition={labelTransition}
                  className="text-sm font-medium whitespace-nowrap"
                  style={{ lineHeight: "normal" }}
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </motion.li>
      );
    }
    return <li ref={ref}></li>;
  },
);
NavLink.displayName = "NavLink";

interface SiteHeaderProps {
  maintenanceMode?: boolean;
}

export default function SiteHeader({
  maintenanceMode = false,
}: SiteHeaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [isVacanseeLinkHovered, setIsVacanseeLinkHovered] = useState(false);
  const router = useRouter();
  const currentPath = router.pathname;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentPath]);

  const menuToggleTransition = { duration: 0.2 };
  const mobilePanelTransition = { duration: 0.2, ease: "easeOut" };
  const mobileBackdropTransition = { duration: 0.2, ease: "linear" };
  const vacanseeLabelTransition = { duration: 0.2, ease: "easeInOut" };

  return (
    <>
      <header
        className={
          "fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-4 sm:px-6 md:px-8 bg-black/5 backdrop-blur-lg border-b border-white/10"
        }
        role="banner"
        aria-label="Main navigation"
      >
        <div className="flex-shrink-0 z-10 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-semibold transition-opacity hover:opacity-80"
            onClick={(e) => {
              if (maintenanceMode && router.pathname !== "/maintenance") {
                e.preventDefault();
                router.push("/maintenance");
              }
            }}
          >
            <UserRound className="h-6 w-6 text-purple-500" />
            <span className={`sm:inline text-xl mt-1 ${qurovaFont.className}`}>
              vaila
            </span>
          </Link>
        </div>

        {!maintenanceMode && isMounted && (
          <div className="flex items-center gap-1 sm:gap-2">
            <nav
              className="hidden md:flex"
              role="navigation"
              aria-label="Main navigation"
            >
              <ul className="flex items-center gap-x-1" role="menubar">
                {navItems.map((navItem) => (
                  <NavLink
                    key={navItem.href}
                    item={navItem}
                    isDesktop={true}
                    currentPath={currentPath}
                    isHovered={hoveredHref === navItem.href}
                    onHoverStart={() => setHoveredHref(navItem.href)}
                    onHoverEnd={() => setHoveredHref(null)}
                  />
                ))}
              </ul>
            </nav>

            {/* vacansee cross-link (desktop) */}
            <div className="hidden md:flex items-center ml-2 h-10">
              <motion.a
                href={vacanseeLink.href}
                target="_blank"
                rel="noopener noreferrer"
                onHoverStart={() => setIsVacanseeLinkHovered(true)}
                onHoverEnd={() => setIsVacanseeLinkHovered(false)}
                className={
                  `relative flex items-center justify-center rounded-full transition-colors duration-200 ease-in-out overflow-hidden ` +
                  (isVacanseeLinkHovered
                    ? `bg-white/10 px-3 py-1.5 text-white`
                    : `p-2 hover:bg-white/10 text-white/80`)
                }
                aria-label="Open vacansee"
              >
                <vacanseeLink.icon className="h-5 w-5 flex-shrink-0" />
                <AnimatePresence>
                  {isVacanseeLinkHovered && (
                    <motion.span
                      key="vacansee-label"
                      initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                        marginLeft: "0.375rem",
                      }}
                      exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                      transition={vacanseeLabelTransition}
                      className="text-sm font-medium whitespace-nowrap"
                      style={{ lineHeight: "normal" }}
                    >
                      {vacanseeLink.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.a>
            </div>

            {/* Mobile burger */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-full w-10 h-10 text-white/80 hover:text-white hover:bg-white/10"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMenuOpen((v) => !v)}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={menuToggleTransition}
                className="flex flex-col gap-1"
              >
                <span className="block w-5 h-0.5 bg-current" />
                <span className="block w-5 h-0.5 bg-current" />
                <span className="block w-5 h-0.5 bg-current" />
              </motion.div>
            </button>
          </div>
        )}
      </header>

      {/* Mobile panel */}
      <AnimatePresence>
        {!maintenanceMode && isMenuOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={mobileBackdropTransition}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              key="mobile-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={mobilePanelTransition}
              className="fixed top-16 right-0 bottom-0 z-40 w-72 max-w-[85vw] bg-black/80 backdrop-blur-xl border-l border-white/10 md:hidden"
              role="dialog"
              aria-modal="true"
            >
              <nav className="flex flex-col p-4" aria-label="Mobile navigation">
                <ul className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      isMobile
                      currentPath={currentPath}
                      isHovered={false}
                      onHoverStart={() => {}}
                      onHoverEnd={() => {}}
                      onClick={() => setIsMenuOpen(false)}
                    />
                  ))}
                </ul>
                <Separator className="my-3 bg-white/10" />
                <a
                  href={vacanseeLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full p-3 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <vacanseeLink.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-grow text-base">
                    {vacanseeLink.name}
                  </span>
                </a>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
