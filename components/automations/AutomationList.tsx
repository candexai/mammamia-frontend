import { Search, Plus, Zap, Pencil, Check, X } from "lucide-react";
import { Automation, nodeServices } from "@/data/mockAutomations";
import { cn } from "@/lib/utils";
import { useMemo, useRef, useState } from "react";

interface AutomationListProps {
  automations: Automation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename?: (id: string, name: string) => void | Promise<void>;
}

function automationServiceLabel(serviceId: string) {
  if (serviceId === "delay") return "Delay";
  const all = [...nodeServices.triggers, ...nodeServices.actions];
  const found = all.find((s) => s.id === serviceId);
  if (found) return found.name;
  return serviceId
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function automationPreviewText(automation: Automation) {
  return automation.nodes.map((node) => automationServiceLabel(node.service)).join(" → ");
}

export function AutomationList({
  automations,
  selectedId,
  onSelect,
  onNew,
  onRename,
}: AutomationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const startEditing = (automation: Automation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRename) return;
    setEditingId(automation.id);
    setDraftName(automation.name);
    requestAnimationFrame(() => editInputRef.current?.select());
  };

  const cancelEditing = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setDraftName("");
  };

  const commitRename = async (automation: Automation, e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    if (!onRename || editingId !== automation.id) return;

    const trimmed = draftName.trim();
    if (!trimmed) {
      cancelEditing();
      return;
    }
    if (trimmed === automation.name) {
      cancelEditing();
      return;
    }

    setRenamingId(automation.id);
    try {
      await onRename(automation.id, trimmed);
      setEditingId(null);
      setDraftName("");
    } finally {
      setRenamingId(null);
    }
  };

  const filteredAutomations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return automations;
    return automations.filter((a) => {
      const preview = automationPreviewText(a);
      return (
        a.name.toLowerCase().includes(q) ||
        preview.toLowerCase().includes(q)
      );
    });
  }, [automations, searchQuery]);

  return (
    <div className="w-[360px] bg-card border-r border-border h-full flex flex-col shadow-xl">
      {/* Header - Simplified */}
      <div className="p-6 border-b border-border bg-gradient-to-br from-card to-card/50 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search automations..."
              className="w-full h-11 bg-background/80 border border-border rounded-xl pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              aria-label="Search automations"
            />
          </div>
          <button
            type="button"
            onClick={onNew}
            className="shrink-0 h-11 px-3 rounded-xl border border-border bg-background/80 text-sm font-medium text-foreground hover:bg-accent hover:border-primary/30 transition-colors flex items-center gap-1.5"
            title="New automation"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      {/* Automation List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredAutomations.map((automation) => {
          const isSelected = selectedId === automation.id;
          const isEnabled = automation.status === "enabled";
          const isEditing = editingId === automation.id;
          const isRenaming = renamingId === automation.id;

          return (
            <div
              key={automation.id}
              role="button"
              tabIndex={0}
              onClick={() => !isEditing && onSelect(automation.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!isEditing) onSelect(automation.id);
                }
              }}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all duration-200 group cursor-pointer",
                isSelected
                  ? "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/50 shadow-lg shadow-primary/10"
                  : "bg-card border-border hover:border-primary/30 hover:bg-accent/50 hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div
                      className="flex items-center gap-1 mb-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        ref={editInputRef}
                        type="text"
                        value={draftName}
                        disabled={isRenaming}
                        onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") void commitRename(automation, e);
                          if (e.key === "Escape") cancelEditing(e);
                        }}
                        onBlur={() => void commitRename(automation)}
                        className="flex-1 min-w-0 h-8 px-2 text-sm font-semibold rounded-lg bg-background border border-primary/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        aria-label="Automation name"
                      />
                      <button
                        type="button"
                        disabled={isRenaming}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => void commitRename(automation, e)}
                        className="shrink-0 p-1.5 rounded-lg text-green-600 hover:bg-green-500/10 transition-colors"
                        title="Save name"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isRenaming}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={cancelEditing}
                        className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mb-1 min-w-0">
                      <h3
                        className={cn(
                          "font-semibold text-sm truncate flex-1 min-w-0",
                          isSelected ? "text-primary" : "text-foreground"
                        )}
                        onDoubleClick={(e) => startEditing(automation, e)}
                        title={automation.name}
                      >
                        {automation.name}
                      </h3>
                      {onRename && (
                        <button
                          type="button"
                          onClick={(e) => startEditing(automation, e)}
                          className={cn(
                            "shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all",
                            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}
                          title="Rename automation"
                          aria-label="Rename automation"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  <p className={cn(
                    "text-xs truncate",
                    isSelected ? "text-primary/70" : "text-muted-foreground"
                  )}>
                    {automationPreviewText(automation) || "No nodes configured"}
                  </p>
                </div>
                <div className={cn(
                  "flex-shrink-0 w-2 h-2 rounded-full",
                  isEnabled ? "bg-green-500" : "bg-gray-400"
                )} />
              </div>
              
              {/* Status and Stats */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  isEnabled
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                )}>
                  {isEnabled ? "Active" : "Inactive"}
                </span>
                {automation.executionCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {automation.executionCount} {automation.executionCount === 1 ? 'run' : 'runs'}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {automations.length > 0 && filteredAutomations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8 px-2">
            No automations match &quot;{searchQuery.trim()}&quot;
          </p>
        )}
        
        {automations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 border border-primary/20">
              <Zap className="w-10 h-10 text-primary/50" />
            </div>
            <p className="text-base font-semibold text-foreground mb-2">No automations yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Create your first automation or use a prebuilt template above
            </p>
            <button
              onClick={onNew}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
            >
              Create Automation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
