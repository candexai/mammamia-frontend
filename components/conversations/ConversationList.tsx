"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, UserCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Conversation } from "@/data/mockConversations";
import { ConversationCard } from "./ConversationCard";
import { useQueryClient } from "@tanstack/react-query";


export interface ConversationListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelectConversation?: (id: string) => void;
  pagination?: ConversationListPagination;
  onPageChange?: (page: number) => void;
  /** Live input (search is sent to API after parent debounces to `appliedSearch`) */
  searchQuery: string;
  onSearchChange: (value: string) => void;
  /** Debounced term used for the last server request (for empty-state copy) */
  appliedSearch: string;
  /** List is refetching (e.g. new search); keep layout, subtle dim */
  listFetching?: boolean;
  /** Active date-range window in days (passed for display in empty-state copy) */
  dateRangeDays?: number;
  /** True when a search term is active (range is widened to all history) */
  isSearchActive?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelectConversation,
  pagination,
  onPageChange,
  searchQuery,
  onSearchChange,
  appliedSearch,
  listFetching,
  dateRangeDays = 1,
  isSearchActive = false,
}: ConversationListProps) {
  const queryClient = useQueryClient();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [statusFilter, setStatusFilter] = useState("all"); // Changed from "open" to "all"
  const [sortBy, setSortBy] = useState("recent");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort conversations (search is server-side across all pages)
  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((conv) => conv.status === statusFilter);
    }

    const timeMs = (t: string) => {
      const n = new Date(t).getTime();
      return Number.isNaN(n) ? 0 : n;
    };

    // Apply sorting (latest first for "recent")
    if (sortBy === "recent") {
      filtered.sort((a, b) => timeMs(b.timestamp) - timeMs(a.timestamp));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => timeMs(a.timestamp) - timeMs(b.timestamp));
    } else if (sortBy === "unread") {
      filtered.sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0));
    }

    return filtered;
  }, [conversations, statusFilter, sortBy]);

  const limit = pagination?.limit ?? 25;
  const totalPages =
    pagination?.totalPages ??
    (pagination?.total != null
      ? Math.max(1, Math.ceil(pagination.total / Math.max(limit, 1)))
      : 1);
  const showPagination =
    !!pagination &&
    typeof pagination.total === "number" &&
    pagination.total > limit &&
    typeof onPageChange === "function";
  const page = pagination?.page ?? 1;
  const hasPrev = pagination?.hasPrev ?? page > 1;
  const hasNext = pagination?.hasNext ?? page < totalPages;
  const rangeStart =
    pagination?.total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = pagination?.total != null
    ? Math.min(page * limit, pagination.total)
    : 0;

  useEffect(() => {
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [pagination?.page]);

  useEffect(() => {
    if (searchQuery.trim()) setShowSearch(true);
  }, [searchQuery]);

  const searchPanelOpen = showSearch || searchQuery.length > 0;

  return (
    <div className="w-[400px] bg-card/50 backdrop-blur-sm border-r border-border/60 h-full flex flex-col shadow-[2px_0_8px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Premium Header */}
      <div className="h-18 px-6 py-4 flex items-center justify-between border-b border-border/50 bg-gradient-to-br from-card via-card to-primary/[0.02] backdrop-blur-sm">
        <button className="flex items-center gap-2.5 text-sm font-bold text-foreground hover:opacity-90 transition-all cursor-pointer px-4 py-2 rounded-xl hover:bg-accent/50 hover:shadow-sm">
          <UserCircle2 className="w-4.5 h-4.5" />
          <span>Assigned to me</span>
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2.5 rounded-xl hover:bg-accent/50 transition-all duration-200 cursor-pointer ${
              searchPanelOpen ? "text-foreground bg-accent shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="w-[18px] h-[18px]" />
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl hover:bg-accent/50 transition-all duration-200 cursor-pointer ${
              showFilters ? "text-foreground bg-accent shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* Premium Search Bar */}
      {searchPanelOpen && (
        <div className="px-5 py-4 border-b border-border/50 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search name, phone, email, or message…"
              className="w-full bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Premium Filter Row */}
      {showFilters && (
        <div className="px-5 py-4 border-b border-border/50 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="unread">Unread</option>
              <option value="support_request">Support Request</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-4 py-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="unread">Unread First</option>
            </select>
          </div>
        </div>
      )}

      {/* Conversation Cards */}
      <div
        ref={scrollAreaRef}
        className={`flex-1 overflow-y-auto min-h-0 transition-opacity ${listFetching ? "opacity-70" : ""}`}
      >
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedId === conversation.id}
              onClick={() => onSelectConversation?.(conversation.id)}
              onUpdate={() => {
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
              }}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary/30 flex items-center justify-center mb-5 shadow-inner">
              <Search className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-bold text-foreground mb-2 tracking-tight">
              {appliedSearch
                ? "No conversations match your search"
                : dateRangeDays === 1
                  ? "Nothing updated today — try Last 7 days or a wider range."
                  : `No conversations in the last ${dateRangeDays} days`}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 font-medium">
              {appliedSearch
                ? "Searched all history — try different keywords or filters."
                : "Try expanding the date range using the picker above."}
            </p>
          </div>
        )}
      </div>

      {showPagination && (
        <div className="flex-shrink-0 border-t border-border/50 bg-gradient-to-br from-card/95 via-card/90 to-background/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground font-medium tabular-nums truncate min-w-0">
            {rangeStart}–{rangeEnd} of {pagination!.total}
            {!isSearchActive && (
              <span className="ml-1 text-muted-foreground/60">
                {dateRangeDays === 1
                  ? "(updated today)"
                  : `(updated in last ${dateRangeDays}d)`}
              </span>
            )}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              aria-label="Previous page"
              disabled={!hasPrev}
              onClick={() => onPageChange?.(page - 1)}
              className="p-2 rounded-lg border border-border/60 bg-card/80 text-foreground hover:bg-accent/60 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-foreground tabular-nums px-1 min-w-[4.5rem] text-center">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={!hasNext}
              onClick={() => onPageChange?.(page + 1)}
              className="p-2 rounded-lg border border-border/60 bg-card/80 text-foreground hover:bg-accent/60 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

