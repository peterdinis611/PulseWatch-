"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  PauseCircle,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

  const uptimePercent =
    uptime && uptime.monitorCount > 0
      ? `${uptime.avgUptimePercent.toFixed(1)}%`
      : null;
  const checksLabel =
    uptime && uptime.monitorCount > 0
      ? `${uptime.totalChecks} checks / 24h`
      : "No uptime data yet";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 md:px-5",
        embedded
          ? "border-b border-border bg-card"
          : "animate-rise mb-6 rounded-xl border border-border bg-card",
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-primary">
          <Activity className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-[14px] font-black tracking-[-0.03em]">
            Fleet 24h
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
            {uptimePercent ? (
              <>
                <span className="font-mono tabular-nums text-up">
                  {uptimePercent}
                </span>
                <Separator orientation="vertical" className="h-3" />
                <span className="font-mono tabular-nums">{checksLabel}</span>
              </>
            ) : (
              <span>{checksLabel}</span>
            )}
          </div>
        </div>
        {settings?.fleetAlertsMuted ? (
          <Badge
            variant="outline"
            className="gap-1 border-warn/40 text-warn"
          >
            <PauseCircle className="size-3" />
            Alerts muted
          </Badge>
        ) : null}
        {maintenanceActive ? (
          <Badge
            variant="outline"
            className="gap-1 border-warn/40 text-warn"
          >
            <AlertTriangle className="size-3" />
            Maintenance until{" "}
            {new Date(settings!.maintenanceUntil!).toLocaleString("en-US")}
          </Badge>
        ) : null}
      </div>
      <Button asChild variant="ghost" size="sm" className="gap-1.5">
        <Link href={routes.settings}>
          <Settings className="size-3.5" />
          Settings
        </Link>
      </Button>
    </div>
  );
}
