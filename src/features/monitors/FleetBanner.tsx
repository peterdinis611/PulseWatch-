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
      ? `${uptime.totalChecks} checks`
      : "No data yet";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 md:px-5",
        embedded
          ? "border-b border-border/80 bg-muted/20"
          : "animate-rise mb-4 rounded-xl border border-border bg-card",
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-[13px]">
        <Activity className="size-3.5 shrink-0 text-primary" />
        <span className="font-medium text-foreground">Fleet 24h</span>
        {uptimePercent ? (
          <>
            <span className="text-muted-foreground">·</span>
            <span className="font-mono tabular-nums text-up">{uptimePercent}</span>
            <span className="text-muted-foreground">·</span>
            <span className="font-mono tabular-nums text-muted-foreground">
              {checksLabel}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">{checksLabel}</span>
        )}
        {settings?.fleetAlertsMuted ? (
          <Badge
            variant="outline"
            className="h-5 gap-1 border-warn/40 px-1.5 text-[10px] text-warn"
          >
            <PauseCircle className="size-2.5" />
            Muted
          </Badge>
        ) : null}
        {maintenanceActive ? (
          <Badge
            variant="outline"
            className="h-5 gap-1 border-warn/40 px-1.5 text-[10px] text-warn"
          >
            <AlertTriangle className="size-2.5" />
            Maintenance
          </Badge>
        ) : null}
      </div>
      <Button
        asChild
        variant="ghost"
        size="icon-sm"
        aria-label="Fleet settings"
      >
        <Link href={routes.settings}>
          <Settings className="size-3.5" />
        </Link>
      </Button>
    </div>
  );
}
