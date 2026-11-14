"use client";

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MonitorFlags,
  MonitorRowActions,
} from "@/features/monitors/MonitorRowActions";
import { formatAgo, formatMs, targetOf } from "@/shared/lib/format";
import type { Monitor } from "@/shared/lib/types";
import { metaClass, monoClass, nameClass } from "@/shared/ui/list";
import { StatusBadge } from "@/shared/ui/status-badge";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<Monitor>();

function visibleTags(monitor: Monitor) {
  const typeKey = monitor.type.toLowerCase();
  const unique = [...new Set(monitor.tags ?? [])].filter(
    (tag) => tag.toLowerCase() !== typeKey,
  );
  return {
    shown: unique.slice(0, 2),
    more: Math.max(0, unique.length - 2),
  };
}

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
              checked={
                allSelected ? true : someSelected ? "indeterminate" : false
              }
              onCheckedChange={(value) => onToggleAll?.(value === true)}
              aria-label="Select all"
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
              aria-label={`Select ${row.original.name}`}
            />
          </div>
        ),
        enableSorting: false,
        size: 40,
      }),
    );
  }

  columns.push(
    columnHelper.accessor("lastStatus", {
      header: "Status",
      cell: ({ getValue }) => <StatusBadge value={getValue()} />,
      enableSorting: true,
      size: 100,
    }) as ColumnDef<Monitor>,
    columnHelper.accessor("name", {
      header: "Monitor",
      cell: ({ row }) => {
        const { shown, more } = visibleTags(row.original);
        return (
          <div className="min-w-0 max-w-[320px]">
            <div className="flex min-w-0 items-center gap-2">
              <span className={cn(nameClass, "truncate")}>
                {row.original.name}
              </span>
              <span className="shrink-0 font-mono text-[10px] tracking-wide text-primary/80 uppercase">
                {row.original.type}
              </span>
            </div>
            {(row.original.groupName || shown.length > 0 || more > 0) && (
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1">
                {row.original.groupName ? (
                  <span className="truncate text-[12px] text-muted-foreground">
                    {row.original.groupName}
                  </span>
                ) : null}
                {shown.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="h-5 rounded-md px-1.5 text-[10px] font-normal text-muted-foreground"
                  >
                    #{tag}
                  </Badge>
                ))}
                {more > 0 ? (
                  <span className="text-[11px] text-muted-foreground">
                    +{more}
                  </span>
                ) : null}
              </div>
            )}
            <MonitorFlags monitor={row.original} />
          </div>
        );
      },
      enableSorting: true,
    }) as ColumnDef<Monitor>,
    columnHelper.display({
      id: "target",
      header: "Target",
      cell: ({ row }) => (
        <div
          className={cn(metaClass, "max-w-[240px] text-[13px]")}
          title={targetOf(row.original)}
        >
          {targetOf(row.original)}
        </div>
      ),
    }),
    columnHelper.accessor("lastLatencyMs", {
      header: "Latency",
      cell: ({ getValue }) => (
        <span className={cn(monoClass, "tabular-nums")}>
          {formatMs(getValue())}
        </span>
      ),
      enableSorting: true,
      sortingFn: (a, b) =>
        (a.original.lastLatencyMs ?? -1) - (b.original.lastLatencyMs ?? -1),
      size: 88,
    }) as ColumnDef<Monitor>,
    columnHelper.accessor("lastCheckedAt", {
      header: "Checked",
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
      size: 104,
    }) as ColumnDef<Monitor>,
  );

  if (showActions) {
    columns.push(
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <MonitorRowActions
            monitor={row.original}
            compact={compactActions}
          />
        ),
        enableSorting: false,
        size: 96,
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
