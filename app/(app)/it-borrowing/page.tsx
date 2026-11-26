import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { syncOverdueAssetsAction } from "@/actions/borrowing";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { ReturnAssetButton } from "@/components/it-borrowing/return-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, statusToVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Laptop, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ITBorrowingPage() {
  const user = await requireUser();
  await syncOverdueAssetsAction();
  const supabase = await createClient();

  let query = supabase
    .from("borrow_records")
    .select("*, users!borrow_records_borrower_fkey(full_name)")
    .order("borrow_date", { ascending: false });

  if (user.role !== "admin") {
    query = query.eq("borrower", user.id);
  }

  const { data: records } = await query;

  return (
    <div>
      <PageHeader
        title="IT Borrowing"
        description={user.role === "admin" ? "Track all borrowed IT assets" : "Your borrowed laptops, monitors, and other IT equipment"}
        action={
          <Button asChild>
            <Link href="/it-borrowing/new">
              <Plus /> Borrow asset
            </Link>
          </Button>
        }
      />

      {!records || records.length === 0 ? (
        <EmptyState
          icon={Laptop}
          title="No borrow records"
          description="Borrow a laptop, mouse, keyboard, monitor, or projector for your work."
          action={
            <Button asChild size="sm">
              <Link href="/it-borrowing/new">
                <Plus /> Borrow asset
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {records.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-secondary">{r.asset_name}</h3>
                    {r.asset_tag && (
                      <span className="text-xs text-muted-foreground font-mono">{r.asset_tag}</span>
                    )}
                    <Badge variant={statusToVariant(r.status)}>{r.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Borrowed {formatDate(r.borrow_date)} · Due {formatDate(r.due_date)}
                    {r.return_date ? ` · Returned ${formatDate(r.return_date)}` : ""}
                    {user.role === "admin" &&
                      ` · ${(r as any).users?.full_name ?? "Unknown"}`}
                  </p>
                </div>
                {r.status !== "Returned" && (user.role === "admin" || r.borrower === user.id) && (
                  <ReturnAssetButton id={r.id} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
