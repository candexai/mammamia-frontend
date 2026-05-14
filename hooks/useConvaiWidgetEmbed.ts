"use client";

import { useEffect, useState } from "react";

/** Pinned embed script (matches ElevenLabs widget demo). */
export const CONVAI_WIDGET_SCRIPT_SRC =
  "https://unpkg.com/@elevenlabs/convai-widget-embed@0.11.4/dist/index.js";

const WIDGET_HOST_ID = "aistein-convai-widget-host";
const SCRIPT_ATTR = "data-aistein-convai-embed";

export type ConvaiWidgetPlacement = "center" | "bottom-right";

/** `full` = voice + transcript split (see ElevenLabs widget docs). */
export type ConvaiWidgetVariant = "expanded" | "full" | "compact";

function getServerLocation(): string {
  return (
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_ELEVENLABS_CONVAI_SERVER_LOCATION?.trim()) ||
    "eu-residency"
  );
}

function removeHost() {
  document.getElementById(WIDGET_HOST_ID)?.remove();
}

function applyPlacementStyles(
  el: HTMLElement,
  placement: ConvaiWidgetPlacement,
  mode: "viewport" | "container",
  variant: ConvaiWidgetVariant
) {
  if (mode === "container") {
    Object.assign(el.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      left: "auto",
      top: "auto",
      right: "auto",
      bottom: "auto",
      transform: "none",
      zIndex: "2",
    });
    el.style.setProperty("--elevenlabs-convai-widget-width", "100%");
    el.style.setProperty("--elevenlabs-convai-widget-height", "100%");
    if (variant === "full") {
      el.style.setProperty("--elevenlabs-convai-widget-max-width", "min(960px, 100%)");
    } else {
      /* expanded/compact default to a narrow max-width; cap to host so the panel fills preview cards */
      el.style.setProperty("--elevenlabs-convai-widget-max-width", "100%");
    }
    el.style.setProperty("--elevenlabs-convai-widget-max-height", "100%");
    return;
  }

  if (placement === "center") {
    Object.assign(el.style, {
      position: "fixed",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      bottom: "auto",
      right: "auto",
      zIndex: "2147483646",
    });
    el.style.setProperty(
      "--elevenlabs-convai-widget-width",
      variant === "full" ? "min(960px, 96vw)" : "min(420px, 94vw)"
    );
  } else {
    Object.assign(el.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      left: "auto",
      top: "auto",
      transform: "none",
      zIndex: "2147483646",
    });
  }
}

function mountHost(
  agentId: string,
  dynamicVariables: Record<string, string>,
  placement: ConvaiWidgetPlacement,
  variant: ConvaiWidgetVariant,
  mountParent: HTMLElement | null,
  labels: { actionText: string; startCallText: string }
) {
  removeHost();
  const el = document.createElement("elevenlabs-convai");
  el.id = WIDGET_HOST_ID;
  el.setAttribute("agent-id", agentId);
  el.setAttribute("variant", variant);
  el.setAttribute("dismissible", "true");
  el.setAttribute("server-location", getServerLocation());
  el.setAttribute("action-text", labels.actionText);
  el.setAttribute("start-call-text", labels.startCallText);
  el.setAttribute("end-call-text", "End call");
  el.setAttribute("expand-text", "Open chat");
  el.setAttribute("collapse-text", "Close");
  if (Object.keys(dynamicVariables).length > 0) {
    el.setAttribute("dynamic-variables", JSON.stringify(dynamicVariables));
  }
  const mode = mountParent ? "container" : "viewport";
  applyPlacementStyles(el, placement, mode, variant);
  (mountParent ?? document.body).appendChild(el);
}

export type UseConvaiWidgetEmbedOptions = {
  dynamicVariables?: Record<string, string>;
  placement?: ConvaiWidgetPlacement;
  variant?: ConvaiWidgetVariant;
  /** When set, widget is mounted inside this node (card layout). Otherwise `document.body`. */
  mountParent?: HTMLElement | null;
  /** CTA / headline on the compact launcher (e.g. "Need help?") */
  actionText?: string;
  startCallText?: string;
};

/**
 * Load ElevenLabs ConvAI web widget.
 * Pass `mountParent` to embed inside a styled card; omit for floating / body mount.
 */
export function useConvaiWidgetEmbed(
  agentId: string | null | undefined,
  enabled: boolean,
  options: UseConvaiWidgetEmbedOptions = {}
) {
  const {
    dynamicVariables = { name: "Guest" },
    placement = "center",
    variant = "full",
    mountParent = null,
    actionText = "Talk to agent",
    startCallText = "Start call",
  } = options;
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dvKey = JSON.stringify(dynamicVariables);

  useEffect(() => {
    if (!enabled || !agentId) {
      removeHost();
      setStatus("idle");
      setErrorMessage(null);
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setErrorMessage(null);

    const dv = JSON.parse(dvKey) as Record<string, string>;

    const afterReady = () => {
      if (cancelled) return;
      if (typeof window === "undefined" || !window.customElements?.whenDefined) {
        mountHost(agentId, dv, placement, variant, mountParent, { actionText, startCallText });
        setStatus("ready");
        return;
      }
      window.customElements
        .whenDefined("elevenlabs-convai")
        .then(() => {
          if (cancelled) return;
          mountHost(agentId, dv, placement, variant, mountParent, { actionText, startCallText });
          setStatus("ready");
        })
        .catch(() => {
          if (cancelled) return;
          setStatus("error");
          setErrorMessage("Widget did not register. Try Chrome or Edge.");
        });
    };

    let removeScriptListener: (() => void) | undefined;

    if (typeof window !== "undefined" && window.customElements?.get?.("elevenlabs-convai")) {
      afterReady();
    } else {
      const existingScript = document.querySelector(`script[${SCRIPT_ATTR}="1"]`);
      if (existingScript) {
        const onLoad = () => afterReady();
        existingScript.addEventListener("load", onLoad, { once: true });
        removeScriptListener = () => existingScript.removeEventListener("load", onLoad);
      } else {
        const s = document.createElement("script");
        s.src = CONVAI_WIDGET_SCRIPT_SRC;
        s.async = true;
        s.type = "text/javascript";
        s.setAttribute(SCRIPT_ATTR, "1");
        s.onload = () => afterReady();
        s.onerror = () => {
          if (cancelled) return;
          setStatus("error");
          setErrorMessage("Could not load widget script.");
        };
        document.head.appendChild(s);
      }
    }

    return () => {
      cancelled = true;
      removeScriptListener?.();
      removeHost();
      setStatus("idle");
    };
  }, [agentId, enabled, dvKey, placement, variant, mountParent, actionText, startCallText]);

  return { status, errorMessage };
}
