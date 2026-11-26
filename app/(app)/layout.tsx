import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const supabase = await createClient();

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block h-screen sticky top-0">
          <Sidebar role={user.role} />
        </aside>
        <div className="flex flex-col min-h-screen">
          <Topbar user={user} unreadCount={count ?? 0} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
