import { Automation, AutomationNode } from "./mockAutomations";

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  nodes: AutomationNode[];
  requiredIntegrations?: string[]; // e.g., ['whatsapp', 'google', 'facebook', 'email']
}

export const automationTemplates: AutomationTemplate[] = [
  {
    id: "template_inbound_call_email_digest",
    name: "Inbound Call → Email Conversation Digest",
    description:
      "When an inbound call completes, send a conversation digest email, then extract appointments, create calendar events, log to Google Sheets, and send booking confirmation when an appointment was booked.",
    icon: "☎️",
    color: "#0ea5e9",
    requiredIntegrations: ["google"],
    nodes: [
      {
        id: "node_1",
        type: "trigger",
        service: "inbound_call_completed",
        config: {
          event: "inbound_call_completed",
        },
        position: 0,
      },
      {
        id: "node_2",
        type: "action",
        service: "aistein_google_gmail_send",
        config: {
          to: "ops-team@example.com",
          subject: "Inbound Call Report - {{contact.name}} ({{contact.phone}})",
          body:
            "Inbound call has completed.\n\n" +
            "Caller Details:\n" +
            "- Name: {{contact.name}}\n" +
            "- Phone: {{contact.phone}}\n" +
            "- Email: {{contact.email}}\n\n" +
            "Call Details:\n" +
            "- Conversation ID: {{conversation.id}}\n" +
            "- Status: {{conversation.status}}\n" +
            "- Duration: {{conversation.duration_seconds}} seconds\n" +
            "- End reason: {{conversation.end_reason}}\n" +
            "- Completed at: {{now}}\n\n" +
            "Summary:\n{{conversation.summary}}\n\n" +
            "Transcript:\n{{conversation.transcript_text}}\n",
          isHtml: false,
        },
        position: 1,
      },
      {
        id: "node_3",
        type: "action",
        service: "aistein_extract_appointment",
        config: {
          conversation_id: "{{conversation_id}}",
          extraction_type: "appointment",
          extraction_prompt:
            "Extract whether a person booked an appointment or not, along with user name",
          json_example: {
            appointment_booked: false,
            appointment_date: "",
            appointment_time: "",
            name: "",
          },
        },
        position: 2,
      },
      {
        id: "node_4",
        type: "condition",
        service: "condition",
        config: {
          field: "appointment.booked",
          operator: "equals",
          value: true,
        },
        position: 3,
      },
      {
        id: "node_5",
        type: "action",
        service: "aistein_google_calendar_create_event",
        config: {
          summary: "Appointment - {{contact.name}}",
          description:
            "Booked via inbound AI call\nConversation ID: {{conversation_id}}\nPhone: {{contact.phone}}",
          startTime: "{{appointment.date}}T{{appointment.time}}:00Z",
          endTime: "{{appointment.date}}T{{appointment.time_plus_30}}:00Z",
          timeZone: "UTC",
          attendees: [{ email: "{{contact.email}}" }],
        },
        position: 4,
      },
      {
        id: "node_6",
        type: "action",
        service: "aistein_google_sheet_append_row",
        config: {
          spreadsheetId: "",
          range: "Sheet1!A1",
          useFixedFormat: true,
        },
        position: 5,
      },
      {
        id: "node_7",
        type: "action",
        service: "aistein_google_gmail_send",
        config: {
          to: "{{contact.email}}",
          subject: "Appointment Confirmed - {{contact.name}}",
          body:
            "Hi {{contact.name}},\n\nYour appointment has been confirmed for {{appointment.date}} at {{appointment.time}}.\n\nWe'll call you at the scheduled time.\n\nThank you!",
          isHtml: false,
        },
        position: 6,
      },
    ],
  },
  {
    id: "template_outbound_batch_call",
    name: "Batch Call → Appointment Booking",
    description: "When batch calling completes, extract appointments from conversations, create calendar events, and log to Google Sheets",
    icon: "📞",
    color: "#8b5cf6",
    requiredIntegrations: ["google"],
    nodes: [
      {
        id: "node_1",
        type: "trigger",
        service: "batch_call_completed",
        config: {
          event: "batch_call_completed",
        },
        position: 0,
      },
      {
        id: "node_2",
        type: "action",
        service: "aistein_extract_appointment",
        config: {
          conversation_id: "{{conversation_id}}",
          extraction_type: "appointment",
          extraction_prompt: "Extract whether a person booked an appointment or not",
          json_example: {
            appointment_booked: false,
            appointment_date: "",
            appointment_time: "",
          },
        },
        position: 1,
      },
      {
        id: "node_3",
        type: "condition",
        service: "condition",
        config: {
          field: "appointment.booked",
          operator: "equals",
          value: true,
        },
        position: 2,
      },
      {
        id: "node_4",
        type: "action",
        service: "aistein_google_calendar_create_event",
        config: {
          summary: "Appointment - {{contact.name}}",
          description: "Booked via AI batch call\nConversation ID: {{conversation_id}}\nPhone: {{contact.phone}}",
          startTime: "{{appointment.date}}T{{appointment.time}}:00Z",
          endTime: "{{appointment.date}}T{{appointment.time_plus_30}}:00Z",
          timeZone: "UTC",
          attendees: [{ email: "{{contact.email}}" }],
        },
        position: 3,
      },
      {
        id: "node_5",
        type: "action",
        service: "aistein_google_sheet_append_row",
        config: {
          spreadsheetId: "",
          range: "Sheet1!A1",
          useFixedFormat: true,
        },
        position: 4,
      },
      {
        id: "node_6",
        type: "action",
        service: "aistein_google_gmail_send",
        config: {
          to: "{{contact.email}}",
          subject: "Appointment Confirmed - {{contact.name}}",
          body: "Hi {{contact.name}},\n\nYour appointment has been confirmed for {{appointment.date}} at {{appointment.time}}.\n\nWe'll call you at the scheduled time.\n\nThank you!",
          isHtml: false,
        },
        position: 5,
      },
      {
        id: "node_7",
        type: "action",
        service: "whatsapp_template",
        config: {
          mode: "automatic",
          templateName: "hello_world",
          languageCode: "en_US" // Example only - users must reconfigure to select actual template with correct language
        },
        position: 6,
      },
    ],
  },
  {
    id: "template_contact_form_email",
    name: "Contact Form Workflow (Email)",
    description: "When a contact form is submitted, wait 10 seconds, send email, and save lead to Google Sheets",
    icon: "📧",
    color: "#3b82f6",
    requiredIntegrations: ["email", "google"],
    nodes: [
      {
        id: "node_1",
        type: "trigger",
        service: "aistein_contact_created",
        config: {
          event: "contact_form_submitted",
          source: "website",
        },
        position: 0,
      },
      {
        id: "node_2",
        type: "delay",
        service: "delay",
        config: { delay: 10, delayUnit: "seconds" },
        position: 1,
      },
      {
        id: "node_3",
        type: "action",
        service: "aistein_send_email",
        config: {
          subject: "Welcome {{contact.name}}!",
          body: "Thank you for contacting us. We'll get back to you soon.",
          is_html: false,
        },
        position: 2,
      },
      {
        id: "node_4",
        type: "action",
        service: "aistein_google_sheet_append_row",
        config: {
          spreadsheetId: "",
          range: "Sheet1!A1",
          values: ["{{contact.name}}", "{{contact.email}}", "{{contact.phone}}", "{{contact.createdAt}}", "Email Sent"],
        },
        position: 3,
      },
    ],
  },
  {
    id: "template_contact_form_whatsapp",
    name: "Contact Form Workflow (WhatsApp)",
    description: "When a contact form is submitted, wait 10 seconds, send WhatsApp message, and save lead to Google Sheets",
    icon: "📝",
    color: "#25d366",
    requiredIntegrations: ["whatsapp", "google"],
    nodes: [
      {
        id: "node_1",
        type: "trigger",
        service: "aistein_contact_created",
        config: {
          event: "contact_form_submitted",
          source: "website",
        },
        position: 0,
      },
      {
        id: "node_2",
        type: "delay",
        service: "delay",
        config: { delay: 10, delayUnit: "seconds" },
        position: 1,
      },
      {
        id: "node_3",
        type: "action",
        service: "whatsapp_template",
        config: {
          template: "form_confirmation",
          variables: {
            name: "{{contact.name}}",
          },
        },
        position: 2,
      },
      {
        id: "node_4",
        type: "action",
        service: "aistein_google_sheet_append_row",
        config: {
          spreadsheetId: "",
          range: "Sheet1!A1",
          values: ["{{contact.name}}", "{{contact.email}}", "{{contact.phone}}", "{{contact.createdAt}}", "WhatsApp Sent"],
        },
        position: 3,
      },
    ],
  },
  {
    id: "template_inbound_chatbox_notify",
    name: "Inbound Chatbox Notify",
    description: "Automatically send an email notification when a new message is received from Facebook, Instagram, or WhatsApp.",
    icon: "💬",
    color: "#10b981",
    requiredIntegrations: ["email"],
    nodes: [
      {
        id: "node_1",
        type: "trigger",
        service: "inbound_chatbox_message",
        config: {
          event: "message_received",
        },
        position: 0,
      },
      {
        id: "node_2",
        type: "action",
        service: "aistein_send_email",
        config: {
          to: "{{contact.email}}",
          subject: "New Inbound Message from {{platform}}",
          body: 
            "Hello,\n\n" +
            "You have received a new inbound chat message.\n\n" +
            "------------------------------\n" +
            "Platform : {{platform}}\n" +
            "Sender   : {{sender_name}}\n" +
            "Contact  : {{contact.phone}}\n" +
            "Message  : {{messageText}}\n" +
            "Time     : {{formatted_now}}\n" +
            "------------------------------\n\n" +
            "Open Conversation:\n" +
            "{{conversation_link}}\n\n" +
            "Please respond as soon as possible.\n\n" +
            "Thanks,\n" +
            "Your Automation System",
          is_html: false,
        },
        position: 1,
      },
    ],
  },
];
