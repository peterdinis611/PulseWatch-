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
        kicker="Záťaž"
        title="k6 na požiadanie."
        lede="Beh sa vráti hneď ako RUNNING. Výsledky prídu, keď k6 dopíše summary."
        actions={
          <Button asChild size="lg">
            <Link href="/load/new">Nový scenár</Link>
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
                k6 nie je nainštalovaný na API hoste
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {k6Message ??
                  "Nainštaluj k6 na serveri, kde beží backend, alebo nastav K6_BIN v .env."}
              </p>
              <p className={`${monoClass} mt-2`}>
                <a
                  href="https://k6.io/docs/get-started/installation/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Inštalácia k6 →
                </a>
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {data && tests.length === 0 ? (
        <EmptyState
          title="Žiadna záťaž."
          action={
            <Button asChild size="lg" disabled={!k6Installed}>
              <Link href="/load/new">Vytvoriť scenár</Link>
            </Button>
          }
        >
          Namiň VUs na /health a uvidíš p95 a fail rate.
        </EmptyState>
      ) : (
        <section className={listPanelClass("animate-rise")}>
          <DataTable
            columns={stressColumns}
            data={tests}
            getRowHref={(test) => `/load/${test.id}`}
            getRowId={(test) => test.id}
            animateRows
            emptyMessage="Žiadne scenáre."
          />
        </section>
      )}
    </>
  );
}
