import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusToVariant } from "@/components/ui/badge";
import { EmptyState } from "@/components/layout/empty-state";
import type { LucideIcon } from "lucide-react";

export function RecentList({
  title,
  viewAllHref,
  icon: Icon,
  emptyLabel,
  items,
}: {
  title: string;
  viewAllHref: string;
  icon: LucideIcon;
  emptyLabel: string;
  items: { id: string; primary: string; secondary: string; status: string }[];
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <Link href={viewAllHref} className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState icon={Icon} title={emptyLabel} />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-secondary truncate">{item.primary}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.secondary}</p>
                </div>
                <Badge variant={statusToVariant(item.status)} className="shrink-0">
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
