"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { reviewEquipmentRequestAction } from "@/actions/equipment";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export function EquipmentReviewActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const review = (status: "Approved" | "Rejected") => {
    startTransition(async () => {
      try {
        await reviewEquipmentRequestAction(id, status);
        toast.success(`Request ${status.toLowerCase()}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed");
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => review("Approved")} className="text-success border-success/30 hover:bg-success/10">
        <Check /> Approve
      </Button>
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => review("Rejected")} className="text-destructive border-destructive/30 hover:bg-destructive/10">
        <X /> Reject
      </Button>
    </div>
  );
}
