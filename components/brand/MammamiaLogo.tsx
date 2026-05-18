"use client";

import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";

interface MammamiaLogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

const boxSizes = {
  xs: "h-7 w-7 rounded-md",
  sm: "h-9 w-9 rounded-lg",
  md: "h-10 w-10 rounded-lg",
  lg: "h-14 w-14 rounded-xl",
};

const wordmarkSizes = {
  xs: "text-sm",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

/** Logo mark: white tile + speech pulse (matches mammam-ia.it). */
export function MammamiaLogo({
  size = "md",
  showWordmark = true,
  className,
  wordmarkClassName,
}: MammamiaLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5 min-w-0", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center bg-white shadow-sm ring-1 ring-black/5 dark:ring-white/10",
          boxSizes[size]
        )}
        aria-hidden
      >
        <svg
          viewBox="0 0 32 32"
          className="h-[58%] w-[58%] text-black"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 8.5C6 6.57 7.57 5 9.5 5h9.8c1.38 0 2.5 1.12 2.5 2.5v1.2c0 .55.45 1 1 1h2.2C25.43 9.7 27 11.27 27 13.2v8.3c0 1.93-1.57 3.5-3.5 3.5h-9.8c-1.38 0-2.5-1.12-2.5-2.5v-1.2c0-.55-.45-1-1-1H8.5C6.57 20.3 5 18.73 5 16.8V8.5z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M11 14.5h3.2M17.8 14.5h3.2M11 18h10.2"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showWordmark && (
        <span
          className={cn(
            "truncate font-semibold tracking-tight text-sidebar-foreground lowercase",
            wordmarkSizes[size],
            wordmarkClassName
          )}
        >
          {BRAND_NAME}
        </span>
      )}
    </div>
  );
}
