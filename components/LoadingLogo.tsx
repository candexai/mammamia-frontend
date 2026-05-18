"use client";

import { cn } from "@/lib/utils";
import { MammamiaLogo } from "@/components/brand/MammamiaLogo";

interface LoadingLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingLogo({
  size = "md",
  showText = true,
  text = "Loading...",
  className,
  fullScreen = false,
}: LoadingLogoProps) {
  const logoSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "md";

  const content = (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      <MammamiaLogo size={logoSize} showWordmark className="flex-col gap-2" wordmarkClassName="text-foreground" />
      <div className="w-36 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full w-2/5 bg-muted-foreground/40 rounded-full animate-[shimmer_1.4s_ease-in-out_infinite]" />
      </div>
      {showText && (
        <p className="text-sm text-muted-foreground font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
}
