"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Flame,
  ListFilter,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { gql, gqlMessage } from "@/shared/graphql/client";
import { INCIDENTS_QUERY } from "@/shared/graphql/documents";
import { formatAgo, formatWhen } from "@/shared/lib/format";
import { routes } from "@/shared/lib/routes";
import type { Incident, IncidentStatus } from "@/shared/lib/types";
import { usePoll } from "@/shared/hooks/usePoll";
import { cn } from "@/lib/utils";

type Filter = "ALL" | IncidentStatus;

const FILTERS: {
  id: Filter;
  label: string;
  icon: typeof ListFilter;
}[] = [
  { id: "ALL", label: "All", icon: ListFilter },
  { id: "OPEN", label: "Open", icon: Flame },
  { id: "RESOLVED", label: "Resolved", icon: ShieldCheck },
];

export function formatDuration(
  from: string,
  to?: string | null,
  now = Date.now(),
) {
  const start = Date.parse(from);
  const end = to ? Date.parse(to) : now;
  if (Number.isNaN(start) || Number.isNaN(end)) return "—";
  const sec = Math.max(0, Math.round((end - start) / 1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h ${min % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
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
    <Card className="animate-rise gap-0 overflow-hidden py-0 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3 md:px-5">
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(next) => {
            if (next) setFilter(next as Filter);
          }}
          variant="outline"
          className="flex flex-wrap gap-1"
          aria-label="Incident status"
        >
          {FILTERS.map((item) => {
            const Icon = item.icon;
            return (
              <ToggleGroupItem
                key={item.id}
                value={item.id}
                aria-label={item.label}
                className="h-8 gap-1.5 rounded-md px-2.5 text-[12px] data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
              >
                <Icon className="size-3.5" />
                {item.label}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>

        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Badge
            variant="outline"
            className="h-7 gap-1.5 rounded-md px-2 font-mono tabular-nums"
          >
            {items.length} {items.length === 1 ? "incident" : "incidents"}
          </Badge>
          {filter === "ALL" ? (
            <Badge
              variant="outline"
              className={cn(
                "h-7 gap-1 rounded-md px-2 font-mono tabular-nums",
                openCount > 0
                  ? "border-down/35 text-down"
                  : "text-muted-foreground",
              )}
            >
              <Flame className="size-3" />
              {openCount} open
            </Badge>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="px-4 py-4 text-sm text-destructive md:px-5">
          {gqlMessage(error)}
        </p>
      ) : null}

      {loading && !data ? (
        <div className="grid gap-3 px-4 py-5 md:px-5">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="grid justify-items-start gap-2 px-4 py-12 md:px-5">
          <span className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-muted/30 text-up">
            <CheckCircle2 className="size-5" />
          </span>
          <p className="font-heading text-[22px] font-black tracking-[-0.04em]">
            All clear
          </p>
          <p className="max-w-[42ch] text-[14px] text-muted-foreground">
            {filter === "OPEN"
              ? "No open incidents right now."
              : "When a monitor goes DOWN, the incident lands here until recovery."}
          </p>
        </div>
      ) : (
        <ul>
          {items.map((incident) => (
            <li key={incident.id}>
              <IncidentRow incident={incident} now={now} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function IncidentRow({ incident, now }: { incident: Incident; now: number }) {
  const open = incident.status === "OPEN";
  return (
    <Link
      href={routes.monitor(incident.monitorId)}
      className={cn(
        "group grid grid-cols-1 gap-3 border-b border-border/60 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-muted/25 md:grid-cols-[108px_minmax(0,1fr)_auto] md:items-start md:gap-4 md:px-5",
        open && "bg-down/[0.04] shadow-[inset_3px_0_0_var(--down)]",
      )}
    >
      <Badge
        variant="outline"
        className={cn(
          "h-6 w-fit gap-1.5 rounded-md px-2 font-mono text-[10px] tracking-wide",
          open
            ? "border-down/40 bg-down/5 text-down"
            : "border-up/40 bg-up/5 text-up",
        )}
      >
        {open ? (
          <AlertTriangle className="size-3" />
        ) : (
          <CheckCircle2 className="size-3" />
        )}
        {open ? "OPEN" : "RESOLVED"}
      </Badge>

      <div className="min-w-0">
        <div className="flex items-start gap-2">
          <p className="min-w-0 font-heading text-[16px] font-medium tracking-[-0.03em]">
            {incident.title}
          </p>
          <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
          {incident.monitorName}
        </p>
        {incident.lastError ? (
          <p className="mt-1.5 truncate font-mono text-[12px] text-muted-foreground">
            {incident.lastError}
          </p>
        ) : null}
      </div>

      <dl className="grid gap-1 text-left md:min-w-[132px] md:justify-items-end md:text-right">
        <div className="inline-flex items-center gap-1.5 md:justify-end">
          <Clock3 className="size-3.5 text-muted-foreground" />
          <dd
            className={cn(
              "font-mono text-[13px] font-medium tabular-nums",
              open ? "text-down" : "text-foreground",
            )}
          >
            {formatDuration(incident.openedAt, incident.resolvedAt, now)}
          </dd>
        </div>
        <div
          className="font-mono text-[11px] text-muted-foreground"
          title={formatWhen(incident.openedAt)}
        >
          opened {formatAgo(incident.openedAt)}
        </div>
        {incident.resolvedAt ? (
          <div
            className="font-mono text-[11px] text-muted-foreground"
            title={formatWhen(incident.resolvedAt)}
          >
            resolved {formatAgo(incident.resolvedAt)}
          </div>
        ) : null}
      </dl>
    </Link>
  );
}
