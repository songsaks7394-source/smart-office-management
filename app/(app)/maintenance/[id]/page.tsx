import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, statusToVariant } from "@/components/ui/badge";
import { RepairStatusSelect } from "@/components/maintenance/status-select";
import { ArrowLeft, MapPin, Calendar, User as UserIcon } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("repair_requests")
    .select("*, users!repair_requests_created_by_fkey(full_name, department)")
    .eq("id", id)
    .single();

  if (!request) notFound();
  if (user.role !== "admin" && request.created_by !== user.id) notFound();

  const requester = (request as any).users as { full_name: string; department: string | null } | null;

  return (
    <div className="max-w-2xl">
      <Link href="/maintenance" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to requests
      </Link>

      <PageHeader
        title={request.title}
        action={
          user.role === "admin" ? (
            <RepairStatusSelect id={request.id} status={request.status} />
          ) : (
            <Badge variant={statusToVariant(request.status)} className="text-sm">
              {request.status}
            </Badge>
          )
        }
      />

      <Card>
        {request.image_url && (
          <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-muted">
            <Image
              src={request.image_url}
              alt={request.title}
              width={800}
              height={450}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-secondary mb-1">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.description}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{request.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDateTime(request.created_at)}</span>
            </div>
            {requester && (
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {requester.full_name}
                  {requester.department ? ` · ${requester.department}` : ""}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
