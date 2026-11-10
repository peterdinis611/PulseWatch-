"use client";

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MonitorFlags,
  MonitorRowActions,
} from "@/features/monitors/MonitorRowActions";
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

export function buildMonitorColumns({
  selectable = false,
  selectedIds,
  onToggle,
  onToggleAll,
  allSelected = false,
  someSelected = false,
  showActions = true,
  compactActions = false,
}: {
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggle?: (id: string, next: boolean) => void;
  onToggleAll?: (next: boolean) => void;
  allSelected?: boolean;
  someSelected?: boolean;
  showActions?: boolean;
  compactActions?: boolean;
} = {}): ColumnDef<Monitor>[] {
  const columns: ColumnDef<Monitor>[] = [];

  if (selectable) {
    columns.push(
      columnHelper.display({
        id: "select",
        header: () => (
          <div data-no-row-nav onClick={(event) => event.stopPropagation()}>
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={(value) => onToggleAll?.(value === true)}
              aria-label="Vybrať všetky"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div data-no-row-nav onClick={(event) => event.stopPropagation()}>
            <Checkbox
              checked={selectedIds?.has(row.original.id) ?? false}
              onCheckedChange={(value) =>
                onToggle?.(row.original.id, value === true)
              }
              aria-label={`Vybrať ${row.original.name}`}
            />
          </div>
        ),
        enableSorting: false,
      }),
    );
  }

  columns.push(
    columnHelper.accessor("lastStatus", {
      header: "Stav",
      cell: ({ getValue }) => <StatusBadge value={getValue()} />,
      enableSorting: true,
    }) as ColumnDef<Monitor>,
    columnHelper.accessor("name", {
      header: "Monitor",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className={nameClass}>{row.original.name}</div>
          <span className={typeBadgeClass}>{row.original.type}</span>
          <MonitorFlags monitor={row.original} />
        </div>
      ),
      enableSorting: true,
    }) as ColumnDef<Monitor>,
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
        <span className={cn(monoClass, "tabular-nums")}>
          {formatMs(getValue())}
        </span>
      ),
      enableSorting: true,
      sortingFn: (a, b) =>
        (a.original.lastLatencyMs ?? -1) - (b.original.lastLatencyMs ?? -1),
    }) as ColumnDef<Monitor>,
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
    }) as ColumnDef<Monitor>,
  );

  if (showActions) {
    columns.push(
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Akcie</span>,
        cell: ({ row }) => (
          <MonitorRowActions
            monitor={row.original}
            compact={compactActions}
          />
        ),
        enableSorting: false,
      }),
    );
  }

  return columns;
}

/** Default static columns for simple tables without selection. */
export const monitorColumns = buildMonitorColumns({
  showActions: true,
  compactActions: true,
});
