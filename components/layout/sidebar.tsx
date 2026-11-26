"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wrench,
  Package,
  Laptop,
  CalendarClock,
  Bell,
  Building2,
  X,
} from "lucide-react";
import type { UserRole } from "@/types/database";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/maintenance", label: "Maintenance Requests", icon: Wrench },
  { href: "/equipment", label: "Equipment Requests", icon: Package },
  { href: "/it-borrowing", label: "IT Borrowing", icon: Laptop },
  { href: "/meeting-rooms", label: "Meeting Rooms", icon: CalendarClock },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function Sidebar({
  role,
  onNavigate,
}: {
  role: UserRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-secondary text-white">
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Building2 className="h-[18px] w-[18px]" />
          </div>
          <span className="text-sm leading-tight">
            Smart Office
            <span className="block text-[10px] font-normal text-white/50">Management System</span>
          </span>
        </Link>
        <button className="lg:hidden text-white/70" onClick={onNavigate}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-white shadow"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}

        {role === "admin" && (
          <>
            <div className="pt-3 pb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Admin
            </div>
            <Link
              href="/dashboard/admin"
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === "/dashboard/admin"
                  ? "bg-primary text-white shadow"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <LayoutDashboard className="h-[18px] w-[18px] shrink-0" />
              Admin Overview
            </Link>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-white/10 text-[11px] text-white/40">
        v1.0.0 &middot; Smart Office
      </div>
    </div>
  );
}
