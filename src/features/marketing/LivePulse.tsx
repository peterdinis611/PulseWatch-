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

  const apiOk = health?.status === "ok" || health?.status === "healthy";
  const dbOk = Boolean(health?.database && health.database !== "down");

  return (
    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div>
        <dt className="text-[13px] text-muted-foreground">Čas</dt>
        <dd className="mt-1 font-heading text-[28px] font-black tracking-[-0.04em] tabular-nums">
          {clock}
        </dd>
      </div>
      <div>
        <dt className="text-[13px] text-muted-foreground">API</dt>
        <dd
          className={`mt-1 font-heading text-[28px] font-black tracking-[-0.04em] ${
            health ? (apiOk ? "text-up" : "text-down") : "text-foreground"
          }`}
        >
          {health?.status ?? "offline"}
        </dd>
      </div>
      <div>
        <dt className="text-[13px] text-muted-foreground">Databáza</dt>
        <dd
          className={`mt-1 font-heading text-[28px] font-black tracking-[-0.04em] ${
            health ? (dbOk ? "text-up" : "text-down") : "text-foreground"
          }`}
        >
          {health?.database ?? "—"}
        </dd>
      </div>
    </dl>
  );
}
