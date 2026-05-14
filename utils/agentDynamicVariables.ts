const TEMPLATE_VAR_RE = /\{\{(\w+)\}\}/g;

/**
 * Extracts `{{word}}` placeholders from text. Keys are lowercased (aligned with batch-call mapping).
 */
export function extractAgentTemplateVariables(text: string): string[] {
  if (!text?.trim()) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  const re = new RegExp(TEMPLATE_VAR_RE.source, "g");
  while ((m = re.exec(text)) !== null) {
    const key = m[1].toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  }
  return out;
}

/** Distinct placeholder names from first message and system prompt, sorted. */
export function collectAgentPreviewDynamicVariableKeys(
  firstMessage?: string,
  systemPrompt?: string
): string[] {
  const fromFirst = extractAgentTemplateVariables(firstMessage ?? "");
  const fromSystem = extractAgentTemplateVariables(systemPrompt ?? "");
  return Array.from(new Set([...fromFirst, ...fromSystem])).sort((a, b) => a.localeCompare(b));
}
