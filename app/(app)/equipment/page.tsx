import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { EquipmentReviewActions } from "@/components/equipment/review-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, statusToVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function EquipmentPage() {
  const user = await requireUser();
  const supabase = await createClient();

  let query = supabase
    .from("equipment_requests")
    .select("*, users!equipment_requests_requested_by_fkey(full_name)")
    .order("request_date", { ascending: false });

  if (user.role !== "admin") {
    query = query.eq("requested_by", user.id);
  }

  const { data: requests } = await query;

  return (
    <div>
      <PageHeader
        title="Equipment Requests"
        description={user.role === "admin" ? "Review and approve equipment requests" : "Request office equipment or supplies"}
        action={
          <Button asChild>
            <Link href="/equipment/new">
              <Plus /> New request
            </Link>
          </Button>
        }
      />

      {!requests || requests.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No equipment requests"
          description="Need a new monitor, keyboard, or other supplies? Request it here."
          action={
            <Button asChild size="sm">
              <Link href="/equipment/new">
                <Plus /> Create request
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-secondary">{r.item_name}</h3>
                    <Badge variant="outline" className="text-xs">
                      x{r.quantity}
                    </Badge>
                    <Badge variant={statusToVariant(r.status)}>{r.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{r.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(r.request_date)}
                    {user.role === "admin" &&
                      ` · by ${(r as any).users?.full_name ?? "Unknown"}`}
                  </p>
                </div>
                {user.role === "admin" && r.status === "Pending" && <EquipmentReviewActions id={r.id} />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
