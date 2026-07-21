"use client";

const ACTION_LABELS: Record<string, string> = {
  created: "Ticket Created",
  assigned: "Assigned",
  status_changed: "Status Changed",
  reply_added: "Reply Added",
  attachment_uploaded: "Attachment Uploaded",
  resolved: "Resolved",
  closed: "Closed",
  reopened: "Reopened",
  rated: "Rated",
};

export function TicketTimeline({
  activity,
}: {
  activity: Array<{ action: string; metadata?: Record<string, unknown>; createdAt: string }>;
}) {
  if (!activity.length) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <div className="space-y-0">
      {activity.map((item, index) => (
        <div key={index} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
            {index < activity.length - 1 && <div className="w-px flex-1 bg-border min-h-[24px]" />}
          </div>
          <div className="pb-5 flex-1">
            <p className="text-sm font-medium text-foreground">
              {ACTION_LABELS[item.action] || item.action}
              {item.metadata?.to ? (
                <span className="text-muted-foreground font-normal"> → {String(item.metadata.to).replace(/_/g, " ")}</span>
              ) : null}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
