"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatAgo, formatMs, targetOf } from "@/shared/lib/format";
import { routes } from "@/shared/lib/routes";
import type { Incident, Monitor } from "@/shared/lib/types";
import { listPanelClass, monoClass } from "@/shared/ui/list";
import { cn } from "@/lib/utils";

export function Widget({
  title,
  action,
  children,
  className,
  bodyClassName,
  toolbar,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  toolbar?: ReactNode;
}) {
  return (
    <section className={cn(listPanelClass("min-w-0 max-w-full"), className)}>
      <header className="flex items-end justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
        <h2 className="min-w-0 font-heading text-[16px] font-black tracking-[-0.03em]">
          {title}
        </h2>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {action}
          {toolbar}
        </div>
      </header>
      <div className={cn("min-w-0 px-4 py-4 md:px-5", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

export type FleetHealth = "operational" | "degraded" | "outage" | "empty";

export function fleetHealthOf(input: {
  monitorCount: number;
  down: number;
  softFailing: number;
  openIncidents: number;
}): FleetHealth {
  if (input.monitorCount === 0) return "empty";
  if (input.down > 0 || input.openIncidents > 0) return "outage";
  if (input.softFailing > 0) return "degraded";
  return "operational";
}

const HEALTH_COPY: Record<
  FleetHealth,
  { label: string; detail: string; tone: string }
> = {
  operational: {
    label: "All systems operational",
    detail: "Every monitor is UP. No open incidents.",
    tone: "border-up/40 text-up",
  },
  degraded: {
    label: "Degraded",
    detail: "Soft DOWN in progress — thresholds not breached yet.",
    tone: "border-warn/40 text-warn",
  },
  outage: {
    label: "Active outage",
    detail: "At least one monitor is DOWN or an incident is open.",
    tone: "border-down/40 text-down",
  },
  empty: {
    label: "No monitors yet",
    detail: "Add your first probe to start the fleet.",
    tone: "border-border text-muted-foreground",
  },
};

export function HealthBanner({
  health,
  uptimeLabel,
  checksLabel,
}: {
  health: FleetHealth;
  uptimeLabel: string;
  checksLabel: string;
}) {
  const copy = HEALTH_COPY[health];
  return (
    <div
      className={cn(
        "animate-rise flex flex-wrap items-center justify-between gap-3 border bg-card px-4 py-3.5 md:px-5",
        copy.tone.split(" ")[0],
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          Fleet health
        </p>
        <p
          className={cn(
            "mt-0.5 font-heading text-[clamp(20px,2.2vw,26px)] font-black tracking-[-0.04em]",
            copy.tone.split(" ").slice(1).join(" "),
          )}
        >
          {copy.label}
        </p>
        <p className="mt-0.5 max-w-[52ch] text-[13px] text-muted-foreground">
          {copy.detail}
        </p>
      </div>
      <dl className="flex flex-wrap gap-5 text-[12px]">
        <div>
          <dt className="text-muted-foreground">Uptime 24h</dt>
          <dd className="mt-0.5 font-heading text-[18px] font-black tabular-nums tracking-[-0.03em]">
            {uptimeLabel}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Checks 24h</dt>
          <dd className="mt-0.5 font-heading text-[18px] font-black tabular-nums tracking-[-0.03em]">
            {checksLabel}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function MetricStrip({
  items,
}: {
  items: Array<{
    label: string;
    value: string | number;
    suffix?: string;
    tone?: "up" | "down" | "warn" | "run" | "muted";
    onClick?: () => void;
  }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3 xl:grid-cols-6">
      {items.map((item, index) => {
        const Comp = item.onClick ? "button" : "div";
        return (
          <Comp
            key={item.label}
            type={item.onClick ? "button" : undefined}
            onClick={item.onClick}
            className={cn(
              "animate-rise bg-card px-3.5 py-3.5 text-left",
              item.onClick &&
                "transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
            )}
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <span className="block text-[11px] text-muted-foreground">
              {item.label}
            </span>
            <b
              className={cn(
                "mt-1.5 block font-heading text-[24px] font-black leading-none tracking-[-0.04em] tabular-nums",
                item.tone === "up" && "text-up",
                item.tone === "down" && "text-down",
                item.tone === "warn" && "text-warn",
                item.tone === "run" && "text-run",
                (!item.tone || item.tone === "muted") && "text-foreground",
              )}
            >
              {item.value}
              {item.suffix ? (
                <span className="text-[14px] font-medium text-muted-foreground">
                  {item.suffix}
                </span>
              ) : null}
            </b>
          </Comp>
        );
      })}
    </div>
  );
}

export function IncidentsWidget({
  incidents,
  title = "Open incidents",
  toolbar,
}: {
  incidents: Incident[];
  title?: string;
  toolbar?: ReactNode;
}) {
  return (
    <Widget
      title={title}
      toolbar={toolbar}
      action={
        <Link
          href={routes.alerts}
          className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          All alerts →
        </Link>
      }
      bodyClassName="px-0 py-0"
    >
      {incidents.length === 0 ? (
        <p className="px-4 py-5 text-[14px] text-muted-foreground md:px-5">
          No open incidents. Recoveries land here when something fails.
        </p>
      ) : (
        <ul>
          {incidents.slice(0, 5).map((incident) => (
            <li
              key={incident.id}
              className="border-b border-border last:border-b-0"
            >
              <Link
                href={routes.monitor(incident.monitorId)}
                className="block px-4 py-3 transition-colors hover:bg-foreground/[0.03] md:px-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {incident.title}
                    </p>
                    <p className="mt-1 truncate text-[13px] text-muted-foreground">
                      {incident.monitorName}
                      {incident.lastError
                        ? ` · ${incident.lastError.slice(0, 60)}`
                        : ""}
                    </p>
                  </div>
                  <span className={cn(monoClass, "shrink-0 text-[12px]")}>
                    {formatAgo(incident.openedAt)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Widget>
  );
}

export function AttentionWidget({
  monitors,
  title = "Needs attention",
  toolbar,
}: {
  monitors: Monitor[];
  title?: string;
  toolbar?: ReactNode;
}) {
  const items = monitors
    .filter((m) => {
      const softFail =
        m.lastStatus !== "DOWN" &&
        m.consecutiveFailures > 0 &&
        m.failureThreshold > 1;
      return (
        m.lastStatus === "DOWN" || !m.enabled || m.alertsMuted || softFail
      );
    })
    .slice(0, 6);

  return (
    <Widget
      title={title}
      toolbar={toolbar}
      action={
        <Link
          href={routes.monitors}
          className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Fleet →
        </Link>
      }
      bodyClassName="px-0 py-0"
    >
      {items.length === 0 ? (
        <p className="px-4 py-5 text-[14px] text-muted-foreground md:px-5">
          Nothing paused, muted, or soft-failing.
        </p>
      ) : (
        <ul>
          {items.map((monitor) => {
            const reasons: string[] = [];
            if (monitor.lastStatus === "DOWN") reasons.push("DOWN");
            if (
              monitor.consecutiveFailures > 0 &&
              monitor.failureThreshold > 1 &&
              monitor.lastStatus !== "DOWN"
            ) {
              reasons.push(
                `soft ${monitor.consecutiveFailures}/${monitor.failureThreshold}`,
              );
            }
            if (!monitor.enabled) reasons.push("paused");
            if (monitor.alertsMuted) reasons.push("muted");

            return (
              <li
                key={monitor.id}
                className="border-b border-border last:border-b-0"
              >
                <Link
                  href={routes.monitor(monitor.id)}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.03] md:px-5"
                >
                  <StatusBadge value={monitor.lastStatus} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{monitor.name}</p>
                    <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                      {reasons.join(" · ")}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Widget>
  );
}

export function LatencyWidget({
  monitors,
  title = "Slowest right now",
  toolbar,
}: {
  monitors: Monitor[];
  title?: string;
  toolbar?: ReactNode;
}) {
  const withLatency = monitors
    .filter((m) => m.lastLatencyMs != null)
    .slice()
    .sort((a, b) => (b.lastLatencyMs ?? 0) - (a.lastLatencyMs ?? 0))
    .slice(0, 5);
  const max = Math.max(...withLatency.map((m) => m.lastLatencyMs ?? 1), 1);

  return (
    <Widget title={title} toolbar={toolbar} bodyClassName="space-y-3">
      {withLatency.length === 0 ? (
        <p className="text-[14px] text-muted-foreground">
          Latency appears after the first successful check.
        </p>
      ) : (
        withLatency.map((monitor) => {
          const ms = monitor.lastLatencyMs ?? 0;
          const width = Math.max(4, Math.round((ms / max) * 100));
          return (
            <Link
              key={monitor.id}
              href={routes.monitor(monitor.id)}
              className="block transition-opacity hover:opacity-80"
            >
              <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
                <span className="truncate font-medium">{monitor.name}</span>
                <span className={cn(monoClass, "shrink-0")}>{formatMs(ms)}</span>
              </div>
              <div className="h-1.5 overflow-hidden bg-border">
                <div
                  className={cn(
                    "h-full transition-[width] duration-500",
                    monitor.lastStatus === "DOWN" ? "bg-down" : "bg-primary",
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
              <p className="mt-1 truncate text-[12px] text-muted-foreground">
                {targetOf(monitor)}
              </p>
            </Link>
          );
        })
      )}
    </Widget>
  );
}

export function ShortcutsWidget({
  statusHref,
  statusPublic,
  title = "Shortcuts",
  toolbar,
}: {
  statusHref: string | null;
  statusPublic: boolean;
  title?: string;
  toolbar?: ReactNode;
}) {
  return (
    <Widget title={title} toolbar={toolbar}>
      <ul className="space-y-3 text-[14px]">
        <li>
          <Link
            href={routes.monitorNew}
            className="text-foreground underline-offset-4 hover:underline"
          >
            New monitor →
          </Link>
        </li>
        <li>
          <Link
            href={routes.loadNew}
            className="text-foreground underline-offset-4 hover:underline"
          >
            New load test →
          </Link>
        </li>
        <li>
          <Link
            href={routes.settings}
            className="text-foreground underline-offset-4 hover:underline"
          >
            Fleet defaults →
          </Link>
        </li>
        {statusHref ? (
          <li>
            <Link
              href={statusHref}
              target={statusPublic ? "_blank" : undefined}
              className="text-foreground underline-offset-4 hover:underline"
            >
              {statusPublic ? "Public status page ↗" : "Status page settings →"}
            </Link>
          </li>
        ) : null}
      </ul>
    </Widget>
  );
}

export function LoadRunsWidget({
  tests,
  title = "Recent load tests",
  toolbar,
}: {
  tests: Array<{
    id: string;
    name: string;
    lastStatus: string;
    updatedAt: string;
  }>;
  title?: string;
  toolbar?: ReactNode;
}) {
  const recent = tests.slice(0, 6);
  return (
    <Widget
      title={title}
      toolbar={toolbar}
      action={
        <Link
          href={routes.load}
          className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          All runs →
        </Link>
      }
      bodyClassName="px-0 py-0"
    >
      {recent.length === 0 ? (
        <p className="px-4 py-5 text-[14px] text-muted-foreground md:px-5">
          No load tests yet. Start a k6 scenario to fill this list.
        </p>
      ) : (
        <ul>
          {recent.map((test) => (
            <li
              key={test.id}
              className="border-b border-border last:border-b-0"
            >
              <Link
                href={routes.loadDetail(test.id)}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.03] md:px-5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{test.name}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {formatAgo(test.updatedAt)}
                  </p>
                </div>
                <StatusBadge value={test.lastStatus} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Widget>
  );
}
