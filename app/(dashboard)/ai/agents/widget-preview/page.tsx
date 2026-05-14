"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvaiWidgetEmbed } from "@/hooks/useConvaiWidgetEmbed";
import { Loader2, X, MessageCircle } from "lucide-react";

const AGENT_ID_RE = /^agent_[a-z0-9]+$/i;

function WidgetPreviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agent_id")?.trim() || "";
  const [mountEl, setMountEl] = useState<HTMLDivElement | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const valid = useMemo(() => AGENT_ID_RE.test(agentId), [agentId]);
  const embedAgentId = valid ? agentId : null;
  const widgetReady = valid && !!mountEl;

  const { status, errorMessage } = useConvaiWidgetEmbed(embedAgentId, widgetReady, {
    variant: "expanded",
    placement: "center",
    dynamicVariables: { name: "Guest" },
    mountParent: mountEl,
    actionText: "Need help?",
    startCallText: "Start a call",
  });

  useEffect(() => {
    if (!valid) setMountEl(null);
  }, [valid]);

  if (!agentId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center text-sm text-muted-foreground">
        <p>
          Add <code className="text-foreground">?agent_id=agent_…</code> to this URL.
        </p>
        <Link href="/ai/agents" className="mt-6 text-primary hover:underline">
          Back to agents
        </Link>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center text-sm text-destructive">
        <p>Invalid agent id.</p>
        <Link href="/ai/agents" className="mt-6 text-primary hover:underline">
          Back to agents
        </Link>
      </div>
    );
  }

  if (!portalReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-start justify-center overflow-y-auto bg-black/60 p-3 py-6 backdrop-blur-sm sm:items-center sm:p-4 sm:py-8">
      <div className="my-auto flex h-[min(90dvh,880px)] max-h-[min(94dvh,920px)] w-full max-w-[min(960px,calc(100vw-1rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex shrink-0 items-center justify-between gap-3 bg-primary px-4 py-3 text-primary-foreground">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
              <MessageCircle className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold sm:text-base">ConvAI widget</h1>
              <p className="text-xs text-primary-foreground/80">Online</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/ai/agents"
              className="hidden rounded-lg border border-primary-foreground/25 bg-primary-foreground/10 px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/20 sm:inline-flex"
            >
              Agents
            </Link>
            <button
              type="button"
              onClick={() => router.push("/ai/agents")}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground/90 transition-colors hover:bg-primary-foreground/15"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="border-b border-border px-4 py-2">
          <p className="truncate font-mono text-[10px] text-muted-foreground" title={agentId}>
            {agentId}
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-zinc-950">
          <div
            ref={setMountEl}
            className="relative isolate min-h-0 w-full flex-1 overflow-hidden bg-white dark:bg-zinc-950"
          >
            {status === "loading" && (
              <div className="absolute inset-0 z-[4] flex flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-sm dark:bg-zinc-950/90">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Loading widget…</p>
              </div>
            )}
            {status === "error" && (
              <div className="absolute inset-0 z-[4] flex items-center justify-center bg-white p-4 dark:bg-zinc-950">
                <p className="text-center text-xs text-destructive">{errorMessage || "Preview unavailable."}</p>
              </div>
            )}
          </div>
          <p className="shrink-0 border-t border-border bg-card px-3 py-2.5 text-center text-[10px] text-muted-foreground dark:bg-card/80">
            Allowlist this origin on the agent in ElevenLabs if the widget does not load.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function WidgetPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <WidgetPreviewInner />
    </Suspense>
  );
}
