"use client";

import Link from "next/link";
import { usePoll } from "@/shared/hooks/usePoll";
import { gql } from "@/shared/graphql/client";
import { FLEET_UPTIME_QUERY, SETTINGS_QUERY } from "@/shared/graphql/documents";
import type { FleetUptime, MonitorSettings } from "@/shared/lib/types";
import { routes } from "@/shared/lib/routes";
import { cn } from "@/lib/utils";

export function FleetBanner({ embedded = false }: { embedded?: boolean }) {
  const { data: uptimeData } = usePoll(
    () => gql<{ fleetUptime: FleetUptime }>(FLEET_UPTIME_QUERY, { hours: 24 }),
    15000,
  );
  const { data: settingsData } = usePoll(
    () => gql<{ monitorSettings: MonitorSettings }>(SETTINGS_QUERY),
    30000,
  );

  const uptime = uptimeData?.fleetUptime;
  const settings = settingsData?.monitorSettings;
  const maintenanceActive =
    settings?.maintenanceUntil != null &&
    Date.parse(settings.maintenanceUntil) > Date.now();

  const uptimeLabel =
    uptime && uptime.monitorCount > 0
      ? `${uptime.avgUptimePercent.toFixed(1)}% · ${uptime.totalChecks} checks / 24h`
      : "Uptime ešte nie je";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[14px] md:px-5",
        embedded
          ? "border-b border-border bg-card"
          : "animate-rise mb-6 border border-border bg-card",
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-heading text-[15px] font-black tracking-[-0.03em]">
          Fleet 24h
        </span>
        <span className="tabular-nums text-muted-foreground">{uptimeLabel}</span>
        {settings?.fleetAlertsMuted ? (
          <span className="text-warn">Alerty floty sú stíšené</span>
        ) : null}
        {maintenanceActive ? (
          <span className="text-warn">
            Maintenance do{" "}
            {new Date(settings!.maintenanceUntil!).toLocaleString("sk-SK")}
          </span>
        ) : null}
      </div>
      <Link
        href={routes.settings}
        className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Nastavenia →
      </Link>
    </div>
  );
}
