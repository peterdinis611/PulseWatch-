"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  BellOff,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteMonitor,
  duplicateMonitor,
  runMonitorCheck,
  setMonitorEnabled,
  setMonitorMuted,
  toastActionError,
} from "@/features/monitors/monitor-actions";
import { routes } from "@/shared/lib/routes";
import type { Monitor } from "@/shared/lib/types";
import { useSession } from "@/shared/session";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function MonitorRowActions({
  monitor,
  compact = false,
  className,
}: {
  monitor: Monitor;
  compact?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { refresh } = useSession();
  const [busy, setBusy] = useState(false);

  async function wrap(label: string, fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
      await refresh();
    } catch (err) {
      toastActionError(label, err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      data-no-row-nav
      className={cn("flex items-center justify-end gap-1", className)}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {!compact ? (
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          disabled={busy || !monitor.enabled}
          aria-label={`Check ${monitor.name}`}
          onClick={() =>
            void wrap("Check failed.", async () => {
              const next = await runMonitorCheck(monitor.id);
              toast.success(`Check result: ${next.lastStatus}`);
            })
          }
        >
          <RefreshCw className="size-3.5" />
        </Button>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            disabled={busy}
            aria-label={`Actions for ${monitor.name}`}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem
            disabled={!monitor.enabled}
            onClick={() =>
              void wrap("Check failed.", async () => {
                const next = await runMonitorCheck(monitor.id);
                toast.success(`Check result: ${next.lastStatus}`);
              })
            }
          >
            <RefreshCw className="size-4" />
            Check now
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              void wrap("Status change failed.", async () => {
                await setMonitorEnabled(monitor.id, !monitor.enabled);
                toast.success(
                  monitor.enabled ? "Monitor paused." : "Monitor resumed.",
                );
              })
            }
          >
            {monitor.enabled ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
            {monitor.enabled ? "Pause" : "Resume"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              void wrap("Mute update failed.", async () => {
                await setMonitorMuted(monitor.id, !monitor.alertsMuted);
                toast.success(
                  monitor.alertsMuted ? "Alerts unmuted." : "Alerts muted.",
                );
              })
            }
          >
            {monitor.alertsMuted ? (
              <Bell className="size-4" />
            ) : (
              <BellOff className="size-4" />
            )}
            {monitor.alertsMuted ? "Unmute alerts" : "Mute alerts"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              void wrap("Duplicate failed.", async () => {
                const copy = await duplicateMonitor(monitor);
                toast.success("Monitor duplicated.");
                router.push(routes.monitor(copy.id));
              })
            }
          >
            <Copy className="size-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(routes.monitor(monitor.id))}
          >
            <ExternalLink className="size-4" />
            Open
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (!window.confirm(`Delete "${monitor.name}"?`)) return;
              void wrap("Delete failed.", async () => {
                await deleteMonitor(monitor.id);
                toast.success("Monitor deleted.");
              });
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function MonitorFlags({ monitor }: { monitor: Monitor }) {
  const softFail =
    monitor.lastStatus !== "DOWN" &&
    monitor.consecutiveFailures > 0 &&
    monitor.failureThreshold > 1;
  if (monitor.enabled && !monitor.alertsMuted && !softFail) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {!monitor.enabled ? (
        <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px]">
          <Pause className="size-2.5" />
          paused
        </Badge>
      ) : null}
      {monitor.alertsMuted ? (
        <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px]">
          <BellOff className="size-2.5" />
          muted
        </Badge>
      ) : null}
      {softFail ? (
        <Badge
          variant="outline"
          className="h-5 gap-1 border-warn/40 px-1.5 text-[10px] text-warn"
        >
          soft {monitor.consecutiveFailures}/{monitor.failureThreshold}
        </Badge>
      ) : null}
    </div>
  );
}
