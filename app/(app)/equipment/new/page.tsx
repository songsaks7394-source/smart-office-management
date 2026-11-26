"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createEquipmentRequestAction } from "@/actions/equipment";
import type { ActionResult } from "@/actions/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const initialState: ActionResult = { success: false };

export default function NewEquipmentRequestPage() {
  const [state, formAction, isPending] = useActionState(createEquipmentRequestAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.message && !state.success) toast.error(state.message);
  }, [state]);

  return (
    <div className="max-w-2xl">
      <Link href="/equipment" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to requests
      </Link>
      <PageHeader title="New Equipment Request" description="Request an item you need for work" />

      <Card>
        <CardContent className="p-6">
          <form action={formAction} className="space-y-4">
            <FormField label="Item name" htmlFor="itemName" error={state.errors?.itemName} required>
              <Input id="itemName" name="itemName" placeholder="e.g. Wireless Mouse" />
            </FormField>

            <FormField label="Quantity" htmlFor="quantity" error={state.errors?.quantity} required>
              <Input id="quantity" name="quantity" type="number" min={1} defaultValue={1} />
            </FormField>

            <FormField label="Reason" htmlFor="reason" error={state.errors?.reason} required>
              <Textarea id="reason" name="reason" rows={4} placeholder="Why do you need this item?" />
            </FormField>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={isPending}>
                Submit request
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/equipment")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
