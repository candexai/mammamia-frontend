"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { socketClient } from "@/lib/socket";
import { useAuth } from "@/contexts/AuthContext";

interface SupportNotification {
  id: string;
  type: string;
  eventType: string;
  ticketId: string;
  ticketNumber: string;
  subject: string;
  message: string;
  status?: string;
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = "support_notifications_read";

function getNotificationId(payload: Pick<SupportNotification, "ticketId" | "eventType">) {
  return `${payload.ticketId}-${payload.eventType}`;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<SupportNotification[]>([]);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const readIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
    if (!readIds.includes(id)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...readIds, id]));
    }
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const allIds = prev.map((n) => n.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
      return prev.map((n) => ({ ...n, read: true }));
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const orgId = user.organizationId || user.id;
    if (orgId && socketClient.isConnected()) {
      socketClient.joinOrganization(orgId);
    }

    const handler = (payload: SupportNotification & { type?: string }) => {
      if (payload.type !== "support_ticket") return;

      const id = getNotificationId(payload);
      setNotifications((prev) => {
        if (prev.some((n) => n.id === id)) return prev;

        const readIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
        return [
          { ...payload, id, read: readIds.includes(id) },
          ...prev,
        ].slice(0, 20);
      });
    };

    socketClient.onNotification(handler);
    return () => {
      socketClient.offNotification(handler);
    };
  }, [user]);

  const handleClick = (n: SupportNotification) => {
    markRead(n.id);
    setOpen(false);
    router.push("/help");
  };

  const handleSeeAll = () => {
    setOpen(false);
    router.push("/help");
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllRead();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="p-3 border-b border-border font-medium text-sm">Notifications</div>
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => handleClick(n)}
                      className={`w-full text-left p-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-0 ${!n.read ? "bg-primary/5" : ""}`}
                    >
                      <p className="text-xs font-mono text-primary">{n.ticketNumber}</p>
                      <p className="text-sm font-medium truncate">{n.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex border-t border-border text-xs">
              <button
                type="button"
                onClick={handleSeeAll}
                className="flex-1 py-2.5 text-primary hover:bg-secondary/50 transition-colors font-medium"
              >
                See all
              </button>
              {notifications.length > 0 && unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex-1 border-l border-border py-2.5 text-muted-foreground hover:bg-secondary/50 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
