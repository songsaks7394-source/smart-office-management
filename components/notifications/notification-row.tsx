"use client";

import { useTransition } from "react";
import { NotificationIcon } from "@/components/notifications/notification-icon";
import { markNotificationReadAction } from "@/actions/notifications";
import { formatDateTime, cn } from "@/lib/utils";
import type { Notification } from "@/types/database";

export function NotificationRow({ notification }: { notification: Notification }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={notification.is_read || isPending}
      onClick={() => startTransition(() => markNotificationReadAction(notification.id))}
      className={cn(
        "w-full flex items-start gap-3 p-4 text-left rounded-xl border transition-colors",
        notification.is_read ? "bg-background" : "bg-primary/5 border-primary/20 hover:bg-primary/10"
      )}
    >
      <NotificationIcon type={notification.type} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-secondary truncate">{notification.title}</p>
          {!notification.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(notification.created_at)}</p>
      </div>
    </button>
  );
}
