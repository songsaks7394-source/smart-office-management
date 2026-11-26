"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, requireAdmin } from "@/lib/auth";
import { repairRequestSchema } from "@/lib/validations/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { RepairStatus } from "@/types/database";
import type { ActionResult } from "@/actions/auth";

export async function createRepairRequestAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = repairRequestSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const errors: Record<string, string> = {};
    for (const [k, v] of Object.entries(flat)) if (v?.[0]) errors[k] = v[0];
    return { success: false, errors };
  }

  const supabase = await createClient();
  const imageFile = formData.get("image") as File | null;
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("maintenance-images")
      .upload(path, imageFile);

    if (uploadError) {
      return { success: false, message: `Image upload failed: ${uploadError.message}` };
    }

    const { data: publicUrl } = supabase.storage.from("maintenance-images").getPublicUrl(path);
    imageUrl = publicUrl.publicUrl;
  }

  const { error } = await supabase.from("repair_requests").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    location: parsed.data.location,
    image_url: imageUrl,
    created_by: user.id,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/maintenance");
  redirect("/maintenance");
}

export async function updateRepairStatusAction(id: string, status: RepairStatus) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("repair_requests").update({ status }).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/maintenance");
  revalidatePath(`/maintenance/${id}`);
  revalidatePath("/dashboard/admin");
}
