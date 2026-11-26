"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { createRepairRequestAction } from "@/actions/maintenance";
import type { ActionResult } from "@/actions/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { ArrowLeft, UploadCloud } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

const initialState: ActionResult = { success: false };

export default function NewMaintenanceRequestPage() {
  const [state, formAction, isPending] = useActionState(createRepairRequestAction, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.message && !state.success) toast.error(state.message);
  }, [state]);

  return (
    <div className="max-w-2xl">
      <Link href="/maintenance" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to requests
      </Link>
      <PageHeader title="New Repair Request" description="Report a broken item or facility issue" />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => formAction(fd)); }} className="space-y-4">
            <FormField label="Title" htmlFor="title" error={state.errors?.title} required>
              <Input id="title" name="title" placeholder="e.g. Broken air conditioner" />
            </FormField>

            <FormField label="Location" htmlFor="location" error={state.errors?.location} required>
              <Input id="location" name="location" placeholder="e.g. 3rd Floor, Room 302" />
            </FormField>

            <FormField label="Description" htmlFor="description" error={state.errors?.description} required>
              <Textarea id="description" name="description" rows={5} placeholder="Describe the issue in detail..." />
            </FormField>

            <FormField label="Photo (optional)" htmlFor="image">
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                {preview ? (
                  <Image src={preview} alt="Preview" width={160} height={160} className="h-40 w-auto rounded-md object-cover" />
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload an image</span>
                  </>
                )}
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                />
              </label>
            </FormField>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={isPending}>
                Submit request
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/maintenance")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
