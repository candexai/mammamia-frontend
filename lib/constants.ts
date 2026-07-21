export const COLORS = {
  // Primary
  primary: "#6366f1",
  primaryHover: "#5558e3",

  // Status
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",

  // Backgrounds
  background: "#1a1a1a",
  backgroundSecondary: "#0a0a0a",
  card: "#141414",
  cardHover: "#1f1f1f",
  sidebar: "#2d2d2d",

  // Text
  text: "#e5e5e5",
  textMuted: "#a3a3a3",
  textDisabled: "#737373",

  // Borders
  border: "#262626",
  borderHover: "#404040",

  // Chart colors
  chart1: "#6366f1",
  chart2: "#8b5cf6",
  chart3: "#ec4899",
  chart4: "#f59e0b",
  chart5: "#10b981",
} as const;

export const CONVERSATION_STATUSES = [
  "open",
  "unread",
  "support_request",
  "closed",
] as const;

export const CHANNELS = [
  "whatsapp",
  "website",
  "email",
  "social",
  "phone",
] as const;

export const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  website: "Website",
  email: "Email",
  social: "Social",
  phone: "Phone",
};

export const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  unread: "Unread",
  support_request: "Support Request",
  closed: "Closed",
};

export const CAMPAIGN_STATUSES = ["draft", "scheduled", "sent", "paused"] as const;

export const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  scheduled: "bg-blue-500/20 text-blue-400",
  sent: "bg-green-500/20 text-green-400",
  paused: "bg-yellow-500/20 text-yellow-400",
};

export const ROLES = ["admin", "operator", "viewer"] as const;

export const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-500",
  operator: "bg-blue-500",
  viewer: "bg-gray-500",
};

export const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f59e0b", // Orange
  "#10b981", // Green
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#06b6d4", // Cyan
];

export const PERSONALITY_OPTIONS = [
  { value: "neutral", label: "Neutral 👋" },
  { value: "casual", label: "Casual 🤙" },
  { value: "formal", label: "Formal 🤝" },
] as const;

export const CHARACTER_OPTIONS = [
  { value: "adventurous", label: "Adventurous 🦁" },
  { value: "confident", label: "Confident 💪" },
  { value: "convincing", label: "Convincing 🤝" },
  { value: "energetic", label: "Energetic ⚡" },
  { value: "friendly", label: "Friendly 🙂" },
  { value: "funny", label: "Funny 🤣" },
  { value: "professional", label: "Professional 💼" },
] as const;

export const PERMISSIONS = [
  { id: "conversations", label: "Conversations" },
  { id: "training", label: "Training" },
  { id: "automations", label: "Automations" },
  { id: "contacts", label: "Contacts" },
  { id: "campaigns", label: "Campaigns" },
  { id: "chatbot_test", label: "Chatbot Test" },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" },
] as const;

export const KEYBOARD_SHORTCUTS = [
  { key: "⌘K", action: "Open command palette" },
  { key: "⌘/", action: "Show keyboard shortcuts" },
  { key: "ESC", action: "Close modal/dialog" },
  { key: "⌘N", action: "New conversation" },
  { key: "⌘F", action: "Search" },
] as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const FILE_SIZE_LIMIT = 100 * 1024 * 1024; // 100 MB
export const SUPPORTED_FILE_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".csv",
  ".xlsx",
];

export const DEBOUNCE_DELAY = 300; // ms
export const TOAST_DURATION = 3000; // ms
export const ANIMATION_DURATION = 200; // ms

// Support Center
export const TICKET_CATEGORIES = [
  { value: "bug_report", label: "Bug Report" },
  { value: "feature_request", label: "Feature Request" },
  { value: "billing", label: "Billing" },
  { value: "integration", label: "Integration" },
  { value: "voice_agent", label: "Voice Agent" },
  { value: "knowledge_base", label: "Knowledge Base" },
  { value: "ai_response", label: "AI Response" },
  { value: "performance", label: "Performance" },
  { value: "api", label: "API" },
  { value: "authentication", label: "Authentication" },
  { value: "other", label: "Other" },
] as const;

export const TICKET_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;

export const TICKET_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In Review" },
  { value: "working", label: "Working" },
  { value: "waiting_for_user", label: "Waiting for User" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
  { value: "rejected", label: "Rejected" },
] as const;

export const TICKET_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  in_review: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  working: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  waiting_for_user: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  closed: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

