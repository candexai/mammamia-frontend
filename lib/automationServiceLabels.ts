import { BRAND_NAME_TITLE } from "@/lib/brand";

const prefix = `${BRAND_NAME_TITLE} – `;

/** Human-readable labels for automation node services (IDs unchanged for backend). */
export function getAutomationServiceLabel(service: string): string {
  const map: Record<string, string> = {
    aistein_contact_created: "Contact Created",
    aistein_contact_deleted: "Contact Deleted",
    aistein_contact_moved: "Contact Moved",
    aistein_create_contact: "Create Contact",
    conversation_created: `${prefix}Call Finished (AI Agent)`,
    inbound_call_completed: `${prefix}Inbound Call Completed`,
    batch_call_completed: `${prefix}Batch Call Completed`,
    batch_call: `${prefix}Batch Call (CSV/List)`,
    aistein_batch_calling: `${prefix}Batch Call (CSV/List)`,
    aistein_extract_data: `${prefix}Extract Conversation Data`,
    aistein_extract_appointment: `${prefix}Extract Appointment`,
    aistein_outbound_call: `${prefix}Outbound Call`,
    aistein_send_sms: `${prefix}Send SMS`,
    aistein_send_email: `${prefix}Send Email`,
    aistein_mass_sending: `${prefix}Mass Sending`,
    aistein_api_call: `${prefix}API Call`,
    aistein_google_calendar_check_availability: "Google Calendar – Check Availability",
    aistein_google_calendar_create_event: "Google Calendar – Create Event",
    aistein_google_sheet_append_row: "Google Sheets – Append Row",
    aistein_user_google_sheet_append_row: "Google Sheets – Append Row",
    aistein_google_gmail_send: "Gmail – Send Email",
    inbound_chatbox_message: "Inbound Chatbox Message",
    delay: "Delay",
  };

  if (map[service]) return map[service];

  if (service.startsWith("aistein_")) {
    const rest = service.replace(/^aistein_/, "").replace(/_/g, " ");
    return `${prefix}${rest.replace(/\b\w/g, (c) => c.toUpperCase())}`;
  }

  return service.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getAutomationServiceIcon(service: string): string {
  const icons: Record<string, string> = {
    aistein_contact_created: "👤",
    aistein_contact_deleted: "🗑️",
    aistein_contact_moved: "📋",
    aistein_create_contact: "➕",
    aistein_send_email: "📧",
    aistein_outbound_call: "📞",
    aistein_mass_sending: "📤",
    batch_call: "📤",
    aistein_extract_data: "🧠",
    aistein_extract_appointment: "📅",
    aistein_google_calendar_check_availability: "📅",
    aistein_google_calendar_create_event: "📅",
    aistein_google_sheet_append_row: "📊",
    aistein_google_gmail_send: "📧",
    inbound_chatbox_message: "💬",
    delay: "⏱️",
  };
  return icons[service] ?? "⚙️";
}
