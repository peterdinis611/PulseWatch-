"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Constellation } from "@/features/desk/Constellation";
import { MonitorList } from "@/features/monitors/MonitorList";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/shared/ui/page-header";
import { usePoll } from "@/shared/hooks/usePoll";
import { gql } from "@/shared/graphql/client";
import { DESK_QUERY } from "@/shared/graphql/documents";
import type { FleetUptime, StressTest } from "@/shared/lib/types";
import { useSession } from "@/shared/session";
import { routes } from "@/shared/lib/routes";
import { listPanelClass } from "@/shared/ui/list";
import { cn } from "@/lib/utils";

export default function DeskPage() {
  const router = useRouter();
  const { monitors } = useSession();
  const { data } = usePoll(
    () =>
      gql<{ fleetUptime: FleetUptime; stressTests: StressTest[] }>(DESK_QUERY),
    8000,
  );
  const loads = data?.stressTests ?? [];
  const uptime = data?.fleetUptime;
  const up = monitors.filter((m) => m.lastStatus === "UP").length;
  const down = monitors.filter((m) => m.lastStatus === "DOWN").length;
  const running = loads.filter((t) => t.lastStatus === "RUNNING").length;
  const downMonitors = monitors.filter((m) => m.lastStatus === "DOWN");
  const previewMonitors =
    downMonitors.length > 0 ? downMonitors : monitors.slice(0, 6);
  const uptimeLabel =
    uptime && uptime.monitorCount > 0
      ? `${uptime.avgUptimePercent.toFixed(1)}%`
      : "—";

  return (
    <>
      <PageHeader
        title="Čo je hore"
        lede="Bod v konštelácii je monitor. Klikni naň, alebo prejdi do zoznamu."
        actions={
          <>
            <Button asChild size="lg">
              <Link href={routes.monitorNew}>Nový monitor</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={routes.loadNew}>Nová záťaž</Link>
            </Button>
          </>
        }
      />

      <section className={cn(listPanelClass("animate-rise mb-8"))}>
        <div className="relative overflow-hidden px-1 pt-1 pb-0 md:px-3">
          <Constellation monitors={monitors} />
        </div>

        <div className="grid grid-cols-1 gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          <DeskStat
            label="Hore"
            value={up}
            suffix={`/ ${monitors.length}`}
            tone="up"
            delay={0}
            onClick={() => router.push(routes.monitors)}
          />
          <DeskStat
            label="Dole"
            value={down}
            tone={down ? "down" : "muted"}
            delay={1}
            onClick={() => {
              if (downMonitors[0]) {
                router.push(routes.monitor(downMonitors[0].id));
              } else {
                router.push(routes.monitors);
              }
            }}
          />
          <DeskStat
            label="Uptime 24h"
            value={uptimeLabel}
            tone="up"
            delay={2}
            onClick={() => router.push(routes.monitors)}
          />
          <DeskStat
            label="k6 beží"
            value={running}
            tone="run"
            delay={3}
            onClick={() => router.push(routes.load)}
          />
        </div>
      </section>

      {monitors.length === 0 ? (
        <EmptyState
          title="Zatiaľ ticho"
          action={
            <Button asChild size="lg">
              <Link href={routes.monitorNew}>Pridať monitor</Link>
            </Button>
          }
        >
          Pridaj HTTP monitor na službu, ktorú chceš vidieť v konštelácii.
        </EmptyState>
      ) : (
        <MonitorList
          monitors={previewMonitors}
          variant="preview"
          previewTitle={
            downMonitors.length > 0 ? "Monitory dole" : "Posledné kontroly"
          }
          showAllHref={monitors.length > 6 ? routes.monitors : undefined}
        />
      )}
    </>
  );
}

function DeskStat({
  label,
  value,
  suffix,
  tone,
  delay,
  onClick,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  tone: "up" | "down" | "run" | "muted";
  delay: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "animate-rise bg-card px-5 py-5 text-left transition-colors hover:bg-background",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
      )}
      style={{ animationDelay: `${delay * 60}ms` }}
      onClick={onClick}
    >
      <span className="block text-[13px] text-muted-foreground">{label}</span>
      <b
        className={cn(
          "mt-2 block font-heading text-[clamp(32px,3.5vw,42px)] font-black leading-none tracking-[-0.05em] tabular-nums",
          tone === "up" && "text-up",
          tone === "down" && "text-down",
          tone === "run" && "text-run",
          tone === "muted" && "text-foreground",
        )}
      >
        {value}
        {suffix ? (
          <span className="text-[20px] font-medium text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </b>
    </button>
  );
}
