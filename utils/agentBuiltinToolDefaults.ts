/**
 * Default copy for built-in voice tools (matches backend Python payload defaults).
 * Used as placeholders and initial values when an agent has no saved overrides.
 */
export const DEFAULT_BUILTIN_TOOL_DESCRIPTIONS: Record<
  'end_call' | 'language_detection' | 'voicemail_detection',
  string
> = {
  end_call:
    'End the call when the user says goodbye or asks to hang up.',
  language_detection:
    'Switch TTS language when the user speaks another language.',
  voicemail_detection:
    'Use when you hear a voicemail greeting instead of a human.',
};

export const DEFAULT_VOICEMAIL_LEAVE_MESSAGE =
  'Hi, this is support returning your call. Please call us back at your convenience.';
