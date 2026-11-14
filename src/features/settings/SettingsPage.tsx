"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckRow,
  FormError,
  FormField,
  FormRow,
} from "@/shared/ui/form";
import { PageHeader } from "@/shared/ui/page-header";
import { gql, gqlMessage } from "@/shared/graphql/client";
import { toast } from "sonner";
import { SETTINGS_QUERY, UPDATE_SETTINGS } from "@/shared/graphql/documents";
import type { MonitorSettings } from "@/shared/lib/types";
import { routes } from "@/shared/lib/routes";
import { listPanelClass } from "@/shared/ui/list";
import { StatusPageSection } from "@/features/settings/StatusPageSection";
import { cn } from "@/lib/utils";

const INTERVAL_MIN = 10;
const INTERVAL_MAX = 3600;
const TIMEOUT_MIN = 1000;
const TIMEOUT_MAX = 30_000;

export default function SettingsPage() {
  const [settings, setSettings] = useState<MonitorSettings | null>(null);
  const [intervalSec, setIntervalSec] = useState("60");
  const [timeoutMs, setTimeoutMs] = useState("10000");
  const [notifyOnDown, setNotifyOnDown] = useState(true);
  const [notifyOnRecover, setNotifyOnRecover] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [fleetAlertsMuted, setFleetAlertsMuted] = useState(false);
  const [maintenanceUntil, setMaintenanceUntil] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    gql<{ monitorSettings: MonitorSettings }>(SETTINGS_QUERY)
      .then((data) => {
        applySettings(data.monitorSettings);
        setLoaded(true);
      })
      .catch((err) => {
        setError(gqlMessage(err));
        setLoaded(true);
      });
  }, []);

  function applySettings(next: MonitorSettings) {
    setSettings(next);
    setIntervalSec(String(next.defaultIntervalSec));
    setTimeoutMs(String(next.defaultTimeoutMs));
    setNotifyOnDown(next.notifyOnDown);
    setNotifyOnRecover(next.notifyOnRecover);
    setWebhookUrl(next.webhookUrl ?? "");
    setSlackWebhookUrl(next.slackWebhookUrl ?? "");
    setAlertEmail(next.alertEmail ?? "");
    setFleetAlertsMuted(next.fleetAlertsMuted);
    setMaintenanceUntil(isoToLocalInput(next.maintenanceUntil));
  }

  const validationError = useMemo(() => {
    const interval = Number(intervalSec);
    const timeout = Number(timeoutMs);
    if (!Number.isFinite(interval) || interval < INTERVAL_MIN || interval > INTERVAL_MAX) {
      return `Interval must be between ${INTERVAL_MIN} and ${INTERVAL_MAX} s.`;
    }
    if (!Number.isFinite(timeout) || timeout < TIMEOUT_MIN || timeout > TIMEOUT_MAX) {
      return `Timeout must be between ${TIMEOUT_MIN} and ${TIMEOUT_MAX} ms.`;
    }
    if (alertEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alertEmail.trim())) {
      return "Alert email address is not valid.";
    }
    if (webhookUrl.trim() && !isHttpUrl(webhookUrl.trim())) {
      return "Webhook URL must start with http:// or https://.";
    }
    if (slackWebhookUrl.trim() && !isHttpUrl(slackWebhookUrl.trim())) {
      return "Slack webhook must start with http:// or https://.";
    }
    if (maintenanceUntil.trim()) {
      const date = new Date(maintenanceUntil);
      if (Number.isNaN(date.getTime())) {
        return "Maintenance end time is not valid.";
      }
    }
    return null;
  }, [
    intervalSec,
    timeoutMs,
    alertEmail,
    webhookUrl,
    slackWebhookUrl,
    maintenanceUntil,
  ]);

  const maintenanceActive = (() => {
    if (!maintenanceUntil.trim()) return false;
    const ts = new Date(maintenanceUntil).getTime();
    return Number.isFinite(ts) && ts > Date.now();
  })();

  const dirty = useMemo(() => {
    if (!settings) return false;
    return (
      Number(intervalSec) !== settings.defaultIntervalSec ||
      Number(timeoutMs) !== settings.defaultTimeoutMs ||
      notifyOnDown !== settings.notifyOnDown ||
      notifyOnRecover !== settings.notifyOnRecover ||
      (webhookUrl.trim() || null) !== (settings.webhookUrl ?? null) ||
      (slackWebhookUrl.trim() || null) !== (settings.slackWebhookUrl ?? null) ||
      (alertEmail.trim() || null) !== (settings.alertEmail ?? null) ||
      fleetAlertsMuted !== settings.fleetAlertsMuted ||
      localInputToIso(maintenanceUntil) !== (settings.maintenanceUntil ?? null)
    );
  }, [
    settings,
    intervalSec,
    timeoutMs,
    notifyOnDown,
    notifyOnRecover,
    webhookUrl,
    slackWebhookUrl,
    alertEmail,
    fleetAlertsMuted,
    maintenanceUntil,
  ]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (validationError) {
      setError(validationError);
      toast.error("Check your values.", { description: validationError });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const data = await gql<{ updateMonitorSettings: MonitorSettings }>(
        UPDATE_SETTINGS,
        {
          input: {
            defaultIntervalSec: Number(intervalSec),
            defaultTimeoutMs: Number(timeoutMs),
            notifyOnDown,
            notifyOnRecover,
            webhookUrl: webhookUrl.trim() || null,
            slackWebhookUrl: slackWebhookUrl.trim() || null,
            alertEmail: alertEmail.trim() || null,
            fleetAlertsMuted,
            maintenanceUntil: localInputToIso(maintenanceUntil),
          },
        },
      );
      applySettings(data.updateMonitorSettings);
      toast.success("Settings saved.");
    } catch (err) {
      const message = gqlMessage(err);
      setError(message);
      toast.error("Couldn't save settings.", { description: message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        lede="Fleet defaults for new monitors, alert delivery, and the public status page."
        actions={
          settings ? (
            <p className="text-[13px] text-muted-foreground">
              Last updated{" "}
              {new Date(settings.updatedAt).toLocaleString("en-GB")}
            </p>
          ) : null
        }
      />

      {(fleetAlertsMuted || maintenanceActive) && (
        <div className="mb-6 border border-warn/40 bg-card px-4 py-3 text-[14px]">
          <p className="font-medium text-warn">Fleet is in maintenance</p>
          <p className="mt-1 text-muted-foreground">
            {fleetAlertsMuted ? "All alerts are muted. " : null}
            {maintenanceActive
              ? `Maintenance until ${new Date(maintenanceUntil).toLocaleString("en-GB")}.`
              : null}
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-5">
          <FormError>{error ?? (!loaded ? null : validationError && dirty ? validationError : null)}</FormError>

          <SettingsSection
            title="Checks"
            lede="Default interval and timeout for new monitors. Existing monitors are not changed."
          >
            <FormRow>
              <FormField
                label="Interval (s)"
                hint={`${INTERVAL_MIN}–${INTERVAL_MAX}`}
              >
                <Input
                  required
                  inputMode="numeric"
                  min={INTERVAL_MIN}
                  max={INTERVAL_MAX}
                  value={intervalSec}
                  onChange={(e) => setIntervalSec(e.target.value)}
                  className="h-10"
                />
              </FormField>
              <FormField
                label="Timeout (ms)"
                hint={`${TIMEOUT_MIN}–${TIMEOUT_MAX}`}
              >
                <Input
                  required
                  inputMode="numeric"
                  min={TIMEOUT_MIN}
                  max={TIMEOUT_MAX}
                  value={timeoutMs}
                  onChange={(e) => setTimeoutMs(e.target.value)}
                  className="h-10"
                />
              </FormField>
            </FormRow>
          </SettingsSection>

          <SettingsSection
            title="Notifications"
            lede="What your fleet reports. The same alert is not repeated more than once every 5 minutes."
          >
            <CheckRow
              checked={notifyOnDown}
              onCheckedChange={setNotifyOnDown}
              description="When a monitor goes DOWN."
            >
              On DOWN
            </CheckRow>
            <CheckRow
              checked={notifyOnRecover}
              onCheckedChange={setNotifyOnRecover}
              description="When a monitor returns to UP."
            >
              On recovery
            </CheckRow>
          </SettingsSection>

          <SettingsSection
            title="Maintenance"
            lede="Temporarily mute the fleet during a deploy. The banner also appears on the Monitors page."
          >
            <CheckRow
              checked={fleetAlertsMuted}
              onCheckedChange={setFleetAlertsMuted}
              description="Silences all fleet alerts until you turn this off."
            >
              Mute all alerts
            </CheckRow>
            <FormField
              label="Maintenance until"
              hint="Local time. Leave empty for no maintenance window."
            >
              <div className="flex flex-wrap gap-2">
                <Input
                  type="datetime-local"
                  value={maintenanceUntil}
                  onChange={(e) => setMaintenanceUntil(e.target.value)}
                  className="h-10 max-w-xs"
                />
                {maintenanceUntil ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10"
                    onClick={() => setMaintenanceUntil("")}
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
            </FormField>
          </SettingsSection>

          <SettingsSection
            title="Channels"
            lede="Where to send alerts. Email requires SMTP in the backend .env."
          >
            <FormField
              label="Webhook URL"
              hint="JSON POST with event, title, body."
            >
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.example.com/pulsewatch"
                className="h-10"
              />
            </FormField>
            <FormField label="Slack incoming webhook">
              <Input
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/…"
                className="h-10"
              />
            </FormField>
            <FormField label="Alert email">
              <Input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="oncall@example.com"
                className="h-10"
              />
            </FormField>
          </SettingsSection>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={busy || !dirty || Boolean(validationError)}
              type="submit"
              size="lg"
            >
              {busy ? "Saving…" : dirty ? "Save changes" : "No changes"}
            </Button>
            {dirty && !busy ? (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => settings && applySettings(settings)}
              >
                Discard
              </Button>
            ) : null}
          </div>
        </div>

        <aside className="h-fit border border-border bg-card p-5 text-[14px] text-muted-foreground lg:sticky lg:top-24">
          <p className="font-heading text-[15px] font-black tracking-[-0.03em] text-foreground">
            Quick links
          </p>
          <ul className="mt-4 space-y-3">
            <li>
              <Link
                href={routes.monitors}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Monitors →
              </Link>
              <p className="mt-1 text-[13px]">
                Per-monitor mute and pause from the row or detail page.
              </p>
            </li>
            <li>
              <Link
                href={routes.alerts}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Alerts →
              </Link>
              <p className="mt-1 text-[13px]">
                Incidents and notification history.
              </p>
            </li>
            <li>
              <a
                href="#status-page"
                className="text-foreground underline-offset-4 hover:underline"
              >
                Status page →
              </a>
              <p className="mt-1 text-[13px]">
                Public fleet overview, no login required.
              </p>
            </li>
            <li>
              <p className="text-foreground">Anti-flap</p>
              <p className="mt-1 text-[13px]">
                The same alert fires at most once every 5 minutes.
              </p>
            </li>
          </ul>
        </aside>
      </form>

      <div id="status-page" className="mt-5 scroll-mt-24 lg:max-w-[calc(100%-300px)]">
        <StatusPageSection />
      </div>
    </>
  );
}

function SettingsSection({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(listPanelClass(), "p-5 md:p-6")}>
      <header className="mb-5 border-b border-border pb-4">
        <h2 className="font-heading text-[20px] font-black tracking-[-0.04em]">
          {title}
        </h2>
        <p className="mt-1 max-w-[52ch] text-[14px] text-muted-foreground">
          {lede}
        </p>
      </header>
      {children}
    </section>
  );
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function localInputToIso(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
