"use client";

import { useId, useMemo, useState } from "react";
import type { MonitorCheck, MonitorUptime } from "@/shared/lib/types";
import { formatAgo, formatMs, formatWhen } from "@/shared/lib/format";
import { cn } from "@/lib/utils";

export const HISTORY_WINDOWS = [
  { hours: 24, label: "24h" },
  { hours: 168, label: "7d" },
  { hours: 720, label: "30d" },
] as const;

export function MonitorHistoryPanel({
  checks,
  uptime,
  hours = 24,
  onHoursChange,
  thresholdMs,
  uptimeSloPercent,
  sloWindowHours,
  className,
}: {
  checks: MonitorCheck[];
  uptime: MonitorUptime | null;
  hours?: number;
  onHoursChange?: (hours: number) => void;
  thresholdMs?: number | null;
  uptimeSloPercent?: number | null;
  sloWindowHours?: number | null;
  className?: string;
}) {
  const points = checks.filter((c) => c.status === "UP" || c.status === "DOWN");
  const periodLabel =
    HISTORY_WINDOWS.find((window) => window.hours === hours)?.label ??
    `${uptime?.periodHours ?? hours}h`;
  const uptimeBreached =
    uptime != null &&
    uptimeSloPercent != null &&
    uptime.totalChecks > 0 &&
    uptime.uptimePercent < uptimeSloPercent;

  return (
    <section
      className={cn(
        "animate-rise overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
    >
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <p className="text-[13px] text-muted-foreground">
            Last {periodLabel}
          </p>
          <h2 className="mt-0.5 font-heading text-[22px] font-black tracking-[-0.04em]">
            Check history
          </h2>
        </div>
        <div className="flex flex-wrap items-end gap-5">
          {onHoursChange ? (
            <div
              className="flex gap-3 border-b border-border"
              role="tablist"
              aria-label="History window"
            >
              {HISTORY_WINDOWS.map((window) => (
                <button
                  key={window.hours}
                  type="button"
                  role="tab"
                  aria-selected={hours === window.hours}
                  className={cn(
                    "relative pb-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground",
                    hours === window.hours && "font-medium text-foreground",
                  )}
                  onClick={() => onHoursChange(window.hours)}
                >
                  {window.label}
                  {hours === window.hours ? (
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground"
                    />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
          {uptime ? (
            <dl className="flex flex-wrap gap-5 text-[13px]">
              <div>
                <dt className="text-muted-foreground">Uptime</dt>
                <dd
                  className={cn(
                    "mt-1 font-heading text-lg font-black tabular-nums",
                    uptimeBreached ? "text-warn" : "text-up",
                  )}
                >
                  {uptime.uptimePercent}%
                </dd>
                {uptimeSloPercent != null ? (
                  <p
                    className={cn(
                      "mt-0.5 text-[12px]",
                      uptimeBreached ? "text-warn" : "text-muted-foreground",
                    )}
                  >
                    SLO {uptimeSloPercent}%
                    {sloWindowHours ? ` / ${sloWindowHours}h` : ""}
                    {uptimeBreached ? " · breach" : ""}
                  </p>
                ) : null}
              </div>
              <div>
                <dt className="text-muted-foreground">Checks</dt>
                <dd className="mt-1 font-heading text-lg font-black tabular-nums text-foreground">
                  {uptime.upChecks}/{uptime.totalChecks}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Avg. latency</dt>
                <dd className="mt-1 font-heading text-lg font-black tabular-nums text-foreground">
                  {uptime.avgLatencyMs != null
                    ? formatMs(uptime.avgLatencyMs)
                    : "—"}
                </dd>
              </div>
              {uptime.p95LatencyMs != null ? (
                <div>
                  <dt className="text-muted-foreground">p95 latency</dt>
                  <dd className="mt-1 font-heading text-lg font-black tabular-nums text-foreground">
                    {formatMs(uptime.p95LatencyMs)}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
      </header>

      {points.length === 0 ? (
        <p className="px-5 py-10 text-sm text-muted-foreground">
          No history yet. Once the first check is recorded, the latency chart
          and status timeline will appear here.
        </p>
      ) : (
        <div className="px-5 py-5">
          <LatencyChart
            checks={points}
            periodLabel={periodLabel}
            thresholdMs={thresholdMs}
          />
          <StatusTimeline checks={points} />
        </div>
      )}
    </section>
  );
}

function LatencyChart({
  checks,
  periodLabel,
  thresholdMs,
}: {
  checks: MonitorCheck[];
  periodLabel: string;
  thresholdMs?: number | null;
}) {
  const gradientId = useId().replace(/:/g, "");
  const [active, setActive] = useState<number | null>(null);

  const width = 720;
  const height = 220;
  const pad = { top: 16, right: 16, bottom: 36, left: 52 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const maxLatency = useMemo(() => {
    const peak = Math.max(
      ...checks.map((c) => c.latencyMs),
      thresholdMs && thresholdMs > 0 ? thresholdMs : 0,
      1,
    );
    return niceCeil(peak);
  }, [checks, thresholdMs]);

  const yTicks = useMemo(
    () => [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(maxLatency * t)),
    [maxLatency],
  );

  const coords = useMemo(
    () =>
      checks.map((check, index) => {
        const x =
          checks.length === 1
            ? pad.left + plotW / 2
            : pad.left + (index / (checks.length - 1)) * plotW;
        const y =
          pad.top + plotH - (check.latencyMs / maxLatency) * plotH;
        return { x, y, check, index };
      }),
    [checks, maxLatency, pad.left, pad.top, plotH, plotW],
  );

  const line = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pad.left},${pad.top + plotH} ${line} ${pad.left + plotW},${pad.top + plotH}`;

  const xLabels = useMemo(() => {
    if (checks.length === 0) return [];
    const picks =
      checks.length === 1
        ? [0]
        : checks.length === 2
          ? [0, checks.length - 1]
          : [0, Math.floor((checks.length - 1) / 2), checks.length - 1];
    return [...new Set(picks)].map((index) => ({
      index,
      x: coords[index]?.x ?? pad.left,
      label: shortTime(checks[index]?.checkedAt),
    }));
  }, [checks, coords, pad.left]);

  const thresholdY =
    thresholdMs && thresholdMs > 0 && thresholdMs <= maxLatency
      ? pad.top + plotH - (thresholdMs / maxLatency) * plotH
      : null;

  const activePoint = active != null ? coords[active] : null;

  function nearestIndex(clientX: number, rect: DOMRect) {
    const svgX = ((clientX - rect.left) / rect.width) * width;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const point of coords) {
      const dist = Math.abs(point.x - svgX);
      if (dist < bestDist) {
        bestDist = dist;
        best = point.index;
      }
    }
    return best;
  }

  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-muted-foreground">
          Latency
        </p>
        <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            UP
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-down" />
            DOWN
          </span>
          {thresholdY != null ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-px w-3 border-t border-dashed border-warn" />
              SLO {formatMs(thresholdMs)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[220px] w-full min-w-[360px] touch-pan-y"
          role="img"
          aria-label={`Latency chart for the last ${periodLabel}`}
          onMouseLeave={() => setActive(null)}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setActive(nearestIndex(event.clientX, rect));
          }}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            const rect = event.currentTarget.getBoundingClientRect();
            setActive(nearestIndex(touch.clientX, rect));
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = pad.top + plotH - (tick / maxLatency) * plotH;
            return (
              <g key={tick}>
                <line
                  x1={pad.left}
                  x2={pad.left + plotW}
                  y1={y}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray={tick === 0 ? undefined : "3 5"}
                  strokeOpacity={tick === 0 ? 1 : 0.7}
                />
                <text
                  x={pad.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground font-mono text-[11px]"
                >
                  {tick === 0 ? "0" : formatAxisMs(tick)}
                </text>
              </g>
            );
          })}

          {thresholdY != null ? (
            <g>
              <line
                x1={pad.left}
                x2={pad.left + plotW}
                y1={thresholdY}
                y2={thresholdY}
                stroke="var(--warn)"
                strokeWidth="1.5"
                strokeDasharray="5 4"
                strokeOpacity="0.9"
              />
              <text
                x={pad.left + plotW}
                y={thresholdY - 6}
                textAnchor="end"
                className="fill-warn font-mono text-[10px]"
              >
                SLO {formatAxisMs(thresholdMs!)}
              </text>
            </g>
          ) : null}

          <polygon fill={`url(#${gradientId})`} points={area} />
          <polyline
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.25"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={line}
          />

          {activePoint ? (
            <line
              x1={activePoint.x}
              x2={activePoint.x}
              y1={pad.top}
              y2={pad.top + plotH}
              stroke="var(--foreground)"
              strokeOpacity="0.2"
              strokeDasharray="3 4"
            />
          ) : null}

          {coords.map(({ x, y, check, index }) => {
            const isActive = active === index;
            const down = check.status === "DOWN";
            return (
              <circle
                key={check.id}
                cx={x}
                cy={y}
                r={isActive ? 5 : 3}
                fill={down ? "var(--down)" : "var(--primary)"}
                stroke={isActive ? "var(--background)" : "none"}
                strokeWidth={isActive ? 2 : 0}
                className="transition-[r] duration-150"
              />
            );
          })}

          {xLabels.map((label) => (
            <text
              key={label.index}
              x={label.x}
              y={height - 12}
              textAnchor={
                label.index === 0
                  ? "start"
                  : label.index === checks.length - 1
                    ? "end"
                    : "middle"
              }
              className="fill-muted-foreground font-mono text-[11px]"
            >
              {label.label}
            </text>
          ))}
        </svg>
      </div>

      {activePoint ? (
        <div
          className="pointer-events-none absolute top-10 z-10 min-w-[148px] border border-border bg-background px-3 py-2 shadow-lg"
          style={{
            left: `clamp(0px, calc(${(activePoint.x / width) * 100}% - 74px), calc(100% - 160px))`,
          }}
        >
          <p className="font-mono text-[12px] text-muted-foreground">
            {formatWhen(activePoint.check.checkedAt)}
          </p>
          <p className="mt-1 font-heading text-[18px] font-black tabular-nums tracking-[-0.03em]">
            {formatMs(activePoint.check.latencyMs)}
          </p>
          <p
            className={cn(
              "mt-0.5 text-[12px] font-medium",
              activePoint.check.status === "UP" ? "text-up" : "text-down",
            )}
          >
            {activePoint.check.status}
            {activePoint.check.error
              ? ` · ${activePoint.check.error.slice(0, 48)}`
              : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function StatusTimeline({ checks }: { checks: MonitorCheck[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const downCount = checks.filter((c) => c.status === "DOWN").length;
  const active = hover != null ? checks[hover] : null;

  return (
    <div className="mt-5">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-[12px] text-muted-foreground">
        <p>
          Status timeline · {checks.length} {checks.length === 1 ? "check" : "checks"}
          {downCount > 0 ? (
            <>
              {" "}
              · <span className="text-down">{downCount} DOWN</span>
            </>
          ) : null}
        </p>
        {active ? (
          <p className="font-mono text-foreground">
            {formatAgo(active.checkedAt)} · {active.status} ·{" "}
            {formatMs(active.latencyMs)}
          </p>
        ) : (
          <p>Oldest ← → newest</p>
        )}
      </div>
      <div
        className="flex h-3 overflow-hidden border border-border"
        onMouseLeave={() => setHover(null)}
      >
        {checks.map((check, index) => (
          <button
            key={check.id}
            type="button"
            aria-label={`${check.status} ${formatMs(check.latencyMs)} ${formatWhen(check.checkedAt)}`}
            className={cn(
              "min-w-[2px] flex-1 transition-opacity",
              check.status === "UP" ? "bg-up/85" : "bg-down",
              hover != null && hover !== index && "opacity-35",
            )}
            onMouseEnter={() => setHover(index)}
            onFocus={() => setHover(index)}
          />
        ))}
      </div>
    </div>
  );
}

function niceCeil(value: number): number {
  if (value <= 50) return Math.ceil(value / 10) * 10 || 10;
  if (value <= 200) return Math.ceil(value / 25) * 25;
  if (value <= 1000) return Math.ceil(value / 50) * 50;
  if (value <= 5000) return Math.ceil(value / 250) * 250;
  return Math.ceil(value / 500) * 500;
}

function formatAxisMs(value: number): string {
  if (value >= 1000) {
    const sec = value / 1000;
    return Number.isInteger(sec) ? `${sec}s` : `${sec.toFixed(1)}s`;
  }
  return `${value}`;
}

function shortTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
