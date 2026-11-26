import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { CancelBookingButton } from "@/components/meeting-rooms/cancel-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, Plus, Clock, User as UserIcon } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export default async function MeetingRoomsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const { data: bookings } = await supabase
    .from("room_bookings")
    .select("*, users!room_bookings_booked_by_fkey(full_name)")
    .gte("booking_date", today)
    .order("booking_date", { ascending: true })
    .order("start_time", { ascending: true });

  const { data: rooms } = await supabase.from("meeting_rooms").select("*").order("room_name");

  const grouped = (bookings ?? []).reduce<Record<string, typeof bookings>>((acc, b) => {
    (acc[b.booking_date] ??= []).push(b);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Meeting Room Booking"
        description="Book Room A, B, or C — conflicts are automatically prevented"
        action={
          <Button asChild>
            <Link href="/meeting-rooms/new">
              <Plus /> New booking
            </Link>
          </Button>
        }
      />

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {rooms?.map((room) => (
          <Card key={room.id}>
            <CardContent className="p-4">
              <p className="font-semibold text-secondary">{room.room_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Capacity: {room.capacity} · {room.location}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!bookings || bookings.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No upcoming bookings"
          description="Reserve a meeting room for your next team sync or presentation."
          action={
            <Button asChild size="sm">
              <Link href="/meeting-rooms/new">
                <Plus /> Book a room
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dayBookings]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-secondary mb-2">{formatDate(date)}</h3>
              <div className="grid gap-2">
                {dayBookings!.map((b) => (
                  <Card key={b.id}>
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">{b.room_name}</Badge>
                          <span className="flex items-center gap-1 text-sm font-medium text-secondary">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(b.start_time)} – {formatTime(b.end_time)}
                          </span>
                        </div>
                        {b.purpose && <p className="text-sm text-muted-foreground mt-1">{b.purpose}</p>}
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <UserIcon className="h-3 w-3" />
                          {(b as any).users?.full_name ?? "Unknown"}
                        </p>
                      </div>
                      {(b.booked_by === user.id || user.role === "admin") && (
                        <CancelBookingButton id={b.id} />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
