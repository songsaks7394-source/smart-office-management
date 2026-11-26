import { Building2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-secondary text-white p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 flex items-center gap-2 text-lg font-semibold">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
          Smart Office
        </div>
        <div className="relative z-10 space-y-4 max-w-md">
          <h1 className="text-3xl font-bold leading-tight">
            Run your office smarter, not harder.
          </h1>
          <p className="text-white/70">
            Maintenance requests, equipment approvals, IT asset borrowing, and meeting room
            bookings — all in one enterprise-grade platform.
          </p>
        </div>
        <p className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} Smart Office Management System
        </p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
