// src/components/ui/tooltip.tsx
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

// TooltipProvider remains the same
function TooltipProvider({
  delayDuration = 0, // Keep user's delay duration
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

// Tooltip component (no internal Provider wrapper)
function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

// TooltipTrigger remains the same
function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

// TooltipContent component - MODIFIED
function TooltipContent({
  className,
  sideOffset = 4, // Use Shadcn default unless specified otherwise
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          // Base styles for the tooltip bubble
          "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          // Your custom styles (adjust if needed based on re-install)
          "bg-primary text-primary-foreground", // These seem to override bg-popover etc. Make sure this is intended.
          "w-fit origin-[var(--radix-tooltip-content-transform-origin)] text-balance", // Your additions
          className,
        )}
        {...props}
      >
        {children}
        {/* --- THIS LINE IS COMMENTED OUT --- */}
        {/* <TooltipPrimitive.Arrow className="fill-primary" /> */}
        {/* You might need to adjust the class above ('fill-primary') if your arrow had a different style */}
        {/* --- END COMMENTED OUT LINE --- */}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
