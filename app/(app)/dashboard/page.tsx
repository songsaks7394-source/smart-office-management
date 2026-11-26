import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentList } from "@/components/dashboard/recent-list";
import { Wrench, Package, Laptop, CalendarClock } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === "admin") redirect("/dashboard/admin");

  const supabase = await createClient();

  const [{ data: repairs }, { data: borrows }, { data: bookings }, { data: equipment }] = await Promise.all([
    supabase
      .from("repair_requests")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("borrow_records")
      .select("*")
      .eq("borrower", user.id)
      .order("borrow_date", { ascending: false })
      .limit(5),
    supabase
      .from("room_bookings")
      .select("*")
      .eq("booked_by", user.id)
      .gte("booking_date", new Date().toISOString().slice(0, 10))
      .order("booking_date", { ascending: true })
      .limit(5),
    supabase
      .from("equipment_requests")
      .select("*")
      .eq("requested_by", user.id)
      .order("request_date", { ascending: false })
      .limit(5),
  ]);

  const activeRepairs = (repairs ?? []).filter((r) => r.status !== "Completed").length;
  const activeBorrows = (borrows ?? []).filter((b) => b.status !== "Returned").length;

  return (
    <div>
      <PageHeader title={`Welcome back, ${user.full_name.split(" ")[0]}`} description="Here's what's happening with your requests" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="My Repair Requests" value={repairs?.length ?? 0} icon={Wrench} accent="primary" />
        <StatCard label="Active Repairs" value={activeRepairs} icon={Wrench} accent="warning" />
        <StatCard label="Borrowed Items" value={activeBorrows} icon={Laptop} accent="secondary" />
        <StatCard label="Upcoming Bookings" value={bookings?.length ?? 0} icon={CalendarClock} accent="success" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <RecentList
          title="My Repair Requests"
          viewAllHref="/maintenance"
          icon={Wrench}
          emptyLabel="No repair requests yet"
          items={(repairs ?? []).map((r) => ({
            id: r.id,
            primary: r.title,
            secondary: `${r.location} · ${formatDate(r.created_at)}`,
            status: r.status,
          }))}
        />
        <RecentList
          title="My Borrow Records"
          viewAllHref="/it-borrowing"
          icon={Laptop}
          emptyLabel="No items borrowed"
          items={(borrows ?? []).map((b) => ({
            id: b.id,
            primary: b.asset_name,
            secondary: `Due ${formatDate(b.due_date)}`,
            status: b.status,
          }))}
        />
        <RecentList
          title="My Upcoming Bookings"
          viewAllHref="/meeting-rooms"
          icon={CalendarClock}
          emptyLabel="No upcoming bookings"
          items={(bookings ?? []).map((b) => ({
            id: b.id,
            primary: b.room_name,
            secondary: `${formatDate(b.booking_date)} · ${formatTime(b.start_time)}–${formatTime(b.end_time)}`,
            status: "Confirmed",
          }))}
        />
        <RecentList
          title="My Equipment Requests"
          viewAllHref="/equipment"
          icon={Package}
          emptyLabel="No equipment requests"
          items={(equipment ?? []).map((e) => ({
            id: e.id,
            primary: `${e.item_name} (x${e.quantity})`,
            secondary: formatDate(e.request_date),
            status: e.status,
          }))}
        />
      </div>
    </div>
  );
}
