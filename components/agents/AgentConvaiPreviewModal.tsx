"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useConvaiWidgetEmbed } from "@/hooks/useConvaiWidgetEmbed";
import { collectAgentPreviewDynamicVariableKeys } from "@/utils/agentDynamicVariables";
import { X, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  agentId: string | null;
  agentName?: string;
  firstMessage?: string;
  systemPrompt?: string;
};

type PreviewStep = "collect-vars" | "widget";

/**
 * ConvAI preview in a support-style card (portaled to `document.body` so it stacks above the sidebar).
 * If the agent uses `{{name}}`-style placeholders in the first message or system prompt, values are collected first.
 */
export function AgentConvaiPreviewModal({
  open,
  onClose,
  agentId,
  agentName,
  firstMessage,
  systemPrompt,
}: Props) {
  const [mountEl, setMountEl] = useState<HTMLDivElement | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [step, setStep] = useState<PreviewStep>("widget");
  const [varValues, setVarValues] = useState<Record<string, string>>({});

  const requiredKeys = useMemo(
    () => collectAgentPreviewDynamicVariableKeys(firstMessage, systemPrompt),
    [firstMessage, systemPrompt]
  );

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setStep("widget");
      setVarValues({});
      setMountEl(null);
      return;
    }
    const keys = collectAgentPreviewDynamicVariableKeys(firstMessage, systemPrompt);
    if (keys.length === 0) {
      setStep("widget");
      setVarValues({});
    } else {
      setStep("collect-vars");
      setVarValues(Object.fromEntries(keys.map((k) => [k, ""])));
    }
  }, [open, firstMessage, systemPrompt]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const dynamicVariablesForEmbed = useMemo(() => {
    if (requiredKeys.length === 0) return { name: "Guest" };
    if (step !== "widget") return { name: "Guest" };
    const out: Record<string, string> = {};
    for (const k of requiredKeys) {
      out[k] = String(varValues[k] ?? "").trim();
    }
    return out;
  }, [requiredKeys, step, varValues]);

  const widgetReady = open && !!agentId && !!mountEl && step === "widget";

  const { status, errorMessage } = useConvaiWidgetEmbed(agentId, widgetReady, {
    variant: "expanded",
    placement: "center",
    dynamicVariables: dynamicVariablesForEmbed,
    mountParent: mountEl,
    actionText: "Need help?",
    startCallText: "Start a call",
  });

  const handleContinueToWidget = () => {
    const missing = requiredKeys.filter((k) => !String(varValues[k] ?? "").trim());
    if (missing.length > 0) {
      toast.error(`Please enter a value for: ${missing.map((k) => `{{${k}}}`).join(", ")}`);
      return;
    }
    setStep("widget");
  };

  if (!portalReady || !open || !agentId) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[500] flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-8 backdrop-blur-sm sm:items-center sm:py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-preview-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "my-auto flex w-full max-w-[min(960px,calc(100vw-1rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl ring-1 ring-black/5 dark:ring-white/10",
          step === "widget" && "h-[min(90dvh,880px)] max-h-[min(94dvh,920px)]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 bg-primary px-4 py-3 text-primary-foreground">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
              <MessageCircle className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 id="agent-preview-title" className="truncate text-sm font-semibold sm:text-base">
                {agentName?.trim() || "Support assistant"}
              </h2>
              <p className="text-xs text-primary-foreground/80">
                {step === "collect-vars" ? "Preview variables" : "Online"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-primary-foreground/90 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border px-4 py-2">
          <p className="truncate font-mono text-[10px] text-muted-foreground" title={agentId}>
            {agentId}
          </p>
        </div>

        {step === "collect-vars" ? (
          <div className="space-y-4 p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">
              This agent&apos;s first message or system prompt uses placeholders like{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">{`{{name}}`}</code>
              . Enter sample values for this browser preview.
            </p>
            <div className="space-y-4">
              {requiredKeys.map((key) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`agent-preview-var-${key}`} className="font-normal text-muted-foreground">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">{`{{${key}}}`}</code>
                  </Label>
                  <Input
                    id={`agent-preview-var-${key}`}
                    value={varValues[key] ?? ""}
                    onChange={(e) => setVarValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Value for ${key}`}
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={handleContinueToWidget}>
                Continue to preview
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-zinc-950">
            {requiredKeys.length > 0 && (
              <div className="flex shrink-0 items-center justify-end border-b border-border bg-muted/40 px-3 py-2 dark:bg-muted/20">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setStep("collect-vars")}
                >
                  Edit variables
                </Button>
              </div>
            )}
            <div
              ref={setMountEl}
              className="relative isolate min-h-0 w-full flex-1 overflow-hidden bg-white dark:bg-zinc-950"
            >
              {status === "loading" && (
                <div className="absolute inset-0 z-[4] flex flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-sm dark:bg-zinc-950/90">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
                  <p className="text-xs text-muted-foreground">Loading widget…</p>
                </div>
              )}
              {status === "error" && (
                <div className="absolute inset-0 z-[4] flex items-center justify-center bg-white p-4 dark:bg-zinc-950">
                  <p className="text-center text-xs text-destructive">
                    {errorMessage || "Preview unavailable."}
                  </p>
                </div>
              )}
            </div>

            <p className="shrink-0 border-t border-border bg-card px-3 py-2.5 text-center text-[10px] leading-relaxed text-muted-foreground dark:bg-card/80">
              Voice and chat run in your browser. If nothing appears, allowlist this origin on the agent in
              ElevenLabs.
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
