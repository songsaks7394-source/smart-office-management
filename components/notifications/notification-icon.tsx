import { Wrench, PackageCheck, PackageX, AlertTriangle, CalendarCheck, Bell } from "lucide-react";
import type { NotificationType } from "@/types/database";

const ICON_MAP: Record<NotificationType, { icon: typeof Bell; className: string }> = {
  repair_created: { icon: Wrench, className: "bg-blue-100 text-blue-600" },
  repair_status_changed: { icon: Wrench, className: "bg-amber-100 text-amber-600" },
  equipment_approved: { icon: PackageCheck, className: "bg-emerald-100 text-emerald-600" },
  equipment_rejected: { icon: PackageX, className: "bg-red-100 text-red-600" },
  asset_overdue: { icon: AlertTriangle, className: "bg-red-100 text-red-600" },
  booking_confirmed: { icon: CalendarCheck, className: "bg-emerald-100 text-emerald-600" },
};

export function NotificationIcon({ type }: { type: NotificationType }) {
  const config = ICON_MAP[type] ?? { icon: Bell, className: "bg-muted text-muted-foreground" };
  const Icon = config.icon;
  return (
    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${config.className}`}>
      <Icon className="h-[18px] w-[18px]" />
    </div>
  );
}
