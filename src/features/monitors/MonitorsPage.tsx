"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Plus } from "lucide-react";
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
        lede="Search, filter, and act on the fleet. Filters sync to the URL."
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
              <CardContent className="grid gap-3 p-5">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-1/2" />
                <Skeleton className="h-28 w-full" />
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
    </>
  );
}
