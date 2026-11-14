"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FleetBanner } from "@/features/monitors/FleetBanner";
import { buildMonitorColumns } from "@/features/monitors/monitor-columns";
import {
  deleteMonitor,
  runBulk,
  runMonitorCheck,
  setMonitorEnabled,
  setMonitorMuted,
} from "@/features/monitors/monitor-actions";
import type { Monitor, MonitorStatus, MonitorType } from "@/shared/lib/types";
import { MONITOR_TYPES } from "@/shared/lib/types";
import { monitorsWith, routes } from "@/shared/lib/routes";
import { DataTable } from "@/shared/ui/data-table";
import {
  listPanelClass,
  listToolbarClass,
  monoClass,
} from "@/shared/ui/list";
import { useSession } from "@/shared/session";
import { cn } from "@/lib/utils";
import { targetOf } from "@/shared/lib/format";

const STATUS_FILTERS = ["ALL", "UP", "DOWN", "UNKNOWN"] as const;
const TYPE_FILTERS = ["ALL", ...MONITOR_TYPES] as const;
const ENABLED_FILTERS = ["ALL", "RUNNING", "PAUSED"] as const;
const MUTED_FILTERS = ["ALL", "MUTED", "LIVE"] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];
type TypeFilter = (typeof TYPE_FILTERS)[number];
type EnabledFilter = (typeof ENABLED_FILTERS)[number];
type MutedFilter = (typeof MUTED_FILTERS)[number];

function parseStatus(value: string | null): StatusFilter {
  return STATUS_FILTERS.includes(value as StatusFilter)
    ? (value as StatusFilter)
    : "ALL";
}

function parseType(value: string | null): TypeFilter {
  return TYPE_FILTERS.includes(value as TypeFilter)
    ? (value as TypeFilter)
    : "ALL";
}

function parseEnabled(value: string | null): EnabledFilter {
  const raw = value?.toUpperCase();
  if (raw === "ON" || raw === "RUNNING") return "RUNNING";
  if (raw === "OFF" || raw === "PAUSED") return "PAUSED";
  return ENABLED_FILTERS.includes(raw as EnabledFilter)
    ? (raw as EnabledFilter)
    : "ALL";
}

function parseMuted(value: string | null): MutedFilter {
  const raw = value?.toUpperCase();
  if (raw === "ON" || raw === "MUTED") return "MUTED";
  if (raw === "OFF" || raw === "LIVE") return "LIVE";
  return MUTED_FILTERS.includes(raw as MutedFilter)
    ? (raw as MutedFilter)
    : "ALL";
}

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useSession();
  const syncUrl = filterable || variant === "fleet";

  const [query, setQuery] = useState(() =>
    syncUrl ? (searchParams.get("q") ?? "") : "",
  );
  const [status, setStatus] = useState<StatusFilter>(() =>
    syncUrl ? parseStatus(searchParams.get("status")) : "ALL",
  );
  const [monitorType, setMonitorType] = useState<TypeFilter>(() =>
    syncUrl ? parseType(searchParams.get("type")) : "ALL",
  );
  const [enabledFilter, setEnabledFilter] = useState<EnabledFilter>(() =>
    syncUrl ? parseEnabled(searchParams.get("enabled")) : "ALL",
  );
  const [mutedFilter, setMutedFilter] = useState<MutedFilter>(() =>
    syncUrl ? parseMuted(searchParams.get("muted")) : "ALL",
  );
  const [groupFilter, setGroupFilter] = useState(() =>
    syncUrl ? (searchParams.get("group") ?? "ALL") : "ALL",
  );
  const [tagFilter, setTagFilter] = useState(() =>
    syncUrl ? (searchParams.get("tag") ?? "") : "",
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const paramsKey = syncUrl ? searchParams.toString() : "";

  useEffect(() => {
    if (!syncUrl) return;
    setStatus(parseStatus(searchParams.get("status")));
    setMonitorType(parseType(searchParams.get("type")));
    setEnabledFilter(parseEnabled(searchParams.get("enabled")));
    setMutedFilter(parseMuted(searchParams.get("muted")));
    setQuery(searchParams.get("q") ?? "");
    setGroupFilter(searchParams.get("group") ?? "ALL");
    setTagFilter(searchParams.get("tag") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync only when the query string changes
  }, [paramsKey, syncUrl]);

  const writeUrl = useCallback(
    (next: {
      status?: StatusFilter;
      type?: TypeFilter;
      enabled?: EnabledFilter;
      muted?: MutedFilter;
      q?: string;
      group?: string;
      tag?: string;
    }) => {
      if (!syncUrl) return;
      router.replace(
        monitorsWith({
          status: next.status ?? status,
          type: next.type ?? monitorType,
          enabled: next.enabled ?? enabledFilter,
          muted: next.muted ?? mutedFilter,
          q: next.q ?? query,
          group: next.group ?? groupFilter,
          tag: next.tag ?? tagFilter,
        }),
      );
    },
    [
      syncUrl,
      router,
      status,
      monitorType,
      enabledFilter,
      mutedFilter,
      query,
      groupFilter,
      tagFilter,
    ],
  );

  const groups = useMemo(
    () =>
      [
        ...new Set(
          monitors.map((m) => m.groupName).filter((g): g is string => Boolean(g)),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [monitors],
  );
  const tags = useMemo(
    () =>
      [...new Set(monitors.flatMap((m) => m.tags ?? []))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [monitors],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tagQ = tagFilter.trim().toLowerCase();
    return monitors.filter((monitor) => {
      const hay =
        `${monitor.name} ${monitor.type} ${targetOf(monitor)} ${monitor.groupName ?? ""} ${(monitor.tags ?? []).join(" ")}`.toLowerCase();
      const matchGroup =
        groupFilter === "ALL" || monitor.groupName === groupFilter;
      const matchTag =
        !tagQ || (monitor.tags ?? []).some((t) => t.toLowerCase() === tagQ);
      const matchQuery = !q || hay.includes(q);
      const matchStatus =
        status === "ALL" || monitor.lastStatus === (status as MonitorStatus);
      const matchType =
        monitorType === "ALL" || monitor.type === (monitorType as MonitorType);
      const matchEnabled =
        enabledFilter === "ALL" ||
        (enabledFilter === "RUNNING" ? monitor.enabled : !monitor.enabled);
      const matchMuted =
        mutedFilter === "ALL" ||
        (mutedFilter === "MUTED" ? monitor.alertsMuted : !monitor.alertsMuted);
      return (
        matchQuery &&
        matchStatus &&
        matchType &&
        matchEnabled &&
        matchMuted &&
        matchGroup &&
        matchTag
      );
    });
  }, [
    monitors,
    query,
    status,
    monitorType,
    enabledFilter,
    mutedFilter,
    groupFilter,
    tagFilter,
  ]);

  const counts = useMemo(
    () => ({
      up: monitors.filter((m) => m.lastStatus === "UP").length,
      down: monitors.filter((m) => m.lastStatus === "DOWN").length,
      unknown: monitors.filter((m) => m.lastStatus === "UNKNOWN").length,
      paused: monitors.filter((m) => !m.enabled).length,
      muted: monitors.filter((m) => m.alertsMuted).length,
    }),
    [monitors],
  );

  const visibleIds = useMemo(() => visible.map((m) => m.id), [visible]);
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someSelected =
    !allSelected && visibleIds.some((id) => selectedIds.has(id));

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => visibleIds.includes(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [visibleIds]);

  const selectable = syncUrl;
  const columns = useMemo(
    () =>
      buildMonitorColumns({
        selectable,
        selectedIds,
        allSelected,
        someSelected,
        showActions: true,
        compactActions: variant === "preview",
        onToggle: (id, next) => {
          setSelectedIds((prev) => {
            const copy = new Set(prev);
            if (next) copy.add(id);
            else copy.delete(id);
            return copy;
          });
        },
        onToggleAll: (next) => {
          setSelectedIds(next ? new Set(visibleIds) : new Set());
        },
      }),
    [
      selectable,
      selectedIds,
      allSelected,
      someSelected,
      variant,
      visibleIds,
    ],
  );

  const selectedList = [...selectedIds];
  const filtersActive =
    status !== "ALL" ||
    monitorType !== "ALL" ||
    enabledFilter !== "ALL" ||
    mutedFilter !== "ALL" ||
    groupFilter !== "ALL" ||
    tagFilter.trim().length > 0 ||
    query.trim().length > 0;

  function clearFilters() {
    setQuery("");
    setStatus("ALL");
    setMonitorType("ALL");
    setEnabledFilter("ALL");
    setMutedFilter("ALL");
    setGroupFilter("ALL");
    setTagFilter("");
    writeUrl({
      group: "ALL",
      tag: "",
      status: "ALL",
      type: "ALL",
      enabled: "ALL",
      muted: "ALL",
      q: "",
    });
  }

  async function withBulk(fn: () => Promise<void>) {
    setBulkBusy(true);
    try {
      await fn();
      await refresh();
      setSelectedIds(new Set());
    } finally {
      setBulkBusy(false);
    }
  }

  const table = (
    <DataTable
      columns={columns}
      data={visible}
      getRowHref={(monitor) => routes.monitor(monitor.id)}
      getRowId={(monitor) => monitor.id}
      highlightRowId={highlightId}
      animateRows={variant !== "plain"}
      emptyMessage={
        filterable || variant === "fleet"
          ? "Nič nesedí na filter."
          : "Žiadne monitory."
      }
      emptyAction={
        filtersActive ? (
          <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
            Vyčistiť filtre
          </Button>
        ) : null
      }
      rowClassName={(monitor) => (monitor.enabled ? undefined : "opacity-55")}
    />
  );

  if (filterable || variant === "fleet") {
    return (
      <section className={listPanelClass()}>
        <FleetBanner embedded />
        <div className={listToolbarClass()}>
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative block min-w-[min(100%,280px)] flex-1">
              <span className="sr-only">Hľadať monitor</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-10 border-border bg-background pl-9"
                value={query}
                onChange={(event) => {
                  const value = event.target.value;
                  setQuery(value);
                  writeUrl({ q: value });
                }}
                placeholder="Hľadať názov, typ, URL…"
              />
            </label>
            <p className={cn(monoClass, "shrink-0")}>
              {visible.length} / {monitors.length}
            </p>
            {filtersActive ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-2 text-muted-foreground"
                onClick={clearFilters}
              >
                <X className="size-3.5" />
                Vyčistiť
              </Button>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <StatusFacets
              value={status}
              counts={counts}
              total={monitors.length}
              onChange={(next) => {
                setStatus(next);
                writeUrl({ status: next });
              }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                label="Typ"
                value={monitorType}
                onChange={(value) => {
                  const next = value as TypeFilter;
                  setMonitorType(next);
                  writeUrl({ type: next });
                }}
                options={TYPE_FILTERS.map((option) => ({
                  value: option,
                  label: option === "ALL" ? "Všetky typy" : option,
                }))}
              />
              <FilterSelect
                label="Beh"
                value={enabledFilter}
                onChange={(value) => {
                  const next = value as EnabledFilter;
                  setEnabledFilter(next);
                  writeUrl({ enabled: next });
                }}
                options={[
                  { value: "ALL", label: "Všetky" },
                  {
                    value: "RUNNING",
                    label: `Running (${monitors.length - counts.paused})`,
                  },
                  { value: "PAUSED", label: `Paused (${counts.paused})` },
                ]}
              />
              <FilterSelect
                label="Alerty"
                value={mutedFilter}
                onChange={(value) => {
                  const next = value as MutedFilter;
                  setMutedFilter(next);
                  writeUrl({ muted: next });
                }}
                options={[
                  { value: "ALL", label: "Všetky" },
                  { value: "LIVE", label: `Live (${monitors.length - counts.muted})` },
                  { value: "MUTED", label: `Muted (${counts.muted})` },
                ]}
              />
              {groups.length > 0 ? (
                <FilterSelect
                  label="Skupina"
                  value={groupFilter}
                  onChange={(value) => {
                    setGroupFilter(value);
                    writeUrl({ group: value });
                  }}
                  options={[
                    { value: "ALL", label: "Všetky skupiny" },
                    ...groups.map((g) => ({ value: g, label: g })),
                  ]}
                />
              ) : null}
              {tags.length > 0 ? (
                <FilterSelect
                  label="Tag"
                  value={tagFilter}
                  onChange={(value) => {
                    setTagFilter(value);
                    writeUrl({ tag: value });
                  }}
                  options={[
                    { value: "", label: "Všetky tagy" },
                    ...tags.map((t) => ({ value: t, label: `#${t}` })),
                  ]}
                />
              ) : null}
            </div>
          </div>
        </div>
        {table}
        {selectedList.length > 0 ? (
          <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-sm md:px-5">
            <p className="mr-2 text-[13px] text-muted-foreground">
              Vybrané: {selectedList.length}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={bulkBusy}
              onClick={() =>
                void withBulk(() =>
                  runBulk(selectedList, runMonitorCheck, {
                    ok: "Kontroly hotové.",
                    fail: "Niektoré kontroly zlyhali.",
                  }).then(() => undefined),
                )
              }
            >
              Check
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={bulkBusy}
              onClick={() =>
                void withBulk(() =>
                  runBulk(selectedList, (id) => setMonitorEnabled(id, false), {
                    ok: "Pozastavené.",
                    fail: "Pause zlyhal.",
                  }).then(() => undefined),
                )
              }
            >
              Pause
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={bulkBusy}
              onClick={() =>
                void withBulk(() =>
                  runBulk(selectedList, (id) => setMonitorEnabled(id, true), {
                    ok: "Spustené.",
                    fail: "Resume zlyhal.",
                  }).then(() => undefined),
                )
              }
            >
              Resume
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={bulkBusy}
              onClick={() =>
                void withBulk(() =>
                  runBulk(selectedList, (id) => setMonitorMuted(id, true), {
                    ok: "Alerty stíšené.",
                    fail: "Mute zlyhal.",
                  }).then(() => undefined),
                )
              }
            >
              Mute
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={bulkBusy}
              onClick={() => {
                if (
                  !window.confirm(`Zmazať ${selectedList.length} monitorov?`)
                ) {
                  return;
                }
                void withBulk(() =>
                  runBulk(selectedList, deleteMonitor, {
                    ok: "Zmazané.",
                    fail: "Zmazanie zlyhalo.",
                  }).then(() => undefined),
                );
              }}
            >
              Delete
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={bulkBusy}
              onClick={() => setSelectedIds(new Set())}
            >
              Zrušiť výber
            </Button>
          </div>
        ) : null}
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
              href={showAllHref ?? routes.monitors}
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

function StatusFacets({
  value,
  counts,
  total,
  onChange,
}: {
  value: StatusFilter;
  counts: { up: number; down: number; unknown: number };
  total: number;
  onChange: (value: StatusFilter) => void;
}) {
  const facets: { id: StatusFilter; label: string; count: number; tone?: string }[] = [
    { id: "ALL", label: "All", count: total },
    { id: "UP", label: "UP", count: counts.up, tone: "text-up" },
    { id: "DOWN", label: "DOWN", count: counts.down, tone: "text-down" },
    { id: "UNKNOWN", label: "?", count: counts.unknown },
  ];

  return (
    <div role="radiogroup" aria-label="Stav" className="flex flex-wrap items-center gap-1">
      <span className="mr-1 text-[13px] font-medium text-muted-foreground">Stav</span>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next as StatusFilter);
        }}
        className="flex flex-wrap gap-1"
        variant="outline"
      >
        {facets.map((facet) => (
          <ToggleGroupItem
            key={facet.id}
            value={facet.id}
            aria-label={facet.id}
            className="h-8 gap-1.5 rounded-md px-2.5 text-[12px] tracking-wide data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
          >
            <span>{facet.label}</span>
            <span
              className={cn(
                "tabular-nums opacity-75",
                value !== facet.id && facet.tone,
              )}
            >
              {facet.count}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = `filter-${label.toLowerCase()}`;
  return (
    <label className="grid gap-1.5 text-[13px] text-muted-foreground">
      <span className="font-medium">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-[9.5rem] border border-border bg-background px-2.5 text-[13px] text-foreground outline-none transition-colors hover:border-foreground/40 focus-visible:border-foreground"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
