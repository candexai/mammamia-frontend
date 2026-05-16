/** Defaults for the "Extract Appointment" automation action (Python extract-data schema). */
export const EXTRACT_APPOINTMENT_DEFAULT_PROMPT =
  "Extract whether a person booked an appointment or not";

export const EXTRACT_APPOINTMENT_DEFAULT_JSON: Record<string, string | boolean | null> = {
  appointment_booked: false,
  appointment_date: "",
  appointment_time: "",
};

/**
 * Ensures Extract Appointment nodes use appointment_* keys for the Python API.
 * Merges extra fields from agent suggest (e.g. address, budget) without date/time aliases.
 */
export function mergeSchemaForExtractAppointmentNode(
  suggestedPrompt: string,
  suggestedExample: Record<string, unknown>
): { extraction_prompt: string; json_example: Record<string, unknown> } {
  const extra: Record<string, unknown> = { ...suggestedExample };
  delete extra.date;
  delete extra.time;
  delete extra.appointment_date;
  delete extra.appointment_time;
  delete extra.appointment_booked;

  const prompt =
    suggestedPrompt?.trim() && /appointment|booked|booking/i.test(suggestedPrompt)
      ? suggestedPrompt.trim()
      : EXTRACT_APPOINTMENT_DEFAULT_PROMPT;

  return {
    extraction_prompt: prompt,
    json_example: {
      ...EXTRACT_APPOINTMENT_DEFAULT_JSON,
      ...extra,
    },
  };
}
