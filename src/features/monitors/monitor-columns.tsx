"use client";

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { formatAgo, formatMs, targetOf } from "@/shared/lib/format";
import type { Monitor } from "@/shared/lib/types";
import {
  metaClass,
  monoClass,
  nameClass,
  typeBadgeClass,
} from "@/shared/ui/list";
import { StatusBadge } from "@/shared/ui/status-badge";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<Monitor>();

export const monitorColumns = [
  columnHelper.accessor("lastStatus", {
    header: "Stav",
    cell: ({ getValue }) => <StatusBadge value={getValue()} />,
    enableSorting: true,
  }),
  columnHelper.accessor("name", {
    header: "Monitor",
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className={nameClass}>{row.original.name}</div>
        <span className={typeBadgeClass}>{row.original.type}</span>
      </div>
    ),
    enableSorting: true,
  }),
  columnHelper.display({
    id: "target",
    header: "Cieľ",
    cell: ({ row }) => (
      <div
        className={cn(metaClass, "max-w-[min(360px,40vw)]")}
        title={targetOf(row.original)}
      >
        {targetOf(row.original)}
      </div>
    ),
  }),
  columnHelper.accessor("lastLatencyMs", {
    header: "ms",
    cell: ({ getValue }) => (
      <span className={cn(monoClass, "tabular-nums")}>{formatMs(getValue())}</span>
    ),
    enableSorting: true,
    sortingFn: (a, b) =>
      (a.original.lastLatencyMs ?? -1) - (b.original.lastLatencyMs ?? -1),
  }),
  columnHelper.accessor("lastCheckedAt", {
    header: "Kontrola",
    cell: ({ getValue }) => (
      <span className={cn(monoClass, "tabular-nums")}>
        {formatAgo(getValue())}
      </span>
    ),
    enableSorting: true,
    sortingFn: (a, b) => {
      const left = a.original.lastCheckedAt
        ? Date.parse(a.original.lastCheckedAt)
        : 0;
      const right = b.original.lastCheckedAt
        ? Date.parse(b.original.lastCheckedAt)
        : 0;
      return left - right;
    },
  }),
] as ColumnDef<Monitor>[];
