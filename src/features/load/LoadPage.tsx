"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stressColumns } from "@/features/load/stress-columns";
import { EmptyState, PageHeader } from "@/shared/ui/page-header";
import { DataTable } from "@/shared/ui/data-table";
import { usePoll } from "@/shared/hooks/usePoll";
import { gql } from "@/shared/graphql/client";
import { LOAD_PAGE_QUERY } from "@/shared/graphql/documents";
import type { StressTest } from "@/shared/lib/types";
import { listPanelClass, monoClass } from "@/shared/ui/list";
import { cn } from "@/lib/utils";

export default function LoadPage() {
  const { data } = usePoll(
    () =>
      gql<{
        stressTests: StressTest[];
        k6Status: { installed: boolean; message: string | null };
      }>(LOAD_PAGE_QUERY),
    4000,
  );
  const tests = data?.stressTests ?? [];
  const k6Installed = data?.k6Status?.installed ?? true;
  const k6Message = data?.k6Status?.message;

  return (
    <>
      <PageHeader
        title="Load tests"
        lede="Run k6 scenarios on demand. A run appears as RUNNING immediately; results land when the summary is ready."
        actions={
          <Button asChild size="lg">
            <Link href="/load/new">New scenario</Link>
          </Button>
        }
      />

      {data && !k6Installed ? (
        <div
          className={cn(
            listPanelClass("animate-rise mb-6"),
            "border-down/30 bg-down/5 px-5 py-4",
          )}
          role="status"
        >
          <div className="flex flex-wrap items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-down" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-heading text-lg tracking-[-0.04em] text-down">
                k6 is not installed on the API host
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {k6Message ??
                  "Install k6 on the server running the backend, or set K6_BIN in .env."}
              </p>
              <p className={`${monoClass} mt-2`}>
                <a
                  href="https://k6.io/docs/get-started/installation/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Install k6 →
                </a>
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {data && tests.length === 0 ? (
        <EmptyState
          title="No load tests yet."
          action={
            <Button asChild size="lg" disabled={!k6Installed}>
              <Link href="/load/new">Create scenario</Link>
            </Button>
          }
        >
          Spin up VUs against /health to see p95 and fail rate.
        </EmptyState>
      ) : (
        <section className={listPanelClass("animate-rise")}>
          <DataTable
            columns={stressColumns}
            data={tests}
            getRowHref={(test) => `/load/${test.id}`}
            getRowId={(test) => test.id}
            animateRows
            emptyMessage="No scenarios."
          />
        </section>
      )}
    </>
  );
}
