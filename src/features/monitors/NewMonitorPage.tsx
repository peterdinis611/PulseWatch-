"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MonitorForm } from "@/features/monitors/MonitorForm";
import { BackLink, PageHeader } from "@/shared/ui/page-header";
import { QuickCheckPanel } from "@/shared/ui/quick-check-panel";
import { gql, gqlMessage } from "@/shared/graphql/client";
import { toast } from "sonner";
import { CREATE_MONITOR, PROBE_MONITOR } from "@/shared/graphql/documents";
import type { Monitor, MonitorCheckResult } from "@/shared/lib/types";
import { useSession } from "@/shared/session/SessionProvider";
import { noteClass, splitClass } from "@/shared/ui/list";
import { formatMs } from "@/shared/lib/format";

export default function NewMonitorPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickResult, setQuickResult] = useState<MonitorCheckResult | null>(
    null,
  );

  return (
    <>
      <BackLink href="/monitors">Späť na monitory</BackLink>
      <PageHeader
        kicker="Nový monitor"
        title="Pridať cieľ."
        lede="Interval a timeout nechaj prázdne, ak stačia defaulty z nastavení."
      />
      {quickResult ? <QuickCheckPanel result={quickResult} draft /> : null}
      <div className={splitClass()}>
        <MonitorForm
          submitLabel="Vytvoriť"
          busy={busy}
          checking={checking}
          error={error}
          onQuickCheck={async (input) => {
            setChecking(true);
            setError(null);
            try {
              const data = await gql<{ probeMonitor: MonitorCheckResult }>(
                PROBE_MONITOR,
                { input },
              );
              setQuickResult(data.probeMonitor);
              toast.success(`Rýchla kontrola: ${data.probeMonitor.status}`, {
                description: formatMs(data.probeMonitor.latencyMs),
              });
            } catch (err) {
              const message = gqlMessage(err);
              setError(message);
              toast.error("Rýchla kontrola zlyhala.", { description: message });
            } finally {
              setChecking(false);
            }
          }}
          onSubmit={async (input) => {
            setBusy(true);
            setError(null);
            try {
              const data = await gql<{ createMonitor: Monitor }>(
                CREATE_MONITOR,
                { input },
              );
              await refresh();
              toast.success("Monitor vytvorený.");
              sessionStorage.setItem(
                "pw.highlightMonitor",
                data.createMonitor.id,
              );
              router.replace("/monitors");
            } catch (err) {
              const message = gqlMessage(err);
              setError(message);
              toast.error("Vytvorenie zlyhalo.", { description: message });
              setBusy(false);
            }
          }}
        />
        <aside className={noteClass}>
          Rýchla kontrola otestuje URL alebo host ešte pred vytvorením monitora.
        </aside>
      </div>
    </>
  );
}
