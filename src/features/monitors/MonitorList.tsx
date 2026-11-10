"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { monitorColumns } from "@/features/monitors/monitor-columns";
import type { Monitor, MonitorStatus, MonitorType } from "@/shared/lib/types";
import { MONITOR_TYPES } from "@/shared/lib/types";
import { TypeChips } from "@/shared/ui/page-header";
import { DataTable } from "@/shared/ui/data-table";
import {
  listPanelClass,
  listToolbarClass,
  monoClass,
} from "@/shared/ui/list";
import { cn } from "@/lib/utils";
import { targetOf } from "@/shared/lib/format";

const STATUS_FILTERS = ["ALL", "UP", "DOWN", "UNKNOWN"] as const;
const TYPE_FILTERS = ["ALL", ...MONITOR_TYPES] as const;

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
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("ALL");
  const [monitorType, setMonitorType] =
    useState<(typeof TYPE_FILTERS)[number]>("ALL");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return monitors.filter((monitor) => {
      const hay = `${monitor.name} ${monitor.type} ${targetOf(monitor)}`.toLowerCase();
      const matchQuery = !q || hay.includes(q);
      const matchStatus =
        status === "ALL" || monitor.lastStatus === (status as MonitorStatus);
      const matchType =
        monitorType === "ALL" || monitor.type === (monitorType as MonitorType);
      return matchQuery && matchStatus && matchType;
    });
  }, [monitors, query, status, monitorType]);

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
                options={[...STATUS_FILTERS]}
                value={status}
                onChange={(value) =>
                  setStatus(value as (typeof STATUS_FILTERS)[number])
                }
              />
            </div>
            <p className={cn(monoClass, "shrink-0 pb-1")}>
              {visible.length} / {monitors.length}
            </p>
          </div>
          <TypeChips
            label="Typ"
            className="mt-4"
            options={[...TYPE_FILTERS]}
            value={monitorType}
            onChange={(value) =>
              setMonitorType(value as (typeof TYPE_FILTERS)[number])
            }
          />
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
              <h2 className="font-heading text-[22px] font-black tracking-[-0.04em]">
                {previewTitle ?? "Posledné kontroly"}
              </h2>
              {previewKicker ? (
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {previewKicker}
                </p>
              ) : null}
            </div>
            <Link
              href={showAllHref ?? "/monitors"}
              className="text-[14px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
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
    <span className="inline-flex items-baseline gap-2 text-[13px] text-muted-foreground">
      {label}
      <b
        className={cn(
          "font-heading text-[15px] font-black tabular-nums tracking-[-0.03em]",
          tone === "up" && "text-up",
          tone === "down" && "text-down",
          tone === "muted" && "text-foreground",
        )}
      >
        {value}
      </b>
    </span>
  );
}
