import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { MonthlyRepairsChart, EquipmentStatsChart, RoomUsageChart } from "@/components/dashboard/charts";
import { RecentList } from "@/components/dashboard/recent-list";
import { Wrench, Package, Laptop, CalendarClock, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [
    { data: repairs },
    { data: equipment },
    { data: borrows },
    { data: bookings },
  ] = await Promise.all([
    supabase.from("repair_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("equipment_requests").select("*").order("request_date", { ascending: false }),
    supabase.from("borrow_records").select("*").order("borrow_date", { ascending: false }),
    supabase.from("room_bookings").select("*"),
  ]);

  const totalRepairs = repairs?.length ?? 0;
  const totalEquipment = equipment?.length ?? 0;
  const totalBorrows = borrows?.length ?? 0;
  const totalBookings = bookings?.length ?? 0;
  const overdueCount = (borrows ?? []).filter((b) => b.status === "Overdue").length;

  // Monthly repairs (last 6 months)
  const now = new Date();
  const monthlyRepairs = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = MONTHS[d.getMonth()];
    const count = (repairs ?? []).filter((r) => {
      const rd = new Date(r.created_at);
      return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
    }).length;
    return { month: label, count };
  });

  // Equipment stats by status
  const equipmentStats = ["Pending", "Approved", "Rejected"].map((status) => ({
    name: status,
    value: (equipment ?? []).filter((e) => e.status === status).length,
  }));

  // Room usage
  const roomUsage = ["Room A", "Room B", "Room C"].map((room) => ({
    room,
    bookings: (bookings ?? []).filter((b) => b.room_name === room).length,
  }));

  const recentRepairs = (repairs ?? []).slice(0, 5);
  const recentEquipment = (equipment ?? []).slice(0, 5);

  return (
    <div>
      <PageHeader title="Admin Overview" description="Office-wide activity across all modules" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Repairs" value={totalRepairs} icon={Wrench} accent="primary" />
        <StatCard label="Equipment Requests" value={totalEquipment} icon={Package} accent="secondary" />
        <StatCard label="Borrow Records" value={totalBorrows} icon={Laptop} accent="success" />
        <StatCard label="Room Bookings" value={totalBookings} icon={CalendarClock} accent="success" />
        <StatCard label="Overdue Assets" value={overdueCount} icon={AlertTriangle} accent="destructive" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <MonthlyRepairsChart data={monthlyRepairs} />
        <EquipmentStatsChart data={equipmentStats} />
        <RoomUsageChart data={roomUsage} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <RecentList
          title="Recent Repair Requests"
          viewAllHref="/maintenance"
          icon={Wrench}
          emptyLabel="No repair requests yet"
          items={recentRepairs.map((r) => ({
            id: r.id,
            primary: r.title,
            secondary: `${r.location} · ${formatDate(r.created_at)}`,
            status: r.status,
          }))}
        />
        <RecentList
          title="Recent Equipment Requests"
          viewAllHref="/equipment"
          icon={Package}
          emptyLabel="No equipment requests yet"
          items={recentEquipment.map((e) => ({
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
