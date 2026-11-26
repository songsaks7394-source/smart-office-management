"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { roomBookingSchema } from "@/lib/validations/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/actions/auth";
import type { RoomName } from "@/types/database";

export async function createBookingAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = roomBookingSchema.safeParse({
    roomId: formData.get("roomId"),
    bookingDate: formData.get("bookingDate"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    purpose: formData.get("purpose") || undefined,
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const errors: Record<string, string> = {};
    for (const [k, v] of Object.entries(flat)) if (v?.[0]) errors[k] = v[0];
    return { success: false, errors };
  }

  if (parsed.data.endTime <= parsed.data.startTime) {
    return { success: false, errors: { endTime: "End time must be after the start time" } };
  }

  const supabase = await createClient();

  const { data: room } = await supabase
    .from("meeting_rooms")
    .select("*")
    .eq("id", parsed.data.roomId)
    .single();

  if (!room) {
    return { success: false, message: "Selected room not found" };
  }

  // Application-level conflict check (defense in depth; DB trigger enforces it too)
  const { data: existing } = await supabase
    .from("room_bookings")
    .select("id, start_time, end_time")
    .eq("room_id", parsed.data.roomId)
    .eq("booking_date", parsed.data.bookingDate);

  const hasConflict = (existing ?? []).some(
    (b) => parsed.data.startTime < b.end_time && parsed.data.endTime > b.start_time
  );
  if (hasConflict) {
    return { success: false, message: `${room.room_name} is already booked for part of that time slot.` };
  }

  const { error } = await supabase.from("room_bookings").insert({
    room_id: parsed.data.roomId,
    room_name: room.room_name as RoomName,
    booking_date: parsed.data.bookingDate,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
    purpose: parsed.data.purpose ?? null,
    booked_by: user.id,
  });

  if (error) {
    // Catches the DB trigger's conflict exception as a fallback
    const message = error.message.includes("Booking conflict")
      ? `${room.room_name} is already booked for part of that time slot.`
      : error.message;
    return { success: false, message };
  }

  revalidatePath("/meeting-rooms");
  redirect("/meeting-rooms");
}

export async function cancelBookingAction(id: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: booking } = await supabase.from("room_bookings").select("booked_by").eq("id", id).single();
  if (!booking) throw new Error("Booking not found");
  if (booking.booked_by !== user.id && user.role !== "admin") {
    throw new Error("You can only cancel your own bookings");
  }

  const { error } = await supabase.from("room_bookings").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/meeting-rooms");
  revalidatePath("/dashboard/admin");
}
