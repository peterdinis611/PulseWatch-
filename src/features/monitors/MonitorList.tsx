"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { monitorColumns } from "@/features/monitors/monitor-columns";
import type { Monitor, MonitorStatus } from "@/shared/lib/types";
import { TypeChips } from "@/shared/ui/page-header";
import { DataTable } from "@/shared/ui/data-table";
import {
  listPanelClass,
  listToolbarClass,
  monoClass,
} from "@/shared/ui/list";
import { cn } from "@/lib/utils";
import { targetOf } from "@/shared/lib/format";

const FILTERS = ["ALL", "UP", "DOWN", "UNKNOWN"] as const;

export function MonitorList({
  monitors,
  filterable = false,
  variant = filterable ? "fleet" : "plain",
  highlightId,
  previewKicker,
  previewTitle,
  showAllHref,
}: {
  monitors: Monitor[];
  filterable?: boolean;
  variant?: "plain" | "fleet" | "preview";
  highlightId?: string | null;
  previewKicker?: string;
  previewTitle?: string;
  showAllHref?: string;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof FILTERS)[number]>("ALL");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return monitors.filter((monitor) => {
      const hay = `${monitor.name} ${monitor.type} ${targetOf(monitor)}`.toLowerCase();
      const matchQuery = !q || hay.includes(q);
      const matchStatus =
        status === "ALL" || monitor.lastStatus === (status as MonitorStatus);
      return matchQuery && matchStatus;
    });
  }, [monitors, query, status]);

  const counts = useMemo(
    () => ({
      up: monitors.filter((m) => m.lastStatus === "UP").length,
      down: monitors.filter((m) => m.lastStatus === "DOWN").length,
      unknown: monitors.filter((m) => m.lastStatus === "UNKNOWN").length,
    }),
    [monitors],
  );

  const table = (
    <DataTable
      columns={monitorColumns}
      data={visible}
      getRowHref={(monitor) => `/monitors/${monitor.id}`}
      getRowId={(monitor) => monitor.id}
      highlightRowId={highlightId}
      animateRows={variant !== "plain"}
      emptyMessage={
        filterable || variant === "fleet"
          ? "Nič nesedí na filter."
          : "Žiadne monitory."
      }
      rowClassName={(monitor) =>
        monitor.enabled ? undefined : "opacity-55"
      }
    />
  );

  if (filterable || variant === "fleet") {
    return (
      <section className={listPanelClass()}>
        <div className={listToolbarClass()}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-wrap items-end gap-4">
              <label className="relative block min-w-[min(100%,280px)] flex-1">
                <span className="sr-only">Hľadať monitor</span>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-10 border-border/70 bg-background/60 pl-9"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Hľadať názov, typ, URL…"
                />
              </label>
              <TypeChips
                label="Stav"
                className="mb-0 shrink-0"
                options={[...FILTERS]}
                value={status}
                onChange={(value) => setStatus(value as (typeof FILTERS)[number])}
              />
            </div>
            <p className={cn(monoClass, "shrink-0 pb-1")}>
              {visible.length} / {monitors.length}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatPill label="Hore" value={counts.up} tone="up" />
            <StatPill label="Dole" value={counts.down} tone="down" />
            <StatPill label="Neznáme" value={counts.unknown} tone="muted" />
          </div>
        </div>
        {table}
      </section>
    );
  }

  if (variant === "preview") {
    return (
      <section className={listPanelClass("animate-rise")}>
        <div className={listToolbarClass()}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                {previewKicker ?? "Na rade"}
              </p>
              <h2 className="mt-1 font-heading text-[clamp(24px,3vw,32px)] leading-none tracking-[-0.06em]">
                {previewTitle ?? "Posledné kontroly"}
              </h2>
            </div>
            <Link
              href={showAllHref ?? "/monitors"}
              className={cn(
                monoClass,
                "inline-flex items-center gap-1 rounded-full border border-border/70 px-3 py-1.5 transition-colors hover:border-primary/40 hover:text-foreground",
              )}
            >
              Všetky monitory →
            </Link>
          </div>
        </div>
        {table}
      </section>
    );
  }

  return table;
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "up" | "down" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
        tone === "up" && "border-up/25 bg-up/8 text-up",
        tone === "down" && "border-down/25 bg-down/8 text-down",
        tone === "muted" && "border-border/70 bg-background/40 text-muted-foreground",
      )}
    >
      {label}
      <b className="font-heading text-sm tracking-[-0.04em]">{value}</b>
    </span>
  );
}
