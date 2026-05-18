"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Prompt } from "@/data/mockPrompts";

interface PromptEditorProps {
  prompt: Prompt;
  previousVersions: Prompt[];
  onSave: (description: string) => void;
  onRevert: (promptId: string) => void;
}

export function PromptEditor({
  prompt,
  previousVersions,
  onSave,
  onRevert,
}: PromptEditorProps) {
  const [description, setDescription] = useState(prompt.description);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  const handleApplyChange = () => {
    onSave(description);
  };

  return (
    <div className="space-y-6">
      {/* Main prompt description */}
      <div>
        <label className="block text-base font-semibold text-white mb-3">
          What should your AI do?
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain what you want the AI to do in plain language..."
          className="w-full min-h-[160px] bg-secondary border border-border rounded-xl px-4 py-4 text-sm text-white placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Apply button */}
      <button
        onClick={handleApplyChange}
        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:brightness-110 transition-all"
      >
        Apply Change
      </button>

      {/* Advanced section */}
      <div className="border-t border-border pt-6">
        <button
          onClick={() => setAdvancedExpanded(!advancedExpanded)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary-foreground transition-colors mb-4"
        >
          {advancedExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span>Advanced</span>
        </button>

        {advancedExpanded && (
          <div className="space-y-4">
            {/* System prompt code block */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                System Prompt
              </label>
              <div className="bg-background border border-border rounded-lg p-4 overflow-x-auto">
                <pre className="text-[13px] text-secondary-foreground font-mono whitespace-pre-wrap">
                  {prompt.systemPrompt}
                </pre>
              </div>
            </div>

            {/* Previous versions */}
            {previousVersions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">
                  Previous Versions
                </label>
                <div className="space-y-2">
                  {previousVersions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-start justify-between p-3 border border-border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-white mb-1">
                          {version.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(version.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => onRevert(version.id)}
                        className="ml-4 px-4 py-1.5 border border-border text-muted-foreground text-xs rounded hover:border-primary hover:text-foreground transition-colors"
                      >
                        Revert
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

