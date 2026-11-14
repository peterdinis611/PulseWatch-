"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MonitorForm } from "@/features/monitors/MonitorForm";
import {
  deleteMonitor,
  duplicateMonitor,
  runMonitorCheck,
  setMonitorEnabled,
  setMonitorMuted,
  toastActionError,
} from "@/features/monitors/monitor-actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormError } from "@/shared/ui/form";
import { BackLink } from "@/shared/ui/page-header";
import { QuickCheckPanel } from "@/shared/ui/quick-check-panel";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatAgo, formatMs, targetOf } from "@/shared/lib/format";
import { gql, gqlMessage, subscribeGql } from "@/shared/graphql/client";
import { toast } from "sonner";
import {
  MONITOR_HISTORY_QUERY,
  MONITOR_QUERY,
  MONITOR_UPDATED_SUB,
  NOTIFICATIONS_QUERY,
  QUICK_MONITOR_CHECK,
  UPDATE_MONITOR,
} from "@/shared/graphql/documents";
import { monitorToForm } from "@/shared/lib/monitor-input";
import { routes } from "@/shared/lib/routes";
import type {
  Monitor,
  MonitorCheck,
  MonitorCheckResult,
  MonitorUptime,
  Notification,
} from "@/shared/lib/types";
import { useSession } from "@/shared/session/SessionProvider";
import {
  HISTORY_WINDOWS,
  MonitorHistoryPanel,
} from "@/shared/ui/monitor-history-panel";
import { metaClass, monoClass, noteClass, splitClass } from "@/shared/ui/list";
import { cn } from "@/lib/utils";

export default function MonitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { refresh } = useSession();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickResult, setQuickResult] = useState<MonitorCheckResult | null>(
    null,
  );
  const [history, setHistory] = useState<MonitorCheck[]>([]);
  const [uptime, setUptime] = useState<MonitorUptime | null>(null);
  const [hours, setHours] = useState<(typeof HISTORY_WINDOWS)[number]["hours"]>(
    24,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [relatedAlerts, setRelatedAlerts] = useState<Notification[]>([]);

  const loadHistory = useCallback(
    async (windowHours = hours) => {
      const data = await gql<{
        monitorChecks: MonitorCheck[];
        monitorUptime: MonitorUptime;
      }>(MONITOR_HISTORY_QUERY, { id, hours: windowHours });
      setHistory(data.monitorChecks);
      setUptime(data.monitorUptime);
    },
    [hours, id],
  );

  const loadRelatedAlerts = useCallback(async () => {
    try {
      const data = await gql<{ notifications: Notification[] }>(
        NOTIFICATIONS_QUERY,
      );
      setRelatedAlerts(
        data.notifications.filter((item) => item.monitorId === id).slice(0, 5),
      );
    } catch {
      setRelatedAlerts([]);
    }
  }, [id]);

  useEffect(() => {
    gql<{ monitor: Monitor }>(MONITOR_QUERY, { id }).then((data) =>
      setMonitor(data.monitor),
    );
    void loadRelatedAlerts();
  }, [id, loadRelatedAlerts]);

  useEffect(() => {
    void loadHistory(hours);
  }, [hours, loadHistory]);

  useEffect(() => {
    const stop = subscribeGql<{ monitorUpdated: Monitor }>(
      MONITOR_UPDATED_SUB,
      (data) => {
        if (data.monitorUpdated.id !== id) return;
        setMonitor(data.monitorUpdated);
        void loadHistory(hours);
      },
    );
    return stop;
  }, [id, hours, loadHistory]);

  async function wrap(label: string, fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (err) {
      setError(toastActionError(label, err));
    } finally {
      setBusy(false);
    }
  }

  async function runSavedCheck() {
    await wrap("Check failed.", async () => {
      const next = await runMonitorCheck(id);
      setMonitor(next);
      setQuickResult(null);
      await loadHistory(hours);
      toast.success(`Check result: ${next.lastStatus}`);
    });
  }

  async function runQuickCheck(input: Record<string, unknown>) {
    setChecking(true);
    setError(null);
    try {
      const data = await gql<{ quickMonitorCheck: MonitorCheckResult }>(
        QUICK_MONITOR_CHECK,
        { id, input },
      );
      setQuickResult(data.quickMonitorCheck);
      toast.success(`Quick check: ${data.quickMonitorCheck.status}`, {
        description: formatMs(data.quickMonitorCheck.latencyMs),
      });
    } catch (err) {
      const message = gqlMessage(err);
      setError(message);
      toast.error("Quick check failed.", { description: message });
    } finally {
      setChecking(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await deleteMonitor(id);
      await refresh();
      toast.success("Monitor deleted.");
      router.replace(routes.monitors);
    } catch (err) {
      const message = gqlMessage(err);
      setError(message);
      toast.error("Delete failed.", { description: message });
      setBusy(false);
    }
  }

  if (!monitor) {
    return (
      <div className="grid max-w-md gap-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return (
    <>
      <BackLink href={routes.monitors}>Back to monitors</BackLink>
      <header className="mb-7 flex flex-col items-start justify-between gap-6 md:flex-row">
        <div>
          <p className={monoClass}>{monitor.type}</p>
          <h1 className="mt-1 font-heading text-[clamp(36px,5vw,56px)] leading-[0.95] tracking-[-0.06em]">
            {monitor.name}
          </h1>
          <p className={metaClass}>{targetOf(monitor)}</p>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
            {!monitor.enabled ? <span>paused</span> : null}
            {monitor.alertsMuted ? <span>muted</span> : null}
            {monitor.groupName ? <span>group {monitor.groupName}</span> : null}
            {monitor.tags?.length
              ? monitor.tags.map((tag) => (
                  <span key={tag} className="text-primary">
                    #{tag}
                  </span>
                ))
              : null}
            {monitor.showOnStatusPage ? <span>on status page</span> : null}
            <span>
              {formatMs(monitor.lastLatencyMs)} ·{" "}
              {formatAgo(monitor.lastCheckedAt)}
            </span>
          </div>
          {(monitor.failureThreshold > 1 ||
            monitor.uptimeSloPercent != null ||
            monitor.latencyP95ThresholdMs != null) && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              {monitor.failureThreshold > 1 ? (
                <span>
                  Soft DOWN {monitor.consecutiveFailures}/
                  {monitor.failureThreshold}
                </span>
              ) : null}
              {monitor.uptimeSloPercent != null ? (
                <span>
                  Uptime SLO {monitor.uptimeSloPercent}% /{" "}
                  {monitor.sloWindowHours}h
                </span>
              ) : null}
              {monitor.latencyP95ThresholdMs != null ? (
                <span>p95 SLO {formatMs(monitor.latencyP95ThresholdMs)}</span>
              ) : null}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={monitor.lastStatus} />
          <Button
            disabled={busy || checking || !monitor.enabled}
            type="button"
            onClick={() => void runSavedCheck()}
            size="lg"
          >
            {busy ? "Checking…" : "Check now"}
          </Button>
          <Button
            variant="outline"
            disabled={busy || checking}
            type="button"
            size="lg"
            onClick={() =>
              void wrap("Status change failed.", async () => {
                const next = await setMonitorEnabled(id, !monitor.enabled);
                setMonitor(next);
                toast.success(monitor.enabled ? "Monitor paused." : "Monitor resumed.");
              })
            }
          >
            {monitor.enabled ? "Pause" : "Resume"}
          </Button>
          <Button
            variant="outline"
            disabled={busy || checking}
            type="button"
            size="lg"
            onClick={() =>
              void wrap("Mute update failed.", async () => {
                const next = await setMonitorMuted(id, !monitor.alertsMuted);
                setMonitor(next);
                toast.success(
                  monitor.alertsMuted ? "Alerts unmuted." : "Alerts muted.",
                );
              })
            }
          >
            {monitor.alertsMuted ? "Unmute" : "Mute"}
          </Button>
          <Button
            variant="outline"
            disabled={busy || checking}
            type="button"
            size="lg"
            onClick={() =>
              void wrap("Duplicate failed.", async () => {
                const copy = await duplicateMonitor(monitor);
                toast.success("Monitor duplicated.");
                router.push(routes.monitor(copy.id));
              })
            }
          >
            Duplicate
          </Button>
          {confirmDelete ? (
            <Button
              variant="destructive"
              disabled={busy || checking}
              type="button"
              onClick={() => void remove()}
              size="lg"
            >
              Confirm delete
            </Button>
          ) : (
            <Button
              variant="ghost"
              type="button"
              onClick={() => setConfirmDelete(true)}
              size="lg"
            >
              Delete
            </Button>
          )}
        </div>
      </header>

      {monitor.lastStatus === "DOWN" && monitor.lastError ? (
        <div className="mb-6 border border-down/40 bg-card px-4 py-3 text-[15px]">
          <p className="text-[13px] font-medium text-down">lastError</p>
          <p className="mt-1 text-foreground">{monitor.lastError}</p>
        </div>
      ) : null}

      {monitor.lastStatus !== "DOWN" &&
      monitor.consecutiveFailures > 0 &&
      monitor.failureThreshold > 1 ? (
        <div className="mb-6 border border-warn/40 bg-card px-4 py-3 text-[15px]">
          <p className="text-[13px] font-medium text-warn">Soft DOWN</p>
          <p className="mt-1 text-muted-foreground">
            {monitor.consecutiveFailures} of {monitor.failureThreshold}{" "}
            consecutive failures
            {monitor.lastError ? ` · ${monitor.lastError}` : ""}. An alert is
            sent once the threshold is reached.
          </p>
        </div>
      ) : null}

      {quickResult ? <QuickCheckPanel result={quickResult} draft /> : null}
      <MonitorHistoryPanel
        checks={history}
        uptime={uptime}
        hours={hours}
        thresholdMs={monitor.latencyP95ThresholdMs}
        uptimeSloPercent={monitor.uptimeSloPercent}
        sloWindowHours={monitor.sloWindowHours}
        onHoursChange={(next) => {
          const window = HISTORY_WINDOWS.find((item) => item.hours === next);
          if (window) setHours(window.hours);
        }}
        className="mb-6"
      />

      {relatedAlerts.length > 0 ? (
        <section className="mb-6 border border-border bg-card">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-5 py-4">
            <h2 className="font-heading text-[20px] font-black tracking-[-0.04em]">
              Related alerts
            </h2>
            <Link
              href={routes.alerts}
              className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              All alerts →
            </Link>
          </header>
          <ul>
            {relatedAlerts.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "border-b border-border px-5 py-3 last:border-b-0",
                  !item.readAt && "border-l-2 border-l-primary",
                )}
              >
                <p className="font-medium tracking-[-0.02em]">{item.title}</p>
                <p className="mt-1 text-[14px] text-muted-foreground">
                  {item.body}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {formatAgo(item.createdAt)} · {item.type}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <FormError>{error}</FormError>
      <div className={splitClass()}>
        <MonitorForm
          key={monitor.updatedAt}
          initial={monitorToForm(monitor)}
          submitLabel="Save"
          busy={busy}
          checking={checking}
          error={null}
          consecutiveFailures={monitor.consecutiveFailures}
          onQuickCheck={runQuickCheck}
          onSubmit={async (input) => {
            setBusy(true);
            setError(null);
            try {
              const data = await gql<{ updateMonitor: Monitor }>(
                UPDATE_MONITOR,
                { id, input },
              );
              setMonitor(data.updateMonitor);
              setQuickResult(null);
              await refresh();
              toast.success("Monitor saved.");
            } catch (err) {
              const message = gqlMessage(err);
              setError(message);
              toast.error("Save failed.", { description: message });
            } finally {
              setBusy(false);
            }
          }}
        />
        <aside className={noteClass}>
          Quick check tests the values in the form without saving. Check now
          runs a check against the saved configuration and records the result
          in history.
        </aside>
      </div>
    </>
  );
}
