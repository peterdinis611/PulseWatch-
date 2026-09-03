"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MonitorForm } from "@/features/monitors/MonitorForm";
import { BackLink, PageHeader } from "@/shared/ui/page-header";
import { gql, gqlMessage } from "@/shared/graphql/client";
import { toast } from "sonner";
import { CREATE_MONITOR } from "@/shared/graphql/documents";
import type { Monitor } from "@/shared/lib/types";
import { useSession } from "@/shared/session/SessionProvider";
import { noteClass, splitClass } from "@/shared/ui/list";

export default function NewMonitorPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <BackLink href="/monitors">Späť na monitory</BackLink>
      <PageHeader
        kicker="Nový monitor"
        title="Pridať cieľ."
        lede="Interval a timeout nechaj prázdne, ak stačia defaulty z nastavení."
      />
      <div className={splitClass()}>
        <MonitorForm
          submitLabel="Vytvoriť"
          busy={busy}
          error={error}
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
              router.replace(`/monitors/${data.createMonitor.id}`);
            } catch (err) {
              const message = gqlMessage(err);
              setError(message);
              toast.error("Vytvorenie zlyhalo.", { description: message });
              setBusy(false);
            }
          }}
        />
        <aside className={noteClass}>
          HTTP je predvolený. Ostatné typy otvoria host/port alebo connection
          URL.
        </aside>
      </div>
    </>
  );
}
