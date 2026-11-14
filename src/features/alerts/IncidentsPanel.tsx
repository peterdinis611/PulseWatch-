"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { gql, gqlMessage } from "@/shared/graphql/client";
import { INCIDENTS_QUERY } from "@/shared/graphql/documents";
import { formatAgo, formatWhen } from "@/shared/lib/format";
import { routes } from "@/shared/lib/routes";
import type { Incident, IncidentStatus } from "@/shared/lib/types";
import { usePoll } from "@/shared/hooks/usePoll";
import { listPanelClass, monoClass } from "@/shared/ui/list";
import { cn } from "@/lib/utils";

type Filter = "ALL" | IncidentStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "OPEN", label: "Open" },
  { id: "RESOLVED", label: "Resolved" },
];

export function formatDuration(from: string, to?: string | null, now = Date.now()) {
  const start = Date.parse(from);
  const end = to ? Date.parse(to) : now;
  if (Number.isNaN(start) || Number.isNaN(end)) return "—";
  const sec = Math.max(0, Math.round((end - start) / 1000));
  if (sec < 60) return `${sec} s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} h ${min % 60} min`;
  const days = Math.floor(hours / 24);
  return `${days} d ${hours % 24} h`;
}

export function IncidentsPanel() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [now, setNow] = useState(() => Date.now());

  const { data, error, loading } = usePoll(
    async () => {
      const res = await gql<{ incidents: Incident[] }>(
        INCIDENTS_QUERY,
        filter === "ALL" ? {} : { status: filter },
      );
      return res.incidents;
    },
    15_000,
    [filter],
  );

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const items = data ?? [];
  const openCount = items.filter((i) => i.status === "OPEN").length;

  return (
    <section className={listPanelClass("animate-rise")}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div className="flex gap-2" role="radiogroup" aria-label="Incident status">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "border-b-2 px-1 pb-2 text-[14px] transition-colors",
                filter === f.id
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className={monoClass}>
          {items.length} {items.length === 1 ? "incident" : "incidents"}
          {filter === "ALL" ? ` · ${openCount} open` : ""}
        </p>
      </div>

      {error ? (
        <p className="px-5 py-4 text-sm text-destructive">{gqlMessage(error)}</p>
      ) : null}

      {loading && !data ? (
        <p className="px-5 py-10 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Loading…
        </p>
      ) : items.length === 0 ? (
        <div className="px-5 py-14">
          <p className="font-heading text-3xl tracking-[-0.05em]">All clear.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {filter === "OPEN"
              ? "No open incidents."
              : "When a monitor goes down, its incident will appear here."}
          </p>
        </div>
      ) : (
        items.map((incident) => (
          <IncidentRow key={incident.id} incident={incident} now={now} />
        ))
      )}
    </section>
  );
}

function IncidentRow({ incident, now }: { incident: Incident; now: number }) {
  const open = incident.status === "OPEN";
  return (
    <Link
      href={routes.monitor(incident.monitorId)}
      className={cn(
        "grid grid-cols-1 gap-3 border-b border-border/60 px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/30 md:grid-cols-[96px_minmax(0,1fr)_auto] md:gap-5",
        open && "bg-down/5 shadow-[inset_3px_0_0_var(--down)]",
      )}
    >
      <span
        className={cn(
          "h-fit w-fit rounded-md border px-2 py-0.5 font-mono text-[11px] tracking-wide",
          open ? "border-down/35 text-down" : "border-up/35 text-up",
        )}
      >
        {open ? "OPEN" : "RESOLVED"}
      </span>
      <div className="min-w-0">
        <p className="font-heading text-lg tracking-[-0.04em]">{incident.title}</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {incident.monitorName}
        </p>
        {incident.lastError ? (
          <p className="mt-2 truncate font-mono text-[12px] text-muted-foreground">
            {incident.lastError}
          </p>
        ) : null}
      </div>
      <dl className="grid gap-0.5 text-left font-mono text-[12px] tabular-nums text-muted-foreground md:text-right">
        <div>
          <dt className="sr-only">Duration</dt>
          <dd className={cn("text-[14px]", open ? "text-down" : "text-foreground")}>
            {formatDuration(incident.openedAt, incident.resolvedAt, now)}
          </dd>
        </div>
        <div title={formatWhen(incident.openedAt)}>
          opened {formatAgo(incident.openedAt)}
        </div>
        {incident.resolvedAt ? (
          <div title={formatWhen(incident.resolvedAt)}>
            resolved {formatAgo(incident.resolvedAt)}
          </div>
        ) : null}
      </dl>
    </Link>
  );
}
