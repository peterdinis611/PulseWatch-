"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/shared/ui/page-header";
import { StatusBadge } from "@/shared/ui/status-badge";
import { usePoll } from "@/shared/hooks/usePoll";
import { formatAgo } from "@/shared/lib/format";
import { gql } from "@/shared/graphql/client";
import { STRESS_TESTS_QUERY } from "@/shared/graphql/documents";
import type { StressTest } from "@/shared/lib/types";
import {
  listRowClass,
  metaClass,
  monoClass,
  nameClass,
  typeBadgeClass,
} from "@/shared/ui/list";

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
        <div className="grid">
          {tests.map((test) => (
            <Link
              key={test.id}
              href={`/load/${test.id}`}
              className={listRowClass()}
            >
              <StatusBadge value={test.lastStatus} />
              <div>
                <div className={nameClass}>{test.name}</div>
                <span className={typeBadgeClass}>
                  {test.method} · {test.vus} VU · {test.durationSec}s
                </span>
              </div>
              <div className={metaClass}>{test.url}</div>
              <div className={monoClass}>
                {test.lastSummary?.p95Ms != null
                  ? `${Math.round(test.lastSummary.p95Ms)} p95`
                  : "—"}
              </div>
              <div className={monoClass}>{formatAgo(test.lastRunAt)}</div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
