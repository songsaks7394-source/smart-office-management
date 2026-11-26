"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBookingAction } from "@/actions/bookings";
import type { ActionResult } from "@/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { MeetingRoom } from "@/types/database";

const initialState: ActionResult = { success: false };

export function BookingForm({ rooms }: { rooms: MeetingRoom[] }) {
  const [state, formAction, isPending] = useActionState(createBookingAction, initialState);
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state.message && !state.success) toast.error(state.message);
  }, [state]);

  return (
    <Card>
      <CardContent className="p-6">
        <form action={formAction} className="space-y-4">
          <FormField label="Room" htmlFor="roomId" error={state.errors?.roomId} required>
            <Select name="roomId" defaultValue={rooms[0]?.id}>
              <SelectTrigger id="roomId">
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.room_name} · {room.capacity} seats
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Date" htmlFor="bookingDate" error={state.errors?.bookingDate} required>
            <Input id="bookingDate" name="bookingDate" type="date" min={today} defaultValue={today} />
          </FormField>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Start time" htmlFor="startTime" error={state.errors?.startTime} required>
              <Input id="startTime" name="startTime" type="time" />
            </FormField>
            <FormField label="End time" htmlFor="endTime" error={state.errors?.endTime} required>
              <Input id="endTime" name="endTime" type="time" />
            </FormField>
          </div>

          <FormField label="Purpose (optional)" htmlFor="purpose">
            <Textarea id="purpose" name="purpose" rows={3} placeholder="e.g. Weekly team sync" />
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isPending}>
              Confirm booking
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/meeting-rooms")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
