"use client";

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { formatAgo } from "@/shared/lib/format";
import type { StressTest } from "@/shared/lib/types";
import {
  metaClass,
  monoClass,
  nameClass,
  typeBadgeClass,
} from "@/shared/ui/list";
import { StatusBadge } from "@/shared/ui/status-badge";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<StressTest>();

export const stressColumns = [
  columnHelper.accessor("lastStatus", {
    header: "Stav",
    cell: ({ getValue }) => <StatusBadge value={getValue()} />,
    enableSorting: true,
  }),
  columnHelper.accessor("name", {
    header: "Scenár",
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className={nameClass}>{row.original.name}</div>
        <span className={typeBadgeClass}>
          {row.original.method} · {row.original.vus} VU ·{" "}
          {row.original.durationSec}s
        </span>
      </div>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("url", {
    header: "URL",
    cell: ({ getValue }) => (
      <div className={cn(metaClass, "max-w-[min(360px,40vw)]")} title={getValue()}>
        {getValue()}
      </div>
    ),
    enableSorting: true,
  }),
  columnHelper.display({
    id: "p95",
    header: "p95",
    cell: ({ row }) => (
      <span className={cn(monoClass, "tabular-nums")}>
        {row.original.lastSummary?.p95Ms != null
          ? `${Math.round(row.original.lastSummary.p95Ms)} ms`
          : "—"}
      </span>
    ),
    enableSorting: true,
    sortingFn: (a, b) =>
      (a.original.lastSummary?.p95Ms ?? -1) -
      (b.original.lastSummary?.p95Ms ?? -1),
  }),
  columnHelper.accessor("lastRunAt", {
    header: "Beh",
    cell: ({ getValue }) => (
      <span className={cn(monoClass, "tabular-nums")}>
        {formatAgo(getValue())}
      </span>
    ),
    enableSorting: true,
    sortingFn: (a, b) => {
      const left = a.original.lastRunAt ? Date.parse(a.original.lastRunAt) : 0;
      const right = b.original.lastRunAt ? Date.parse(b.original.lastRunAt) : 0;
      return left - right;
    },
  }),
] as ColumnDef<StressTest>[];
