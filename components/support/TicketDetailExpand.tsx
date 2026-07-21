"use client";

import { useState } from "react";
import { Send, RotateCcw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { TicketTimeline } from "./TicketTimeline";
import { SupportTicketDetail, supportTicketService } from "@/services/supportTicket.service";
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "@/lib/constants";

interface TicketDetailExpandProps {
  detail: SupportTicketDetail;
}

export function TicketDetailExpand({ detail }: TicketDetailExpandProps) {
  const { ticket, activity, messages } = detail;
  const [reply, setReply] = useState("");
  const qc = useQueryClient();

  const categoryLabel = TICKET_CATEGORIES.find((c) => c.value === ticket.category)?.label || ticket.category;
  const priorityLabel = TICKET_PRIORITIES.find((p) => p.value === ticket.priority)?.label || ticket.priority;

  const replyMutation = useMutation({
    mutationFn: () => supportTicketService.addReply(ticket._id, reply),
    onSuccess: () => {
      toast.success("Reply sent");
      setReply("");
      qc.invalidateQueries({ queryKey: ["support-ticket", ticket._id] });
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
    },
    onError: () => toast.error("Failed to send reply"),
  });

  const reopenMutation = useMutation({
    mutationFn: () => supportTicketService.reopenTicket(ticket._id),
    onSuccess: () => {
      toast.success("Ticket reopened");
      qc.invalidateQueries({ queryKey: ["support-ticket", ticket._id] });
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });

  const canReply = !["closed", "rejected"].includes(ticket.status);
  const canReopen = ["resolved", "closed"].includes(ticket.status);

  return (
    <div className="border-t border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="p-5 md:p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-base font-bold text-foreground">#{ticket.ticketNumber}</h3>
              <TicketStatusBadge status={ticket.status} />
            </div>
            <p className="font-semibold text-foreground">{ticket.subject}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {categoryLabel} • {priorityLabel} • {new Date(ticket.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-4">
              <h4 className="text-sm font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {ticket.attachments?.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="text-sm font-semibold mb-2">Attachments</h4>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((a, i) => (
                    <a
                      key={i}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline hover:text-primary/80"
                    >
                      {a.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {ticket.resolution && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                <h4 className="text-sm font-semibold text-green-400 mb-1">Resolution</h4>
                <p className="text-sm text-muted-foreground">{ticket.resolution}</p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-4">
              <h4 className="text-sm font-semibold mb-3">Timeline</h4>
              <TicketTimeline activity={activity} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <h4 className="text-sm font-semibold mb-3">Conversation</h4>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No replies yet.</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`p-3 rounded-lg text-sm ${
                        msg.authorType === "admin"
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-secondary border border-border"
                      }`}
                    >
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {msg.authorName || (msg.authorType === "admin" ? "Support Team" : "You")}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {canReply && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={() => replyMutation.mutate()}
                  disabled={!reply.trim() || replyMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> Send Reply
                </button>
              </div>
            )}

            {canReopen && (
              <button
                onClick={() => reopenMutation.mutate()}
                disabled={reopenMutation.isPending}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <RotateCcw className="w-4 h-4" /> Reopen Ticket
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
