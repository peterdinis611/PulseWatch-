"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
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
          size="sm"
          variant="ghost"
          disabled={busy || !monitor.enabled}
          onClick={() =>
            void wrap("Kontrola zlyhala.", async () => {
              const next = await runMonitorCheck(monitor.id);
              toast.success(`Kontrola: ${next.lastStatus}`);
            })
          }
        >
          Check
        </Button>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            disabled={busy}
            aria-label={`Akcie pre ${monitor.name}`}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem
            disabled={!monitor.enabled}
            onClick={() =>
              void wrap("Kontrola zlyhala.", async () => {
                const next = await runMonitorCheck(monitor.id);
                toast.success(`Kontrola: ${next.lastStatus}`);
              })
            }
          >
            Check now
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              void wrap("Zmena stavu zlyhala.", async () => {
                await setMonitorEnabled(monitor.id, !monitor.enabled);
                toast.success(monitor.enabled ? "Pozastavený." : "Spustený.");
              })
            }
          >
            {monitor.enabled ? "Pause" : "Resume"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              void wrap("Mute zlyhal.", async () => {
                await setMonitorMuted(monitor.id, !monitor.alertsMuted);
                toast.success(
                  monitor.alertsMuted ? "Alerty zapnuté." : "Alerty stíšené.",
                );
              })
            }
          >
            {monitor.alertsMuted ? "Unmute alerts" : "Mute alerts"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              void wrap("Duplikácia zlyhala.", async () => {
                const copy = await duplicateMonitor(monitor);
                toast.success("Kópia vytvorená.");
                router.push(routes.monitor(copy.id));
              })
            }
          >
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(routes.monitor(monitor.id))}>
            Open
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (!window.confirm(`Zmazať „${monitor.name}“?`)) return;
              void wrap("Zmazanie zlyhalo.", async () => {
                await deleteMonitor(monitor.id);
                toast.success("Monitor zmazaný.");
              });
            }}
          >
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
    <span className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[12px] text-muted-foreground">
      {!monitor.enabled ? <span>paused</span> : null}
      {monitor.alertsMuted ? <span>muted</span> : null}
      {softFail ? (
        <span className="text-warn">
          soft {monitor.consecutiveFailures}/{monitor.failureThreshold}
        </span>
      ) : null}
    </span>
  );
}
