"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { monoClass } from "@/shared/ui/list";

type DataTableProps<T extends RowData> = {
  columns: ColumnDef<T>[];
  data: T[];
  getRowHref?: (row: T) => string;
  getRowId?: (row: T) => string;
  highlightRowId?: string | null;
  emptyMessage?: string;
  rowClassName?: (row: T, index: number) => string | undefined;
  animateRows?: boolean;
  className?: string;
};

export function DataTable<T extends RowData>({
  columns,
  data,
  getRowHref,
  getRowId,
  highlightRowId,
  emptyMessage = "Žiadne záznamy.",
  rowClassName,
  animateRows = false,
  className,
}: DataTableProps<T>) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const highlightRef = useRef<HTMLTableRowElement | null>(null);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
  });

  useEffect(() => {
    if (!highlightRowId || !highlightRef.current) return;
    highlightRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [highlightRowId, data.length]);

  if (data.length === 0) {
    return (
      <p className={cn(monoClass, "px-6 py-8 text-center")}>{emptyMessage}</p>
    );
  }

  return (
    <Table className={className}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className="border-border/50 hover:bg-transparent"
          >
            {headerGroup.headers.map((header) => {
              const sorted = header.column.getIsSorted();
              const canSort = header.column.getCanSort();

              return (
                <TableHead
                  key={header.id}
                  className="hidden h-auto px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground first:pl-6 last:pr-6 md:table-cell [&:nth-child(2)]:pl-4"
                >
                  {header.isPlaceholder ? null : canSort ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {sorted === "asc" ? (
                        <ArrowUp className="size-3" />
                      ) : sorted === "desc" ? (
                        <ArrowDown className="size-3" />
                      ) : (
                        <ArrowUpDown className="size-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row, index) => {
          const href = getRowHref?.(row.original);
          const highlighted = highlightRowId === row.id;

          return (
            <TableRow
              key={row.id}
              ref={highlighted ? highlightRef : undefined}
              className={cn(
                "group relative border-border/45 transition-[background-color,box-shadow] duration-300",
                href && "cursor-pointer hover:bg-primary/[0.045]",
                animateRows && "animate-rise",
                highlighted &&
                  "bg-primary/[0.1] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--primary)_35%,transparent)] hover:bg-primary/[0.12]",
                rowClassName?.(row.original, index),
              )}
              style={
                animateRows
                  ? { animationDelay: `${Math.min(index, 10) * 40}ms` }
                  : undefined
              }
              tabIndex={href ? 0 : undefined}
              onClick={() => {
                if (href) router.push(href);
              }}
              onKeyDown={(event) => {
                if (href && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  router.push(href);
                }
              }}
            >
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute top-1/2 left-0 h-10 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-transform duration-300",
                  highlighted ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100",
                )}
              />
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="px-6 py-4 align-middle whitespace-normal first:pl-6 last:pr-6 md:whitespace-nowrap [&:nth-child(2)]:pl-4"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
