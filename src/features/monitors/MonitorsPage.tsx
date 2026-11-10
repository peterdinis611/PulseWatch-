"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { MonitorList } from "@/features/monitors/MonitorList";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/shared/ui/page-header";
import { routes } from "@/shared/lib/routes";
import { useSession } from "@/shared/session";
import { Skeleton } from "@/components/ui/skeleton";

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
        title="Deväť typov"
        lede="Celá flota na jednom mieste. Filtre ostávajú v URL."
        actions={
          <Button asChild size="lg">
            <Link href={routes.monitorNew}>Nový monitor</Link>
          </Button>
        }
      />
      {monitors.length === 0 ? (
        <EmptyState
          title="Žiadny monitor"
          action={
            <Button asChild size="lg">
              <Link href={routes.monitorNew}>Pridať HTTP monitor</Link>
            </Button>
          }
        >
          Začni GET na endpoint, ktorý má zostať nažive.
        </EmptyState>
      ) : (
        <Suspense
          fallback={
            <div className="grid gap-3 border border-border p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
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
