"use client";

import type { MonitorCheck, MonitorUptime } from "@/shared/lib/types";
import { formatMs } from "@/shared/lib/format";
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
  className,
}: {
  checks: MonitorCheck[];
  uptime: MonitorUptime | null;
  hours?: number;
  onHoursChange?: (hours: number) => void;
  className?: string;
}) {
  const points = checks.filter((c) => c.status === "UP" || c.status === "DOWN");
  const maxLatency = Math.max(...points.map((c) => c.latencyMs), 1);
  const periodLabel =
    HISTORY_WINDOWS.find((window) => window.hours === hours)?.label ??
    `${uptime?.periodHours ?? hours}h`;

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
            Posledných {periodLabel}
          </p>
          <h2 className="mt-0.5 font-heading text-[22px] font-black tracking-[-0.04em]">
            História kontrol
          </h2>
        </div>
        <div className="flex flex-wrap items-end gap-5">
          {onHoursChange ? (
            <div
              className="flex gap-3 border-b border-border"
              role="tablist"
              aria-label="Okno histórie"
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
                <dd className="mt-1 font-heading text-lg font-black tabular-nums text-up">
                  {uptime.uptimePercent}%
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Kontroly</dt>
                <dd className="mt-1 font-heading text-lg font-black tabular-nums text-foreground">
                  {uptime.upChecks}/{uptime.totalChecks}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Priem. latencia</dt>
                <dd className="mt-1 font-heading text-lg font-black tabular-nums text-foreground">
                  {uptime.avgLatencyMs != null
                    ? formatMs(uptime.avgLatencyMs)
                    : "—"}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
      </header>

      {points.length === 0 ? (
        <p className="px-5 py-10 text-sm text-muted-foreground">
          Zatiaľ žiadna história. Po prvej uloženej kontrole sa tu objaví graf
          latencie a stavov.
        </p>
      ) : (
        <div className="px-5 py-5">
          <LatencyChart
            checks={points}
            maxLatency={maxLatency}
            periodLabel={periodLabel}
          />
          <StatusTimeline checks={points} />
        </div>
      )}
    </section>
  );
}

function LatencyChart({
  checks,
  maxLatency,
  periodLabel,
}: {
  checks: MonitorCheck[];
  maxLatency: number;
  periodLabel: string;
}) {
  const width = 640;
  const height = 120;
  const pad = 8;
  const coords = checks.map((check, index) => {
    const x =
      checks.length === 1
        ? width / 2
        : pad + (index / (checks.length - 1)) * (width - pad * 2);
    const y =
      height - pad - (check.latencyMs / maxLatency) * (height - pad * 2);
    return { x, y, check };
  });
  const line = coords.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[120px] w-full min-w-[320px]"
        role="img"
        aria-label={`Graf latencie za posledných ${periodLabel}`}
      >
        <defs>
          <linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          points={line}
        />
        <polygon
          fill="url(#latencyFill)"
          points={`${pad},${height - pad} ${line} ${width - pad},${height - pad}`}
        />
        {coords.map(({ x, y, check }) => (
          <circle
            key={check.id}
            cx={x}
            cy={y}
            r={3}
            fill={check.status === "UP" ? "var(--primary)" : "var(--down)"}
          />
        ))}
      </svg>
    </div>
  );
}

function StatusTimeline({ checks }: { checks: MonitorCheck[] }) {
  return (
    <div className="mt-4 flex h-2 overflow-hidden rounded-sm border border-border">
      {checks.map((check) => (
        <div
          key={check.id}
          title={`${check.status} · ${formatMs(check.latencyMs)}`}
          className={cn(
            "min-w-[2px] flex-1",
            check.status === "UP" ? "bg-up/80" : "bg-down/90",
          )}
        />
      ))}
    </div>
  );
}
