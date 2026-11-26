"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { markAllNotificationsReadAction } from "@/actions/notifications";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await markAllNotificationsReadAction();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to update");
          }
        })
      }
    >
      <CheckCheck /> Mark all read
    </Button>
  );
}
