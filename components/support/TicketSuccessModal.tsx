"use client";

import { CheckCircle, X } from "lucide-react";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { SupportTicket } from "@/services/supportTicket.service";

interface TicketSuccessModalProps {
  ticket: SupportTicket;
  onClose: () => void;
}

export function TicketSuccessModal({ ticket, onClose }: TicketSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Ticket Created Successfully</h2>
          <p className="text-3xl font-bold text-primary mb-4">#{ticket.ticketNumber}</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Status:</span>
            <TicketStatusBadge status={ticket.status} />
          </div>
          <p className="text-sm text-muted-foreground mb-2">We have emailed our support team.</p>
          <p className="text-sm text-muted-foreground">Average response time: &lt; 24 hours</p>
          <button
            onClick={onClose}
            className="mt-6 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
          >
            View My Tickets
          </button>
        </div>
      </div>
    </div>
  );
}
