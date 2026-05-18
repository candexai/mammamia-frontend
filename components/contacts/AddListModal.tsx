"use client";

import { useState } from "react";
import { X, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

export function AddListModal({ isOpen, onClose, onSave }: AddListModalProps) {
  const [listName, setListName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!listName.trim()) {
      setError("Please provide a list name");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(listName.trim());
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to create list");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setListName("");
    setError(null);
    setIsSaving(false);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && listName.trim()) {
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl w-full max-w-md mx-4 shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Folder className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Create New List</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-foreground mb-2">
              List Name
            </label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Newsletter Subscribers, VIP Customers"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              disabled={isSaving}
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400">
              After creating the list, you can add contacts to it individually or import them via CSV.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!listName.trim() || isSaving}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-all",
              !listName.trim() || isSaving
                ? "bg-gray-700 text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:brightness-110"
            )}
          >
            {isSaving ? "Creating..." : "Create List"}
          </button>
        </div>
      </div>
    </div>
  );
}

