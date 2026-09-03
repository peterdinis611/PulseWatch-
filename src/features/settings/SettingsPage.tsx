"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckRow,
  FormError,
  FormField,
  FormOk,
  FormRow,
} from "@/shared/ui/form";
import { PageHeader } from "@/shared/ui/page-header";
import { gql, gqlMessage, GRAPHQL_HTTP } from "@/shared/graphql/client";
import { SETTINGS_QUERY, UPDATE_SETTINGS } from "@/shared/graphql/documents";
import type { MonitorSettings } from "@/shared/lib/types";
import { monoClass, noteClass, splitClass } from "@/shared/ui/list";

export default function SettingsPage() {
  const [settings, setSettings] = useState<MonitorSettings | null>(null);
  const [intervalSec, setIntervalSec] = useState("60");
  const [timeoutMs, setTimeoutMs] = useState("10000");
  const [notifyOnDown, setNotifyOnDown] = useState(true);
  const [notifyOnRecover, setNotifyOnRecover] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    gql<{ monitorSettings: MonitorSettings }>(SETTINGS_QUERY).then((data) => {
      setSettings(data.monitorSettings);
      setIntervalSec(String(data.monitorSettings.defaultIntervalSec));
      setTimeoutMs(String(data.monitorSettings.defaultTimeoutMs));
      setNotifyOnDown(data.monitorSettings.notifyOnDown);
      setNotifyOnRecover(data.monitorSettings.notifyOnRecover);
    });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const data = await gql<{ updateMonitorSettings: MonitorSettings }>(
        UPDATE_SETTINGS,
        {
          input: {
            defaultIntervalSec: Number(intervalSec),
            defaultTimeoutMs: Number(timeoutMs),
            notifyOnDown,
            notifyOnRecover,
          },
        },
      );
      setSettings(data.updateMonitorSettings);
      setSaved(true);
    } catch (err) {
      setError(gqlMessage(err));
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
          <FormOk>{saved ? "Uložené." : null}</FormOk>
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
          <Button disabled={busy} type="submit" size="lg">
            {busy ? "Ukladám…" : "Uložiť"}
          </Button>
          {settings ? (
            <p className={`${monoClass} mt-4`}>
              Naposledy {new Date(settings.updatedAt).toLocaleString("sk-SK")}
            </p>
          ) : null}
        </form>
        <aside className={noteClass}>
          JWT ostáva v prehliadači. GraphQL ide na {GRAPHQL_HTTP}.
        </aside>
      </div>
    </>
  );
}
