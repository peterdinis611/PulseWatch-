"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Constellation } from "@/features/desk/Constellation";
import { MonitorList } from "@/features/monitors/MonitorList";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/shared/ui/page-header";
import { usePoll } from "@/shared/hooks/usePoll";
import { gql } from "@/shared/graphql/client";
import { DESK_QUERY } from "@/shared/graphql/documents";
import type {
  FleetUptime,
  Incident,
  StatusPageSettings,
  StressTest,
} from "@/shared/lib/types";
import { useSession } from "@/shared/session";
import { monitorsWith, routes } from "@/shared/lib/routes";
import { listPanelClass } from "@/shared/ui/list";
import { cn } from "@/lib/utils";

export default function DeskPage() {
  const router = useRouter();
  const { monitors } = useSession();
  const { data } = usePoll(
    () =>
      gql<{
        fleetUptime: FleetUptime;
        stressTests: StressTest[];
        incidents: Incident[];
        myStatusPage: StatusPageSettings;
      }>(DESK_QUERY),
    8000,
  );
  const loads = data?.stressTests ?? [];
  const uptime = data?.fleetUptime;
  const openIncidents = data?.incidents ?? [];
  const statusPage = data?.myStatusPage;
  const up = monitors.filter((m) => m.lastStatus === "UP").length;
  const down = monitors.filter((m) => m.lastStatus === "DOWN").length;
  const softFailing = monitors.filter(
    (m) =>
      m.lastStatus !== "DOWN" &&
      m.consecutiveFailures > 0 &&
      m.failureThreshold > 1,
  ).length;
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

      {(openIncidents.length > 0 || softFailing > 0 || statusPage?.isPublic) && (
        <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 border border-border bg-card px-4 py-3 text-[14px]">
          {openIncidents.length > 0 ? (
            <Link
              href={routes.alerts}
              className="text-down underline-offset-4 hover:underline"
            >
              {openIncidents.length} otvorených incidentov →
            </Link>
          ) : null}
          {softFailing > 0 ? (
            <span className="text-warn">
              Soft DOWN: {softFailing} monitorov pod prahom
            </span>
          ) : null}
          {statusPage?.isPublic ? (
            <Link
              href={routes.status(statusPage.slug)}
              target="_blank"
              className="ml-auto text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Status stránka →
            </Link>
          ) : null}
        </div>
      )}

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
            onClick={() => router.push(monitorsWith({ status: "UP" }))}
          />
          <DeskStat
            label="Dole"
            value={down}
            tone={down ? "down" : "muted"}
            delay={1}
            onClick={() => router.push(monitorsWith({ status: "DOWN" }))}
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
        <Suspense fallback={null}>
          <MonitorList
            monitors={previewMonitors}
            variant="preview"
            previewTitle={
              downMonitors.length > 0 ? "Monitory dole" : "Posledné kontroly"
            }
            showAllHref={
              downMonitors.length > 0
                ? monitorsWith({ status: "DOWN" })
                : monitors.length > 6
                  ? routes.monitors
                  : undefined
            }
          />
        </Suspense>
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
