import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { StatusFilterBar } from "@/components/maintenance/filter-bar";
import { RepairStatusSelect } from "@/components/maintenance/status-select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, statusToVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Plus, MapPin, ImageOff } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { RepairStatus } from "@/types/database";

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("repair_requests")
    .select("*, users!repair_requests_created_by_fkey(full_name)")
    .order("created_at", { ascending: false });

  if (user.role !== "admin") {
    query = query.eq("created_by", user.id);
  }
  if (status && status !== "All") {
    query = query.eq("status", status as RepairStatus);
  }

  const { data: requests } = await query;

  return (
    <div>
      <PageHeader
        title="Maintenance Requests"
        description={user.role === "admin" ? "All repair requests across the office" : "Requests you've submitted"}
        action={
          <div className="flex items-center gap-2">
            <StatusFilterBar />
            <Button asChild>
              <Link href="/maintenance/new">
                <Plus /> New request
              </Link>
            </Button>
          </div>
        }
      />

      {!requests || requests.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No repair requests"
          description="Report a broken item or facility issue to get it fixed."
          action={
            <Button asChild size="sm">
              <Link href="/maintenance/new">
                <Plus /> Create request
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                <div className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {r.image_url ? (
                    <Image src={r.image_url} alt={r.title} width={80} height={80} className="h-full w-full object-cover" />
                  ) : (
                    <ImageOff className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/maintenance/${r.id}`} className="font-semibold text-secondary hover:text-primary truncate">
                      {r.title}
                    </Link>
                    <Badge variant={statusToVariant(r.status)}>{r.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{r.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {r.location}
                    </span>
                    <span>{formatDateTime(r.created_at)}</span>
                    {user.role === "admin" && (
                      <span>by {(r as any).users?.full_name ?? "Unknown"}</span>
                    )}
                  </div>
                </div>
                {user.role === "admin" && (
                  <div className="sm:self-center">
                    <RepairStatusSelect id={r.id} status={r.status} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
