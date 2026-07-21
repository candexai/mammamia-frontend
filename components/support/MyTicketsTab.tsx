"use client";

import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, ChevronDown } from "lucide-react";
import { supportTicketService } from "@/services/supportTicket.service";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { TicketDetailExpand } from "./TicketDetailExpand";
import { TICKET_CATEGORIES } from "@/lib/constants";

const COL_COUNT = 7;

export function MyTicketsTab({ onSelectTicket }: { onSelectTicket?: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["support-tickets", search],
    queryFn: () => supportTicketService.listTickets({ search: search || undefined, limit: 50 }),
  });

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["support-ticket", selectedId],
    queryFn: () => supportTicketService.getTicket(selectedId!),
    enabled: !!selectedId,
  });

  const tickets = data?.items || [];

  const handleSelect = (id: string) => {
    const next = selectedId === id ? null : id;
    setSelectedId(next);
    if (next) onSelectTicket?.(next);
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tickets..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No support tickets yet.</p>
          <p className="text-sm mt-1">Raise a new issue to get started.</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="w-8 p-3" aria-hidden />
                <th className="text-left p-3 font-medium text-muted-foreground">Ticket</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Subject</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Priority</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const isExpanded = selectedId === t._id;
                return (
                  <Fragment key={t._id}>
                    <tr
                      onClick={() => handleSelect(t._id)}
                      className={`border-b border-border cursor-pointer transition-colors ${
                        isExpanded ? "bg-primary/5 hover:bg-primary/5" : "hover:bg-secondary/30"
                      }`}
                    >
                      <td className="p-3 pl-4">
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-primary" : ""
                          }`}
                        />
                      </td>
                      <td className="p-3 font-mono text-primary font-medium">{t.ticketNumber}</td>
                      <td className="p-3 max-w-[200px] truncate">{t.subject}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">
                        {TICKET_CATEGORIES.find((c) => c.value === t.category)?.label || t.category}
                      </td>
                      <td className="p-3 hidden lg:table-cell capitalize text-muted-foreground">{t.priority}</td>
                      <td className="p-3"><TicketStatusBadge status={t.status} /></td>
                      <td className="p-3 hidden sm:table-cell text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-border last:border-0">
                        <td colSpan={COL_COUNT} className="p-0">
                          {detailLoading ? (
                            <div className="flex justify-center py-10 border-t border-primary/20 bg-primary/5">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                          ) : detailData ? (
                            <TicketDetailExpand detail={detailData} />
                          ) : null}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
