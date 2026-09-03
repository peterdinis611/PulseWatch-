"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { formatAgo, formatMs, targetOf } from "@/shared/lib/format";
import type { Monitor, MonitorStatus } from "@/shared/lib/types";
import { TypeChips } from "@/shared/ui/page-header";
import {
  listRowClass,
  metaClass,
  monoClass,
  nameClass,
  typeBadgeClass,
} from "@/shared/ui/list";
import { StatusBadge } from "@/shared/ui/status-badge";
import { cn } from "@/lib/utils";

const FILTERS = ["ALL", "UP", "DOWN", "UNKNOWN"] as const;

export function MonitorList({
  monitors,
  filterable = false,
}: {
  monitors: Monitor[];
  filterable?: boolean;
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

  return (
    <div>
      {filterable ? (
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <Input
            className="h-9 max-w-80"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Hľadať názov, typ, URL…"
            aria-label="Hľadať monitor"
          />
          <TypeChips
            label="Stav"
            className="mb-0"
            options={[...FILTERS]}
            value={status}
            onChange={(value) => setStatus(value as (typeof FILTERS)[number])}
          />
        </div>
      ) : null}
      <div className="grid">
        {visible.map((monitor) => (
          <Link
            key={monitor.id}
            href={`/monitors/${monitor.id}`}
            className={listRowClass(monitor.enabled ? undefined : "opacity-55")}
          >
            <StatusBadge value={monitor.lastStatus} />
            <div>
              <div className={nameClass}>{monitor.name}</div>
              <span className={typeBadgeClass}>{monitor.type}</span>
            </div>
            <div className={metaClass} title={targetOf(monitor)}>
              {targetOf(monitor)}
            </div>
            <div className={monoClass}>{formatMs(monitor.lastLatencyMs)}</div>
            <div className={monoClass}>{formatAgo(monitor.lastCheckedAt)}</div>
          </Link>
        ))}
      </div>
      {filterable && visible.length === 0 ? (
        <p className={cn(monoClass, "px-1 py-4")}>Nič nesedí na filter.</p>
      ) : null}
    </div>
  );
}
