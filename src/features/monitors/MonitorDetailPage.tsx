"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MonitorForm } from "@/features/monitors/MonitorForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormError } from "@/shared/ui/form";
import { BackLink } from "@/shared/ui/page-header";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatAgo, formatMs, targetOf } from "@/shared/lib/format";
import { gql, gqlMessage } from "@/shared/graphql/client";
import { toast } from "sonner";
import {
  DELETE_MONITOR,
  MONITOR_QUERY,
  RUN_MONITOR,
  UPDATE_MONITOR,
} from "@/shared/graphql/documents";
import { monitorToForm } from "@/shared/lib/monitor-input";
import type { Monitor } from "@/shared/lib/types";
import { useSession } from "@/shared/session/SessionProvider";
import { metaClass, monoClass, noteClass, splitClass } from "@/shared/ui/list";

export default function MonitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { refresh } = useSession();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    gql<{ monitor: Monitor }>(MONITOR_QUERY, { id }).then((data) =>
      setMonitor(data.monitor),
    );
  }, [id]);

  async function runCheck() {
    setBusy(true);
    setError(null);
    try {
      const data = await gql<{ runMonitorCheck: Monitor }>(RUN_MONITOR, { id });
      setMonitor(data.runMonitorCheck);
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
          <Button disabled={busy} type="button" onClick={runCheck} size="lg">
            Skontrolovať
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
      <p className={`${monoClass} mb-6`}>
        {formatMs(monitor.lastLatencyMs)} · {formatAgo(monitor.lastCheckedAt)}
        {monitor.lastError ? ` · ${monitor.lastError}` : ""}
      </p>
      <FormError>{error}</FormError>
      <div className={splitClass()}>
        <MonitorForm
          key={monitor.updatedAt}
          initial={monitorToForm(monitor)}
          submitLabel="Uložiť"
          busy={busy}
          error={null}
          onSubmit={async (input) => {
            setBusy(true);
            setError(null);
            try {
              const data = await gql<{ updateMonitor: Monitor }>(
                UPDATE_MONITOR,
                { id, input },
              );
              setMonitor(data.updateMonitor);
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
          Posledný stav je zo schedulera alebo ručnej kontroly.
        </aside>
      </div>
    </>
  );
}
