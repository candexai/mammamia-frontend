/** Defaults for batch / generic Extract Appointment nodes (no name field). */
export const EXTRACT_APPOINTMENT_DEFAULT_PROMPT =
  "Extract whether a person booked an appointment or not";

export const EXTRACT_APPOINTMENT_DEFAULT_JSON: Record<string, string | boolean | null> = {
  appointment_booked: false,
  appointment_date: "",
  appointment_time: "",
};

/** Inbound call automations — includes caller name in prompt + JSON schema. */
export const EXTRACT_APPOINTMENT_INBOUND_DEFAULT_PROMPT =
  "Extract whether a person booked an appointment or not, along with user name";

export const EXTRACT_APPOINTMENT_INBOUND_DEFAULT_JSON: Record<string, string | boolean | null> = {
  appointment_booked: false,
  appointment_date: "",
  appointment_time: "",
  name: "",
};

export function isInboundCallAutomation(nodes: { type?: string; service?: string }[]): boolean {
  return nodes.some((n) => n.type === "trigger" && n.service === "inbound_call_completed");
}

export function getExtractAppointmentDefaults(forInbound: boolean): {
  extraction_prompt: string;
  json_example: Record<string, string | boolean | null>;
} {
  return forInbound
    ? {
        extraction_prompt: EXTRACT_APPOINTMENT_INBOUND_DEFAULT_PROMPT,
        json_example: { ...EXTRACT_APPOINTMENT_INBOUND_DEFAULT_JSON },
      }
    : {
        extraction_prompt: EXTRACT_APPOINTMENT_DEFAULT_PROMPT,
        json_example: { ...EXTRACT_APPOINTMENT_DEFAULT_JSON },
      };
}

/**
 * Ensures Extract Appointment nodes use appointment_* keys for the Python API.
 * Merges extra fields from agent suggest (e.g. address, budget) without date/time aliases.
 */
export function mergeSchemaForExtractAppointmentNode(
  suggestedPrompt: string,
  suggestedExample: Record<string, unknown>,
  options?: { inbound?: boolean }
): { extraction_prompt: string; json_example: Record<string, unknown> } {
  const extra: Record<string, unknown> = { ...suggestedExample };
  delete extra.date;
  delete extra.time;
  delete extra.appointment_date;
  delete extra.appointment_time;
  delete extra.appointment_booked;

  const base = getExtractAppointmentDefaults(!!options?.inbound);
  const prompt =
    suggestedPrompt?.trim() && /appointment|booked|booking/i.test(suggestedPrompt)
      ? suggestedPrompt.trim()
      : base.extraction_prompt;

  return {
    extraction_prompt: prompt,
    json_example: {
      ...base.json_example,
      ...extra,
    },
  };
}
