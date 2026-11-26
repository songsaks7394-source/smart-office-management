import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { ArrowLeft } from "lucide-react";
import { BookingForm } from "@/components/meeting-rooms/booking-form";

export default async function NewBookingPage() {
  await requireUser();
  const supabase = await createClient();
  const { data: rooms } = await supabase.from("meeting_rooms").select("*").order("room_name");

  return (
    <div className="max-w-2xl">
      <Link href="/meeting-rooms" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>
      <PageHeader title="Book a Meeting Room" description="Choose a room, date, and time — overlaps are blocked automatically" />
      <BookingForm rooms={rooms ?? []} />
    </div>
  );
}
