"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckRow,
  FormError,
  FormField,
  FormRow,
} from "@/shared/ui/form";
import { PageHeader } from "@/shared/ui/page-header";
import { gql, gqlMessage, GRAPHQL_HTTP } from "@/shared/graphql/client";
import { toast } from "sonner";
import { SETTINGS_QUERY, UPDATE_SETTINGS } from "@/shared/graphql/documents";
import type { MonitorSettings } from "@/shared/lib/types";
import { monoClass, noteClass, splitClass } from "@/shared/ui/list";

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

  useEffect(() => {
    gql<{ monitorSettings: MonitorSettings }>(SETTINGS_QUERY).then((data) => {
      setSettings(data.monitorSettings);
      setIntervalSec(String(data.monitorSettings.defaultIntervalSec));
      setTimeoutMs(String(data.monitorSettings.defaultTimeoutMs));
      setNotifyOnDown(data.monitorSettings.notifyOnDown);
      setNotifyOnRecover(data.monitorSettings.notifyOnRecover);
      setWebhookUrl(data.monitorSettings.webhookUrl ?? "");
      setSlackWebhookUrl(data.monitorSettings.slackWebhookUrl ?? "");
      setAlertEmail(data.monitorSettings.alertEmail ?? "");
      setFleetAlertsMuted(data.monitorSettings.fleetAlertsMuted);
      setMaintenanceUntil(
        isoToLocalInput(data.monitorSettings.maintenanceUntil),
      );
    });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
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
      setSettings(data.updateMonitorSettings);
      toast.success("Nastavenia uložené.");
    } catch (err) {
      const message = gqlMessage(err);
      setError(message);
      toast.error("Uloženie zlyhalo.", { description: message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        kicker="Nastavenia"
        title="Defaulty floty."
        lede="Interval 10–3600 s, timeout 1000–30000 ms. Nové monitory si ich zoberú, ak ich vo formulári nevyplníš."
      />
      <div className={splitClass()}>
        <form onSubmit={onSubmit}>
          <FormError>{error}</FormError>
          <FormRow>
            <FormField label="Default interval s">
              <Input
                required
                inputMode="numeric"
                value={intervalSec}
                onChange={(e) => setIntervalSec(e.target.value)}
                className="h-9"
              />
            </FormField>
            <FormField label="Default timeout ms">
              <Input
                required
                inputMode="numeric"
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(e.target.value)}
                className="h-9"
              />
            </FormField>
          </FormRow>
          <CheckRow
            checked={notifyOnDown}
            onCheckedChange={setNotifyOnDown}
          >
            Upozornenie pri DOWN
          </CheckRow>
          <CheckRow
            checked={notifyOnRecover}
            onCheckedChange={setNotifyOnRecover}
          >
            Upozornenie pri recovery
          </CheckRow>

          <p className="mb-3 mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
            Údržba floty
          </p>
          <CheckRow
            checked={fleetAlertsMuted}
            onCheckedChange={setFleetAlertsMuted}
          >
            Stíšiť všetky alerty (deploy / maintenance)
          </CheckRow>
          <FormField label="Maintenance do (lokálny čas)">
            <Input
              type="datetime-local"
              value={maintenanceUntil}
              onChange={(e) => setMaintenanceUntil(e.target.value)}
              className="h-9"
            />
          </FormField>

          <p className="mb-3 mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
            Externé kanály
          </p>
          <FormField label="Webhook URL (JSON POST)">
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.example.com/pulsewatch"
              className="h-9"
            />
          </FormField>
          <FormField label="Slack incoming webhook">
            <Input
              value={slackWebhookUrl}
              onChange={(e) => setSlackWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/…"
              className="h-9"
            />
          </FormField>
          <FormField label="E-mail pre alerty">
            <Input
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              placeholder="oncall@example.com"
              className="h-9"
            />
          </FormField>

          <Button disabled={busy} type="submit" size="lg" className="mt-4">
            {busy ? "Ukladám…" : "Uložiť"}
          </Button>
          {settings ? (
            <p className={`${monoClass} mt-4`}>
              Naposledy {new Date(settings.updatedAt).toLocaleString("sk-SK")}
            </p>
          ) : null}
        </form>
        <aside className={noteClass}>
          JWT ostáva v prehliadači. GraphQL ide na {GRAPHQL_HTTP}. E-mail vyžaduje
          SMTP v backend .env (SMTP_HOST, SMTP_USER, SMTP_PASS). Webhook dostane
          JSON s udalosťou, titulkom a telom. Rovnaký alert sa neopakuje častejšie
          ako raz za 5 minút (anti-flap). Per-monitor mute nastavíš v detaile
          monitora.
        </aside>
      </div>
    </>
  );
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
