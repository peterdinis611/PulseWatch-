"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { stressColumns } from "@/features/load/stress-columns";
import { EmptyState, PageHeader } from "@/shared/ui/page-header";
import { DataTable } from "@/shared/ui/data-table";
import { usePoll } from "@/shared/hooks/usePoll";
import { gql } from "@/shared/graphql/client";
import { STRESS_TESTS_QUERY } from "@/shared/graphql/documents";
import type { StressTest } from "@/shared/lib/types";
import { listPanelClass } from "@/shared/ui/list";

export default function LoadPage() {
  const { data } = usePoll(
    () => gql<{ stressTests: StressTest[] }>(STRESS_TESTS_QUERY),
    4000,
  );
  const tests = data?.stressTests ?? [];

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
      {data && tests.length === 0 ? (
        <EmptyState
          title="Žiadna záťaž."
          action={
            <Button asChild size="lg">
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
