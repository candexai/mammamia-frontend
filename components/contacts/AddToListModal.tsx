"use client";

import { useState } from "react";
import { X, FolderPlus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (listId: string) => Promise<void>;
  lists: any[];
  selectedCount: number;
}

export function AddToListModal({ 
  isOpen, 
  onClose, 
  onSave, 
  lists, 
  selectedCount 
}: AddToListModalProps) {
  const [selectedListId, setSelectedListId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!selectedListId) {
      setError("Please select a list");
      return;
    }

    try {
      setIsAdding(true);
      setError(null);
      await onSave(selectedListId);
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to add contacts to list");
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedListId("");
    setError(null);
    setIsAdding(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl w-full max-w-md mx-4 shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Add to List</h2>
              <p className="text-sm text-muted-foreground">{selectedCount} contact{selectedCount !== 1 ? 's' : ''} selected</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={isAdding}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-foreground mb-3">
              Select a list
            </label>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {lists.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    No lists available. Create a list first.
                  </p>
                </div>
              ) : (
                lists.map((list) => (
                  <button
                    key={list.id || list._id}
                    onClick={() => setSelectedListId(list.id || list._id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all",
                      selectedListId === (list.id || list._id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                    disabled={isAdding}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                        selectedListId === (list.id || list._id)
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      )}>
                        {selectedListId === (list.id || list._id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-foreground font-medium">{list.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {list.contactCount || 0} contacts
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isAdding}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedListId || isAdding || lists.length === 0}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-all",
              !selectedListId || isAdding || lists.length === 0
                ? "bg-gray-700 text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:brightness-110"
            )}
          >
            {isAdding ? "Adding..." : "Add to List"}
          </button>
        </div>
      </div>
    </div>
  );
}

