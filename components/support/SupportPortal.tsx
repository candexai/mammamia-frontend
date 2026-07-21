"use client";

import { useState, Suspense } from "react";
import { MyTicketsTab } from "./MyTicketsTab";
import { RaiseIssueTab } from "./RaiseIssueTab";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "tickets", label: "My Tickets" },
  { id: "raise", label: "Raise New Issue" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SupportPortal() {
  const [activeTab, setActiveTab] = useState<TabId>("tickets");

  return (
    <div>
      <div className="border-b border-border mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "tickets" && <MyTicketsTab />}
      {activeTab === "raise" && (
        <Suspense fallback={null}>
          <RaiseIssueTab onSuccess={() => setActiveTab("tickets")} />
        </Suspense>
      )}
    </div>
  );
}
