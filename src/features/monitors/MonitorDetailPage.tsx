"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MonitorForm } from "@/features/monitors/MonitorForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormError } from "@/shared/ui/form";
import { BackLink } from "@/shared/ui/page-header";
import { QuickCheckPanel } from "@/shared/ui/quick-check-panel";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatAgo, formatMs, targetOf } from "@/shared/lib/format";
import { gql, gqlMessage } from "@/shared/graphql/client";
import { toast } from "sonner";
import {
  DELETE_MONITOR,
  MONITOR_QUERY,
  QUICK_MONITOR_CHECK,
  RUN_MONITOR,
  UPDATE_MONITOR,
} from "@/shared/graphql/documents";
import { monitorToForm } from "@/shared/lib/monitor-input";
import type { Monitor, MonitorCheckResult } from "@/shared/lib/types";
import { useSession } from "@/shared/session/SessionProvider";
import { metaClass, monoClass, noteClass, splitClass } from "@/shared/ui/list";

export default function MonitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { refresh } = useSession();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickResult, setQuickResult] = useState<MonitorCheckResult | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    gql<{ monitor: Monitor }>(MONITOR_QUERY, { id }).then((data) =>
      setMonitor(data.monitor),
    );
  }, [id]);

  async function runSavedCheck() {
    setBusy(true);
    setError(null);
    try {
      const data = await gql<{ runMonitorCheck: Monitor }>(RUN_MONITOR, { id });
      setMonitor(data.runMonitorCheck);
      setQuickResult(null);
      await refresh();
      toast.success(`Kontrola: ${data.runMonitorCheck.lastStatus}`);
    } catch (err) {
      const message = gqlMessage(err);
      setError(message);
      toast.error("Kontrola zlyhala.", { description: message });
    } finally {
      setBusy(false);
    }
  }

  async function runQuickCheck(input: Record<string, unknown>) {
    setChecking(true);
    setError(null);
    try {
      const data = await gql<{ quickMonitorCheck: MonitorCheckResult }>(
        QUICK_MONITOR_CHECK,
        { id, input },
      );
      setQuickResult(data.quickMonitorCheck);
      toast.success(`Rýchla kontrola: ${data.quickMonitorCheck.status}`, {
        description: formatMs(data.quickMonitorCheck.latencyMs),
      });
    } catch (err) {
      const message = gqlMessage(err);
      setError(message);
      toast.error("Rýchla kontrola zlyhala.", { description: message });
    } finally {
      setChecking(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await gql(DELETE_MONITOR, { id });
      await refresh();
      toast.success("Monitor zmazaný.");
      router.replace("/monitors");
    } catch (err) {
      const message = gqlMessage(err);
      setError(message);
      toast.error("Zmazanie zlyhalo.", { description: message });
      setBusy(false);
    }
  }

  if (!monitor) {
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
      <BackLink href="/monitors">Späť na monitory</BackLink>
      <header className="mb-7 flex flex-col items-start justify-between gap-6 md:flex-row">
        <div>
          <p className={monoClass}>{monitor.type}</p>
          <h1 className="mt-1 font-heading text-[clamp(36px,5vw,56px)] leading-[0.95] tracking-[-0.06em]">
            {monitor.name}
          </h1>
          <p className={metaClass}>{targetOf(monitor)}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <StatusBadge value={monitor.lastStatus} />
          <Button
            disabled={busy || checking}
            type="button"
            onClick={runSavedCheck}
            size="lg"
          >
            {busy ? "Kontrolujem…" : "Kontrola a uložiť"}
          </Button>
          {confirmDelete ? (
            <Button
              variant="destructive"
              disabled={busy || checking}
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
      <p className={`${monoClass} mb-6`}>
        Uložený stav: {formatMs(monitor.lastLatencyMs)} ·{" "}
        {formatAgo(monitor.lastCheckedAt)}
        {monitor.lastError ? ` · ${monitor.lastError}` : ""}
      </p>
      {quickResult ? <QuickCheckPanel result={quickResult} draft /> : null}
      <FormError>{error}</FormError>
      <div className={splitClass()}>
        <MonitorForm
          key={monitor.updatedAt}
          initial={monitorToForm(monitor)}
          submitLabel="Uložiť"
          busy={busy}
          checking={checking}
          error={null}
          onQuickCheck={runQuickCheck}
          onSubmit={async (input) => {
            setBusy(true);
            setError(null);
            try {
              const data = await gql<{ updateMonitor: Monitor }>(
                UPDATE_MONITOR,
                { id, input },
              );
              setMonitor(data.updateMonitor);
              setQuickResult(null);
              await refresh();
              toast.success("Monitor uložený.");
            } catch (err) {
              const message = gqlMessage(err);
              setError(message);
              toast.error("Uloženie zlyhalo.", { description: message });
            } finally {
              setBusy(false);
            }
          }}
        />
        <aside className={noteClass}>
          Rýchla kontrola otestuje hodnoty vo formulári bez uloženia.
          Kontrola a uložiť spustí check na uloženej konfigurácii a zapíše
          výsledok.
        </aside>
      </div>
    </>
  );
}
