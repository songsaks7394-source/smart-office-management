"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, requireAdmin } from "@/lib/auth";
import { equipmentRequestSchema } from "@/lib/validations/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EquipmentStatus } from "@/types/database";
import type { ActionResult } from "@/actions/auth";

export async function createEquipmentRequestAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = equipmentRequestSchema.safeParse({
    itemName: formData.get("itemName"),
    quantity: formData.get("quantity"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const errors: Record<string, string> = {};
    for (const [k, v] of Object.entries(flat)) if (v?.[0]) errors[k] = v[0];
    return { success: false, errors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("equipment_requests").insert({
    item_name: parsed.data.itemName,
    quantity: parsed.data.quantity,
    reason: parsed.data.reason,
    requested_by: user.id,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/equipment");
  redirect("/equipment");
}

export async function reviewEquipmentRequestAction(id: string, status: EquipmentStatus) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("equipment_requests")
    .update({ status, reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/equipment");
  revalidatePath("/dashboard/admin");
}
