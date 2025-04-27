// src/components/SiteHeader.tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  UserCheck,
  Clock,
  Search,
  Grid3x3,
  Users,
  DoorOpen,
} from "lucide-react";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";

// Font setup
const qurovaFont = localFont({
  src: "../../public/fonts/Qurova-SemiBold.otf",
  weight: "600",
  display: "swap",
});

// Navigation Items
const navItems = [
  { name: "Currently Available", href: "/available-now", icon: UserCheck },
  { name: "Available Soon", href: "/available-soon", icon: Clock },
  { name: "Check Availability", href: "/check", icon: Search },
  { name: "Graph", href: "/graph", icon: Grid3x3 },
  { name: "Professors", href: "/professors", icon: Users },
];
type NavItemType = {
  name: string;
  href: string;
  icon: React.ElementType; // Use React.ElementType for component icons
};

// Vacansee Link details
const vacanseeLink = {
  name: "vacansee",
  href: "https://vacansee.vercel.app/",
  icon: DoorOpen,
};

// *** Define NavLinkProps Interface ***
interface NavLinkProps extends React.HTMLAttributes<HTMLLIElement> {
  // Extend basic attributes like className
  item: NavItemType;
  isMobile?: boolean;
  isDesktop?: boolean;
  currentPath: string;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick?: () => void;
  // Add other props passed down if needed, but className seems to be the only one
}

// --- NavLink Component (Updated Props Type) ---
const NavLink = React.forwardRef<React.ElementRef<"li">, NavLinkProps>( // Use the new interface
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
    const layoutTransition = { type: "spring", stiffness: 500, damping: 35 };
    const labelTransition = { duration: 0.2, ease: "easeInOut" };

    if (isMobile) {
      return (
        <li ref={ref} className={className}>
          {" "}
          {/* Pass className to li */}
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-md transition-colors duration-200 ease-in-out ",
              isActuallyActive
                ? "text-purple-300 font-semibold bg-white/5"
                : "text-white/80 hover:text-white hover:bg-white/10 ",
            )}
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
          layout
          transition={layoutTransition}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
          className={cn("flex", className)}
        >
          {" "}
          {/* Pass className */}
          <Link
            href={item.href}
            aria-current={isActuallyActive ? "page" : undefined}
            className={cn(
              `relative flex items-center justify-center rounded-full transition-colors duration-200 ease-in-out overflow-hidden `,
              showActiveState
                ? `bg-white/10 px-3 py-1.5 `
                : `p-2 hover:hover:bg-white/10 `,
              textColorClass,
            )}
          >
            {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
            <AnimatePresence>
              {" "}
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
                  {" "}
                  {item.name}{" "}
                </motion.span>
              )}{" "}
            </AnimatePresence>
          </Link>
        </motion.li>
      );
    }
    // Fallback if neither mobile nor desktop - should ideally not happen
    return <li ref={ref} className={className}></li>;
  },
);
NavLink.displayName = "NavLink";

// --- Header Component ---
export default function SiteHeader() {
  // --- State Variables ---
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [isSpecialLinkHovered, setIsSpecialLinkHovered] = useState(false);
  const router = useRouter();
  const currentPath = router.pathname;

  // --- Effects ---
  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentPath]);

  // --- Constants ---
  const menuToggleTransition = { duration: 0.2 };
  const mobilePanelTransition = { duration: 0.2, ease: "easeOut" };
  const mobileBackdropTransition = { duration: 0.2, ease: "linear" };
  const specialLabelTransition = { duration: 0.2, ease: "easeInOut" };

  // --- Component Return ---
  return (
    <>
      <header
        className={
          "fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-4 sm:px-6 md:px-8 bg-black/5 backdrop-blur-lg border-b border-white/10"
        }
      >
        {/* Left side: Brand */}
        <div className="flex-shrink-0 z-10 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-semibold transition-opacity hover:opacity-80"
          >
            <CalendarCheck className="h-6 w-6 text-purple-400" />
            {/* *** UPDATED Brand Name *** */}
            <span className={`sm:inline text-xl mt-1 ${qurovaFont.className}`}>
              vaila
            </span>
          </Link>
        </div>

        {/* Right side: Desktop Nav, Special Link, Mobile Trigger */}
        <div className="flex items-center gap-1 sm:gap-2">
          {isMounted ? (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex">
                <ul className="flex items-center gap-x-1">
                  {/* Regular Nav Items */}
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
                  {/* Special Link for Desktop */}
                  <motion.li
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    onHoverStart={() => setIsSpecialLinkHovered(true)}
                    onHoverEnd={() => setIsSpecialLinkHovered(false)}
                    className="flex ml-2"
                  >
                    <a
                      href={vacanseeLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        `relative flex items-center justify-center rounded-full transition-all duration-200 ease-in-out overflow-hidden`,
                        isSpecialLinkHovered
                          ? `bg-white/10 px-3 py-1.5`
                          : `p-2 hover:bg-white/10`,
                        isSpecialLinkHovered ? `text-white` : `text-white/70`,
                      )}
                    >
                      {vacanseeLink.icon && (
                        <vacanseeLink.icon className="h-5 w-5 flex-shrink-0 text-purple-400" />
                      )}
                      <AnimatePresence>
                        {" "}
                        {isSpecialLinkHovered && (
                          <motion.span
                            key="special-label"
                            initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                            animate={{
                              width: "auto",
                              opacity: 1,
                              marginLeft: "0.375rem",
                            }}
                            exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                            transition={specialLabelTransition}
                            className="text-sm font-medium whitespace-nowrap"
                            style={{ lineHeight: "normal" }}
                          >
                            {" "}
                            {vacanseeLink.name}{" "}
                          </motion.span>
                        )}{" "}
                      </AnimatePresence>
                    </a>
                  </motion.li>
                </ul>
              </nav>

              {/* Mobile Menu Trigger */}
              <div className="flex md:hidden ml-1">
                <motion.button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="relative z-[65] flex flex-col justify-center items-center gap-[7px] p-2 rounded-md transition-colors text-white hover:bg-white/10 active:bg-white/20"
                  aria-label="Toggle menu"
                  aria-expanded={isMenuOpen}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    className="w-5 h-px bg-white block rounded-full"
                    animate={
                      isMenuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }
                    }
                    transition={menuToggleTransition}
                  />
                  <motion.span
                    className="w-5 h-px bg-white block rounded-full"
                    animate={
                      isMenuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }
                    }
                    transition={menuToggleTransition}
                  />
                </motion.button>
              </div>
            </>
          ) : (
            /* Placeholder */
            <div className="flex items-center gap-1 sm:gap-2">
              {" "}
              <div className="hidden md:block w-56 h-8 bg-white/5 rounded-full animate-pulse"></div>{" "}
              <div className="w-8 h-8 bg-white/5 rounded-md animate-pulse md:hidden"></div>{" "}
            </div>
          )}
        </div>
      </header>

      {/* --- Mobile Menu Backdrop & Panel --- */}
      <AnimatePresence>
        {" "}
        {isMounted && isMenuOpen && (
          <motion.div
            key="mobile-backdrop"
            className="fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={mobileBackdropTransition}
            onClick={() => setIsMenuOpen(false)}
          />
        )}{" "}
      </AnimatePresence>
      <AnimatePresence>
        {isMounted && isMenuOpen && (
          <motion.div
            key="mobile-menu-panel"
            className={
              "fixed inset-x-4 top-20 z-50 md:hidden bg-gradient-to-br from-black/80 to-black/90 backdrop-blur-xl border border-white/15 shadow-xl rounded-lg overflow-hidden"
            }
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={mobilePanelTransition}
          >
            <div className="max-h-[calc(100vh-6rem)] overflow-y-auto p-4 flex flex-col">
              <nav>
                <ul className="flex flex-col gap-1">
                  {/* Regular Nav Items */}
                  {navItems.map((navItem) => (
                    <NavLink
                      key={navItem.href}
                      item={navItem}
                      isMobile={true}
                      currentPath={currentPath}
                      isHovered={false}
                      onHoverStart={() => {}}
                      onHoverEnd={() => {}}
                      onClick={() => setIsMenuOpen(false)}
                    />
                  ))}
                  {/* Separator */}
                  <hr className="border-white/10 my-2" />
                  {/* Special Link for Mobile */}
                  <li>
                    <a
                      href={vacanseeLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-3 w-full p-3 rounded-md transition-colors duration-200 ease-in-out",
                        "text-white/80 hover:text-white hover:bg-white/10",
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {vacanseeLink.icon && (
                        <vacanseeLink.icon className="h-5 w-5 flex-shrink-0 text-purple-400" />
                      )}
                      <span className="flex-grow text-base">
                        {vacanseeLink.name}
                      </span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
