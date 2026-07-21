"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import { supportTicketService, SupportTicket } from "@/services/supportTicket.service";
import { SupportFileUpload } from "./SupportFileUpload";
import { TicketSuccessModal } from "./TicketSuccessModal";
import { collectDiagnostics } from "./DiagnosticsCollector";
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "@/lib/constants";

interface RaiseIssueTabProps {
  defaultCategory?: string;
  onSuccess?: () => void;
}

export function RaiseIssueTab({ defaultCategory = "bug_report", onSuccess }: RaiseIssueTabProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId") || undefined;
  const qc = useQueryClient();

  const [category, setCategory] = useState(defaultCategory);
  const [priority, setPriority] = useState("medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const diagnostics = collectDiagnostics({
        organizationId: user?.organizationId,
        userId: user?.id,
        agentId,
      });

      const formData = new FormData();
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("subject", subject);
      formData.append("description", description);
      formData.append("diagnostics", JSON.stringify(diagnostics));
      if (agentId) {
        formData.append("relatedContext", JSON.stringify({ agentId }));
      }
      files.forEach((f) => formData.append("attachments", f));

      const res = await supportTicketService.createTicket(formData);
      return res.data;
    },
    onSuccess: (ticket) => {
      setCreatedTicket(ticket);
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
      setSubject("");
      setDescription("");
      setFiles([]);
      onSuccess?.();
    },
    onError: () => toast.error("Failed to create ticket. Please try again."),
  });

  const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!subject.trim() || !description.trim()) {
            toast.error("Subject and description are required");
            return;
          }
          mutation.mutate();
        }}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Issue Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {TICKET_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
              {TICKET_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of the issue" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what happened...&#10;&#10;Expected behaviour&#10;&#10;Actual behaviour&#10;&#10;Steps to reproduce"
            rows={8}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Screenshot Upload</label>
          <SupportFileUpload files={files} onChange={setFiles} />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Ticket
        </button>
      </form>

      {createdTicket && (
        <TicketSuccessModal
          ticket={createdTicket}
          onClose={() => setCreatedTicket(null)}
        />
      )}
    </div>
  );
}
