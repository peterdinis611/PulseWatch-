"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Plus, Radar } from "lucide-react";
import { MonitorList } from "@/features/monitors/MonitorList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, PageHeader } from "@/shared/ui/page-header";
import { routes } from "@/shared/lib/routes";
import { useSession } from "@/shared/session";

const HIGHLIGHT_KEY = "pw.highlightMonitor";

export default function MonitorsPage() {
  const { monitors } = useSession();
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem(HIGHLIGHT_KEY);
    if (!id) return;
    sessionStorage.removeItem(HIGHLIGHT_KEY);
    setHighlightId(id);
    const timer = window.setTimeout(() => setHighlightId(null), 5200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <PageHeader
        title="Monitors"
        lede="Your entire fleet in one place. Filters are saved in the URL."
        actions={
          <Button asChild size="lg" className="gap-1.5">
            <Link href={routes.monitorNew}>
              <Plus className="size-4" />
              New monitor
            </Link>
          </Button>
        }
      />
      {monitors.length === 0 ? (
        <EmptyState
          title="No monitors yet"
          action={
            <Button asChild size="lg" className="gap-1.5">
              <Link href={routes.monitorNew}>
                <Plus className="size-4" />
                Add HTTP monitor
              </Link>
            </Button>
          }
        >
          Start with a GET request to an endpoint that needs to stay up.
        </EmptyState>
      ) : (
        <Suspense
          fallback={
            <Card className="gap-0 py-0">
              <CardContent className="grid gap-3 p-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          }
        >
          <MonitorList
            monitors={monitors}
            filterable
            highlightId={highlightId}
          />
        </Suspense>
      )}
      {monitors.length > 0 ? (
        <p className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
          <Radar className="size-3.5" />
          Probes refresh live. Use filters to focus the fleet.
        </p>
      ) : null}
    </>
  );
}
