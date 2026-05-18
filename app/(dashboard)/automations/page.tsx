"use client";

import { NodeBasedBuilder } from "@/components/automations/NodeBasedBuilder";
import type { AutomationBuilderSelection } from "@/components/automations/NodeBasedBuilder";
import { PrebuiltTemplatesModal } from "@/components/automations/PrebuiltTemplatesModal";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Automation } from "@/data/mockAutomations";
import {
  readAutomationsSession,
  writeAutomationsSession,
  mergeAutomationsWithDraft,
} from "@/lib/automationsSessionStorage";
import { AUTOMATIONS_QUERY_KEY, fetchAutomationsList } from "@/lib/automationsListQuery";
import { useSidebar } from "@/contexts/SidebarContext";
import { Zap, Activity, Plus, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { LoadingLogo } from "@/components/LoadingLogo";
import { toast } from "@/lib/toast";

export default function AutomationsPage() {
  const queryClient = useQueryClient();
  const { getSidebarWidth } = useSidebar();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [blockingInitialLoad, setBlockingInitialLoad] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showPrebuiltModal, setShowPrebuiltModal] = useState(false);
  const [draftDirty, setDraftDirty] = useState(false);
  const [defaultSelection, setDefaultSelection] = useState<AutomationBuilderSelection | null>(null);
  const [sessionDataRevision, setSessionDataRevision] = useState(0);
  const nodeBuilderRef = useRef<{ handleNewAutomation: () => void }>(null);

  const automationsRef = useRef<Automation[]>([]);
  const draftDirtyRef = useRef(false);
  const selectionRef = useRef<AutomationBuilderSelection>({
    selectedAutomationId: null,
    selectedNodeId: null,
  });
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: apiAutomations,
    isPending,
    isFetching,
    isSuccess,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: AUTOMATIONS_QUERY_KEY,
    queryFn: fetchAutomationsList,
    staleTime: 7 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  useEffect(() => {
    automationsRef.current = automations;
  }, [automations]);
  useEffect(() => {
    draftDirtyRef.current = draftDirty;
  }, [draftDirty]);

  const persistToSession = useCallback(() => {
    writeAutomationsSession({
      version: 1,
      automations: automationsRef.current,
      selectedAutomationId: selectionRef.current.selectedAutomationId,
      selectedNodeId: selectionRef.current.selectedNodeId,
      dirty: draftDirtyRef.current,
      updatedAt: Date.now(),
    });
  }, []);

  const schedulePersist = useCallback(() => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      persistToSession();
    }, 280);
  }, [persistToSession]);

  const handleAutomationsChange = useCallback(
    (next: Automation[]) => {
      setAutomations(next);
      setDraftDirty(true);
      automationsRef.current = next;
      draftDirtyRef.current = true;
      schedulePersist();
    },
    [schedulePersist]
  );

  const handleSelectionChange = useCallback(
    (sel: AutomationBuilderSelection) => {
      selectionRef.current = sel;
      schedulePersist();
    },
    [schedulePersist]
  );

  const handleSaved = useCallback(() => {
    setDraftDirty(false);
    draftDirtyRef.current = false;
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
      persistTimerRef.current = null;
    }
    persistToSession();
    void queryClient.invalidateQueries({ queryKey: AUTOMATIONS_QUERY_KEY });
  }, [persistToSession, queryClient]);

  useLayoutEffect(() => {
    const persisted = readAutomationsSession();
    if (persisted?.automations?.length) {
      setAutomations(persisted.automations);
      automationsRef.current = persisted.automations;
      setDraftDirty(!!persisted.dirty);
      draftDirtyRef.current = !!persisted.dirty;
      selectionRef.current = {
        selectedAutomationId: persisted.selectedAutomationId,
        selectedNodeId: persisted.selectedNodeId,
      };
      setDefaultSelection({
        selectedAutomationId: persisted.selectedAutomationId,
        selectedNodeId: persisted.selectedNodeId,
      });
      setBlockingInitialLoad(false);
      setSessionDataRevision((r) => r + 1);
    }
  }, []);

  useEffect(() => {
    if (!isPending) {
      setBlockingInitialLoad(false);
    }
  }, [isPending]);

  useEffect(() => {
    if (!isSuccess || apiAutomations === undefined) {
      return;
    }

    const persisted = readAutomationsSession();
    let merged = apiAutomations;
    let nextDirty = false;

    if (persisted?.dirty && persisted.automations) {
      merged = mergeAutomationsWithDraft(apiAutomations, persisted.automations);
      nextDirty = true;
    }

    draftDirtyRef.current = nextDirty;
    setDraftDirty(nextDirty);
    setAutomations(merged);
    automationsRef.current = merged;

    if (persisted) {
      selectionRef.current = {
        selectedAutomationId: persisted.selectedAutomationId,
        selectedNodeId: persisted.selectedNodeId,
      };
      setDefaultSelection({
        selectedAutomationId: persisted.selectedAutomationId,
        selectedNodeId: persisted.selectedNodeId,
      });
    } else {
      setDefaultSelection(null);
    }

    persistToSession();
    setSessionDataRevision((r) => r + 1);
  }, [isSuccess, apiAutomations, persistToSession]);

  useEffect(() => {
    if (!isError || error == null) {
      return;
    }
    const message =
      typeof (error as Error)?.message === "string" && (error as Error).message.trim()
        ? (error as Error).message
        : "Could not load automations.";
    setLoadError(message);
    toast.error(message);
    if (automationsRef.current.length === 0) {
      setAutomations([]);
      automationsRef.current = [];
      setDraftDirty(false);
      draftDirtyRef.current = false;
      setDefaultSelection(null);
    }
  }, [isError, error]);

  useEffect(() => {
    if (isSuccess) {
      setLoadError(null);
    }
  }, [isSuccess]);

  const handleUseTemplate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: AUTOMATIONS_QUERY_KEY });
  }, [queryClient]);

  const handleNewAutomation = () => {
    if (nodeBuilderRef.current?.handleNewAutomation) {
      nodeBuilderRef.current.handleNewAutomation();
    }
  };

  const showSyncIndicator = isFetching && !isPending;

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", `${getSidebarWidth()}px`);
  }, [getSidebarWidth]);

  if (blockingInitialLoad) {
    return (
      <div className="fixed inset-0 flex flex-col transition-all duration-300" style={{ left: `${getSidebarWidth()}px` }}>
        <div className="h-20 px-8 flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/5 via-primary/3 to-transparent backdrop-blur-sm shadow-sm flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                Automations
                <Activity className="w-5 h-5 text-primary" />
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Create, manage, and launch workflow automations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <LoadingLogo size="md" text="Loading automations..." />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col transition-all duration-300" style={{ left: `${getSidebarWidth()}px` }}>
      <div className="h-20 px-8 flex items-center justify-between border-b border-border/60 bg-gradient-to-br from-background via-background to-primary/[0.02] backdrop-blur-xl shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset] flex-shrink-0 z-10">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center shadow-[0_8px_24px_rgba(99,102,241,0.25)] ring-1 ring-primary/20">
              <Zap className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
              Automations
              <Activity className="w-5 h-5 text-primary/80" />
            </h1>
            <p className="text-sm text-muted-foreground/80 mt-1 font-medium">Create, manage, and launch workflow automations</p>
          </div>
          {isPending ? (
            <span className="ml-2 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground" aria-live="polite">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Syncing…
            </span>
          ) : null}
          {showSyncIndicator ? (
            <span className="ml-2 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground" aria-live="polite">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Updating…
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPrebuiltModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-card/80 backdrop-blur-sm border border-border/50 text-foreground rounded-xl text-sm font-bold hover:bg-accent/50 hover:shadow-md hover:border-primary/20 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            <span>Prebuilt Templates</span>
          </button>
          <button
            onClick={handleNewAutomation}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl text-sm font-bold hover:from-primary/90 hover:to-primary/80 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Automation</span>
          </button>
          <LanguageSwitcher />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>

      {loadError ? (
        <div className="flex-shrink-0 border-b border-destructive/30 bg-destructive/10 px-8 py-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-foreground">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" aria-hidden />
            <p className="flex-1 min-w-0 font-medium">{loadError}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex-1 overflow-hidden bg-background">
        <NodeBasedBuilder
          ref={nodeBuilderRef}
          automations={automations}
          onAutomationsChange={handleAutomationsChange}
          onSelectionChange={handleSelectionChange}
          onSaved={handleSaved}
          defaultSelection={defaultSelection}
          selectionRevision={sessionDataRevision}
        />
      </div>

      <PrebuiltTemplatesModal
        isOpen={showPrebuiltModal}
        onClose={() => setShowPrebuiltModal(false)}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}
