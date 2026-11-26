"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { borrowRequestSchema } from "@/lib/validations/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/actions/auth";

export async function createBorrowRecordAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = borrowRequestSchema.safeParse({
    assetName: formData.get("assetName"),
    borrowDate: formData.get("borrowDate"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const errors: Record<string, string> = {};
    for (const [k, v] of Object.entries(flat)) if (v?.[0]) errors[k] = v[0];
    return { success: false, errors };
  }

  if (new Date(parsed.data.dueDate) < new Date(parsed.data.borrowDate)) {
    return { success: false, errors: { dueDate: "Return date must be after the borrow date" } };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("borrow_records").insert({
    asset_name: parsed.data.assetName,
    borrow_date: parsed.data.borrowDate,
    due_date: parsed.data.dueDate,
    borrower: user.id,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/it-borrowing");
  redirect("/it-borrowing");
}

export async function returnAssetAction(id: string) {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("borrow_records")
    .update({ status: "Returned", return_date: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/it-borrowing");
  revalidatePath("/dashboard/admin");
}

/**
 * Marks any Borrowed record whose due_date has passed as Overdue.
 * Mirrors the public.mark_overdue_assets() SQL function; called opportunistically
 * on page load so the UI stays fresh even without a cron job configured.
 */
export async function syncOverdueAssetsAction() {
  const supabase = await createClient();
  await supabase.rpc("mark_overdue_assets");
}
