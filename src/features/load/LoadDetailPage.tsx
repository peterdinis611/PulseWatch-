"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  blankStressForm,
  StressForm,
  type StressFormState,
} from "@/features/load/StressForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormError } from "@/shared/ui/form";
import { BackLink } from "@/shared/ui/page-header";
import { StatusBadge } from "@/shared/ui/status-badge";
import { usePoll } from "@/shared/hooks/usePoll";
import { formatPct, formatWhen } from "@/shared/lib/format";
import { gql, gqlMessage } from "@/shared/graphql/client";
import { toast } from "sonner";
import {
  DELETE_STRESS,
  RUN_STRESS,
  STRESS_TEST_QUERY,
  UPDATE_STRESS,
} from "@/shared/graphql/documents";
import type { StressTest, StressTestRun } from "@/shared/lib/types";
import { useSession } from "@/shared/session/SessionProvider";
import { metaClass, monoClass, splitClass } from "@/shared/ui/list";

function toForm(test: StressTest): StressFormState {
  return {
    ...blankStressForm(),
    name: test.name,
    url: test.url,
    method: test.method,
    vus: String(test.vus),
    durationSec: String(test.durationSec),
    expectedStatus: String(test.expectedStatus),
    p95Ms: test.p95Ms != null ? String(test.p95Ms) : "",
    maxFailRate: test.maxFailRate != null ? String(test.maxFailRate) : "",
  };
}

export default function LoadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { refresh } = useSession();
  const { data, reload } = usePoll(
    () =>
      gql<{ stressTest: StressTest; stressTestRuns: StressTestRun[] }>(
        STRESS_TEST_QUERY,
        { id },
      ),
    2000,
    [id],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const test = data?.stressTest;
  const runs = data?.stressTestRuns ?? [];

  async function run() {
    setBusy(true);
    setError(null);
    try {
      await gql<{ runStressTest: StressTest }>(RUN_STRESS, { id });
      await reload();
      await refresh();
      toast.success("k6 beží.", { description: "Výsledky prídu, keď dopíše summary." });
    } catch (err) {
      const message = gqlMessage(err);
      setError(message);
      toast.error("Spustenie zlyhalo.", { description: message });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await gql(DELETE_STRESS, { id });
      await refresh();
      toast.success("Scenár zmazaný.");
      router.replace("/load");
    } catch (err) {
      const message = gqlMessage(err);
      setError(message);
      toast.error("Zmazanie zlyhalo.", { description: message });
      setBusy(false);
    }
  }

  if (!test) {
    return (
      <div className="grid max-w-md gap-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return (
    <>
      <BackLink href="/load">Späť na záťaž</BackLink>
      <header className="mb-7 flex flex-col items-start justify-between gap-6 md:flex-row">
        <div>
          <p className={monoClass}>k6</p>
          <h1 className="mt-1 font-heading text-[clamp(36px,5vw,56px)] leading-[0.95] tracking-[-0.06em]">
            {test.name}
          </h1>
          <p className={metaClass}>
            {test.method} {test.url}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <StatusBadge value={test.lastStatus} />
          <Button
            disabled={busy || test.lastStatus === "RUNNING"}
            type="button"
            onClick={run}
            size="lg"
          >
            {test.lastStatus === "RUNNING" ? "Beží…" : "Spustiť k6"}
          </Button>
          {confirmDelete ? (
            <Button
              variant="destructive"
              disabled={busy}
              type="button"
              onClick={remove}
              size="lg"
            >
              Naozaj zmazať
            </Button>
          ) : (
            <Button
              variant="ghost"
              type="button"
              onClick={() => setConfirmDelete(true)}
              size="lg"
            >
              Zmazať
            </Button>
          )}
        </div>
      </header>
      <FormError>{test.lastError}</FormError>
      <FormError>{error}</FormError>
      {test.lastSummary ? (
        <div className="mb-7 flex flex-wrap gap-4 font-mono text-xs tracking-[0.08em] text-muted-foreground">
          <span>REQ {test.lastSummary.httpReqs ?? "—"}</span>
          <span>
            AVG{" "}
            {test.lastSummary.avgMs != null
              ? `${Math.round(test.lastSummary.avgMs)} ms`
              : "—"}
          </span>
          <span>
            P95{" "}
            {test.lastSummary.p95Ms != null
              ? `${Math.round(test.lastSummary.p95Ms)} ms`
              : "—"}
          </span>
          <span>FAIL {formatPct(test.lastSummary.failRate)}</span>
        </div>
      ) : null}
      <div className={splitClass()}>
        <StressForm
          key={test.updatedAt}
          initial={toForm(test)}
          submitLabel="Uložiť scenár"
          busy={busy}
          error={null}
          onSubmit={async (input) => {
            setBusy(true);
            setError(null);
            try {
              await gql<{ updateStressTest: StressTest }>(UPDATE_STRESS, {
                id,
                input,
              });
              await reload();
              toast.success("Scenár uložený.");
            } catch (err) {
              const message = gqlMessage(err);
              setError(message);
              toast.error("Uloženie zlyhalo.", { description: message });
            } finally {
              setBusy(false);
            }
          }}
        />
        <section>
          <p className={`${monoClass} mb-3`}>História</p>
          {runs.length === 0 ? (
            <p className="text-muted-foreground">Zatiaľ žiadny beh.</p>
          ) : (
            runs.map((item) => (
              <article
                className="grid grid-cols-1 items-start gap-3.5 border-t border-border py-3.5 md:grid-cols-[110px_1fr_auto]"
                key={item.id}
              >
                <StatusBadge value={item.status} />
                <div>
                  <div className={monoClass}>{formatWhen(item.startedAt)}</div>
                  {item.error ? <FormError>{item.error}</FormError> : null}
                </div>
                <div className={monoClass}>
                  {item.summary?.p95Ms != null
                    ? `${Math.round(item.summary.p95Ms)} p95`
                    : "—"}
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </>
  );
}
