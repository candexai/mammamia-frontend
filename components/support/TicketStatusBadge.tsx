"use client";

import { TICKET_STATUSES, TICKET_STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function TicketStatusBadge({ status }: { status: string }) {
  const label = TICKET_STATUSES.find((s) => s.value === status)?.label || status;
  const colorClass = TICKET_STATUS_COLORS[status] || "bg-secondary text-muted-foreground";

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", colorClass)}>
      {label}
    </span>
  );
}
