"use client";

import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateRepairStatusAction } from "@/actions/maintenance";
import type { RepairStatus } from "@/types/database";
import { toast } from "sonner";

const STATUSES: RepairStatus[] = ["Pending", "In Progress", "Completed"];

export function RepairStatusSelect({ id, status }: { id: string; status: RepairStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(value) => {
        startTransition(async () => {
          try {
            await updateRepairStatusAction(id, value as RepairStatus);
            toast.success(`Status updated to "${value}"`);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to update status");
          }
        });
      }}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
