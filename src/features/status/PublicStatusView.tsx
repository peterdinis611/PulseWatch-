"use client";

import { gql, gqlMessage } from "@/shared/graphql/client";
import { PUBLIC_STATUS_PAGE } from "@/shared/graphql/documents";
import { formatAgo, formatWhen } from "@/shared/lib/format";
import { usePoll } from "@/shared/hooks/usePoll";
import type {
  MonitorStatus,
  PublicStatusMonitor,
  PublicStatusPage,
} from "@/shared/lib/types";
import { cn } from "@/lib/utils";

type Tone = "up" | "warn" | "down" | "idle";

const TONE = {
  up: {
    text: "text-up",
    bg: "bg-up",
    border: "border-up/40",
    wash: "from-up/[0.09]",
  },
  warn: {
    text: "text-warn",
    bg: "bg-warn",
    border: "border-warn/40",
    wash: "from-warn/[0.09]",
  },
  down: {
    text: "text-down",
    bg: "bg-down",
    border: "border-down/40",
    wash: "from-down/[0.10]",
  },
  idle: {
    text: "text-muted-foreground",
    bg: "bg-muted-foreground",
    border: "border-border",
    wash: "from-foreground/[0.04]",
  },
} satisfies Record<Tone, Record<string, string>>;

function overallTone(status: string, monitors: PublicStatusMonitor[]): Tone {
  const s = status.toUpperCase();
  if (s.includes("DOWN") || s.includes("OUTAGE") || s.includes("MAJOR")) return "down";
  if (s.includes("DEGRAD") || s.includes("PARTIAL") || s.includes("WARN")) return "warn";
  if (s.includes("OPERATIONAL") || s === "UP" || s === "OK") return "up";
  if (monitors.some((m) => m.lastStatus === "DOWN")) return "down";
  if (monitors.length > 0 && monitors.every((m) => m.lastStatus === "UP")) return "up";
  return "idle";
}

const HEADLINE: Record<Tone, [string, string]> = {
  up: ["All systems operational.", "Everything is running normally."],
  warn: ["Partial disruption.", "Some services are experiencing degraded performance."],
  down: ["Service outage.", "At least one service is currently unavailable."],
  idle: ["Collecting data.", "The first checks are still running."],
};

function monitorTone(status: MonitorStatus): Tone {
  return status === "UP" ? "up" : status === "DOWN" ? "down" : "idle";
}

const STATUS_LABEL: Record<MonitorStatus, string> = {
  UP: "Operational",
  DOWN: "Down",
  UNKNOWN: "Pending",
};

function groupMonitors(monitors: PublicStatusMonitor[]) {
  const map = new Map<string, PublicStatusMonitor[]>();
  for (const m of monitors) {
    const key = m.groupName?.trim() || "";
    map.set(key, [...(map.get(key) ?? []), m]);
  }
  return [...map.entries()].sort(([a], [b]) => {
    if (!a) return 1;
    if (!b) return -1;
    return a.localeCompare(b);
  });
}

export function PublicStatusView({ slug }: { slug: string }) {
  const { data, error, loading } = usePoll<PublicStatusPage>(
    async () => {
      const res = await gql<{ publicStatusPage: PublicStatusPage }>(
        PUBLIC_STATUS_PAGE,
        { slug },
        { auth: false },
      );
      return res.publicStatusPage;
    },
    30_000,
    [slug],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
      />
      <main className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-5 pb-10 pt-6 md:px-8">
        <TopBar updatedAt={data?.updatedAt} />
        {loading && !data ? (
          <p className="mt-24 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Loading status…
          </p>
        ) : error && !data ? (
          <Unavailable message={gqlMessage(error)} />
        ) : data ? (
          <StatusBody page={data} />
        ) : null}
        <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>Refreshes every 30 s</span>
          <span>
            Powered by <span className="text-foreground">PulseWatch</span>
          </span>
        </footer>
      </main>
    </div>
  );
}

function TopBar({ updatedAt }: { updatedAt?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      <span className="flex items-center gap-2 text-foreground">
        <span className="size-2 bg-primary" />
        PulseWatch / Status
      </span>
      <span title={updatedAt ? formatWhen(updatedAt) : undefined}>
        {updatedAt ? `Updated ${formatAgo(updatedAt)}` : "—"}
      </span>
    </div>
  );
}

function Unavailable({ message }: { message: string }) {
  return (
    <section className="animate-rise mt-20 max-w-xl border-l-4 border-down pl-5">
      <h1 className="font-heading text-[clamp(36px,6vw,64px)] font-black tracking-[-0.05em]">
        This page is not available.
      </h1>
      <p className="mt-3 text-[15px] text-muted-foreground">
        This status page doesn't exist or isn't public.
      </p>
      <p className="mt-4 font-mono text-[12px] text-muted-foreground">{message}</p>
    </section>
  );
}

function StatusBody({ page }: { page: PublicStatusPage }) {
  const tone = overallTone(page.overallStatus, page.monitors);
  const t = TONE[tone];
  const [headline, sub] = HEADLINE[tone];
  const groups = groupMonitors(page.monitors);
  const downCount = page.monitors.filter((m) => m.lastStatus === "DOWN").length;
  const upCount = page.monitors.filter((m) => m.lastStatus === "UP").length;
  const measured = page.monitors.filter((m) => m.uptimePercent24h != null);
  const avgUptime = measured.length
    ? measured.reduce((sum, m) => sum + (m.uptimePercent24h ?? 0), 0) /
      measured.length
    : null;

  return (
    <>
      <section
        className={cn(
          "animate-rise relative mt-8 border border-border bg-gradient-to-br to-transparent p-6 md:p-9",
          t.wash,
        )}
      >
        <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", t.bg)} />
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
          {page.title}
        </p>
        <div className="mt-4 flex items-start gap-4 md:gap-6">
          <span className="relative mt-2 flex size-5 shrink-0 md:size-7">
            <span
              className={cn(
                "absolute inset-0 motion-safe:animate-ping opacity-50",
                t.bg,
              )}
            />
            <span className={cn("relative size-full", t.bg)} />
          </span>
          <div>
            <h1
              className={cn(
                "font-heading text-[clamp(40px,8vw,88px)] font-black tracking-[-0.055em]",
                t.text,
              )}
            >
              {headline}
            </h1>
            <p className="mt-3 max-w-[48ch] text-[16px] text-muted-foreground">
              {sub}
            </p>
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-3 border-t border-border pt-5 font-mono">
          <Stat label="Operational" value={`${upCount}/${page.monitors.length}`} />
          <Stat
            label="Down"
            value={String(downCount)}
            tone={downCount > 0 ? "text-down" : undefined}
          />
          <Stat
            label="Uptime 24 h"
            value={avgUptime == null ? "—" : `${avgUptime.toFixed(2)} %`}
          />
        </dl>
      </section>

      {page.monitors.length === 0 ? (
        <p className="mt-10 text-[15px] text-muted-foreground">
          No services are listed on this page yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-9">
          {groups.map(([name, monitors], gi) => (
            <section
              key={name || "_"}
              className="animate-rise"
              style={{ animationDelay: `${120 + gi * 90}ms` }}
            >
              <header className="flex items-baseline justify-between border-b-2 border-foreground pb-2">
                <h2 className="font-heading text-[20px] font-black tracking-[-0.04em]">
                  {name || "Services"}
                </h2>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {monitors.length}
                </span>
              </header>
              <ul>
                {monitors.map((m) => (
                  <MonitorRow key={m.id} monitor={m} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="border-l border-border pl-4 first:border-l-0 first:pl-0">
      <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-[clamp(18px,3vw,28px)] font-medium tabular-nums",
          tone,
        )}
      >
        {value}
      </dd>
    </div>
  );
}

const CELLS = 30;

function UptimeGauge({ pct, tone }: { pct: number | null; tone: Tone }) {
  const filled = pct == null ? 0 : Math.round((Math.min(100, pct) / 100) * CELLS);
  return (
    <div
      className="flex h-5 gap-[2px]"
      role="img"
      aria-label={pct == null ? "No data" : `Uptime ${pct.toFixed(2)} %`}
    >
      {Array.from({ length: CELLS }, (_, i) => (
        <span
          key={i}
          className={cn(
            "w-[5px] flex-1",
            i < filled ? TONE[tone === "idle" ? "up" : tone].bg : "bg-foreground/10",
          )}
        />
      ))}
    </div>
  );
}

function MonitorRow({ monitor }: { monitor: PublicStatusMonitor }) {
  const tone = monitorTone(monitor.lastStatus);
  const t = TONE[tone];
  const pct = monitor.uptimePercent24h;
  const gaugeTone: Tone =
    pct == null ? "idle" : pct >= 99.5 ? "up" : pct >= 95 ? "warn" : "down";

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 gap-y-2 border-b border-border py-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_88px_92px]">
      <div className="min-w-0">
        <p className="flex items-center gap-2.5 font-heading text-[17px] font-medium tracking-[-0.03em]">
          <span className={cn("size-2 shrink-0", t.bg)} />
          <span className="truncate">{monitor.name}</span>
        </p>
        {monitor.tags.length > 0 ? (
          <p className="mt-1 flex flex-wrap gap-x-2 pl-[18px] font-mono text-[11px] text-muted-foreground">
            {monitor.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </p>
        ) : null}
      </div>
      <span
        className={cn(
          "justify-self-end font-mono text-[11px] uppercase tracking-[0.14em] md:order-4",
          t.text,
        )}
        title={
          monitor.lastCheckedAt
            ? `Last checked ${formatAgo(monitor.lastCheckedAt)}`
            : undefined
        }
      >
        {STATUS_LABEL[monitor.lastStatus]}
      </span>
      <div className="col-span-2 flex items-center gap-3 md:order-2 md:col-span-1">
        <div className="min-w-0 flex-1">
          <UptimeGauge pct={pct} tone={gaugeTone} />
        </div>
        <span className="font-mono text-[12px] tabular-nums text-muted-foreground md:hidden">
          {pct == null ? "—" : `${pct.toFixed(2)} %`}
        </span>
      </div>
      <span className="hidden text-right font-mono text-[14px] tabular-nums md:order-3 md:block">
        {pct == null ? "—" : `${pct.toFixed(2)} %`}
      </span>
    </li>
  );
}
