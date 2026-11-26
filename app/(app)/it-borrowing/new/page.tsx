"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBorrowRecordAction } from "@/actions/borrowing";
import type { ActionResult } from "@/actions/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const initialState: ActionResult = { success: false };
const ASSETS = ["Laptop", "Mouse", "Keyboard", "Monitor", "Projector"];

export default function NewBorrowRecordPage() {
  const [state, formAction, isPending] = useActionState(createBorrowRecordAction, initialState);
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state.message && !state.success) toast.error(state.message);
  }, [state]);

  return (
    <div className="max-w-2xl">
      <Link href="/it-borrowing" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to borrowing
      </Link>
      <PageHeader title="Borrow IT Asset" description="Check out a laptop, monitor, or other equipment" />

      <Card>
        <CardContent className="p-6">
          <form action={formAction} className="space-y-4">
            <FormField label="Asset" htmlFor="assetName" error={state.errors?.assetName} required>
              <Select name="assetName" defaultValue="Laptop">
                <SelectTrigger id="assetName">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSETS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Borrow date" htmlFor="borrowDate" error={state.errors?.borrowDate} required>
                <Input id="borrowDate" name="borrowDate" type="date" defaultValue={today} />
              </FormField>
              <FormField label="Return by" htmlFor="dueDate" error={state.errors?.dueDate} required>
                <Input id="dueDate" name="dueDate" type="date" min={today} />
              </FormField>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={isPending}>
                Borrow asset
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/it-borrowing")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
