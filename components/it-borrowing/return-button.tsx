"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { returnAssetAction } from "@/actions/borrowing";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function ReturnAssetButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await returnAssetAction(id);
            toast.success("Asset marked as returned");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to update");
          }
        })
      }
    >
      <CheckCircle2 /> Mark returned
    </Button>
  );
}
