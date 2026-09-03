"use client";

import { useEffect, useState } from "react";
import { gql } from "@/shared/graphql/client";
import { HEALTH_QUERY } from "@/shared/graphql/documents";
import { clockNow } from "@/shared/lib/format";
import type { HealthPayload } from "@/shared/lib/types";

export function LivePulse() {
  const [clock, setClock] = useState("--:--:--");
  const [health, setHealth] = useState<HealthPayload | null>(null);

  useEffect(() => {
    setClock(clockNow());
    const t = window.setInterval(() => setClock(clockNow()), 1000);
    gql<{ health: HealthPayload }>(HEALTH_QUERY, undefined, { auth: false })
      .then((data) => setHealth(data.health))
      .catch(() => setHealth(null));
    return () => window.clearInterval(t);
  }, []);

  return (
    <dl className="grid grid-cols-3 gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
      <div>
        <dt>Čas</dt>
        <dd className="mt-1.5 font-heading text-[22px] font-extrabold tracking-[-0.04em] text-foreground normal-case">
          {clock}
        </dd>
      </div>
      <div>
        <dt>API</dt>
        <dd className="mt-1.5 font-heading text-[22px] font-extrabold tracking-[-0.04em] text-foreground normal-case">
          {health?.status ?? "offline"}
        </dd>
      </div>
      <div>
        <dt>Databáza</dt>
        <dd className="mt-1.5 font-heading text-[22px] font-extrabold tracking-[-0.04em] text-foreground normal-case">
          {health?.database ?? "—"}
        </dd>
      </div>
    </dl>
  );
}
