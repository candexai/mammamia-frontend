"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Puzzle, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

type MenuItem = {
  icon: React.ElementType;
  label: string;
  href: string;
  match?: (pathname: string) => boolean;
};

export function TrainingSidebar() {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      icon: MessageSquare,
      label: "AI Behavior",
      href: "/ai",
      match: (p) =>
        p === "/ai" ||
        p.startsWith("/ai/behavior") ||
        p.startsWith("/ai/voice"),
    },
    {
      icon: Bot,
      label: "Agents",
      href: "/ai/agents",
    },
    {
      icon: Puzzle,
      label: "Integrations",
      href: "/ai/integrations",
    },
  ];

  const isActive = (item: MenuItem) =>
    item.match ? item.match(pathname) : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <div className="w-[260px] bg-card border-r border-border h-full flex flex-col">
      <div className="px-3 py-4 flex-shrink-0">
        <h2 className="text-base font-semibold text-foreground">AI</h2>
      </div>

      <nav className="flex-1 space-y-1 px-3 pb-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
