"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckRow,
  EnumSelect,
  FormError,
  FormField,
  FormRow,
} from "@/shared/ui/form";
import { TypeChips } from "@/shared/ui/page-header";
import {
  blankMonitorForm,
  formToMonitorInput,
  type MonitorFormState,
} from "@/shared/lib/monitor-input";
import { DNS_RECORD_TYPES, HTTP_METHODS, MONITOR_TYPES } from "@/shared/lib/types";

export function MonitorForm({
  initial,
  submitLabel,
  onSubmit,
  onQuickCheck,
  busy,
  checking = false,
  error,
  consecutiveFailures,
}: {
  initial?: MonitorFormState;
  submitLabel: string;
  onSubmit: (input: Record<string, unknown>) => Promise<void>;
  onQuickCheck?: (input: Record<string, unknown>) => Promise<void>;
  busy: boolean;
  checking?: boolean;
  error: string | null;
  consecutiveFailures?: number;
}) {
  const [form, setForm] = useState<MonitorFormState>(
    initial ?? blankMonitorForm(),
  );

  function set<K extends keyof MonitorFormState>(
    key: K,
    value: MonitorFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(formToMonitorInput(form));
  }

  const hostTypes = ["TCP", "SSL", "DNS", "SMTP", "KAFKA", "GRPC"];

  return (
    <form onSubmit={handleSubmit}>
      <FormError>{error}</FormError>
      <FormField label="Názov">
        <Input
          required
          maxLength={120}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="h-9"
        />
      </FormField>
      <TypeChips
        options={[...MONITOR_TYPES]}
        value={form.type}
        onChange={(value) => set("type", value as MonitorFormState["type"])}
      />
      <FormRow>
        <FormField label="Interval s">
          <Input
            inputMode="numeric"
            value={form.intervalSec}
            onChange={(e) => set("intervalSec", e.target.value)}
            placeholder="60"
            className="h-9"
          />
        </FormField>
        <FormField label="Timeout ms">
          <Input
            inputMode="numeric"
            value={form.timeoutMs}
            onChange={(e) => set("timeoutMs", e.target.value)}
            placeholder="10000"
            className="h-9"
          />
        </FormField>
      </FormRow>
      <CheckRow
        checked={form.enabled}
        onCheckedChange={(checked) => set("enabled", checked)}
      >
        Monitor je zapnutý
      </CheckRow>
      <CheckRow
        checked={form.alertsMuted}
        onCheckedChange={(checked) => set("alertsMuted", checked)}
      >
        Stíšiť alerty (údržba / deploy)
      </CheckRow>

      {form.type === "HTTP" ? (
        <>
          <FormField label="URL">
            <Input
              required
              value={form.httpUrl}
              onChange={(e) => set("httpUrl", e.target.value)}
              className="h-9"
            />
          </FormField>
          <FormRow>
            <FormField label="Metóda">
              <EnumSelect
                value={form.httpMethod}
                onChange={(value) => set("httpMethod", value)}
                options={HTTP_METHODS}
              />
            </FormField>
            <FormField label="Očakávaný status">
              <Input
                inputMode="numeric"
                value={form.httpStatus}
                onChange={(e) => set("httpStatus", e.target.value)}
                className="h-9"
              />
            </FormField>
          </FormRow>
          <FormSection title="Asercie odpovede" hint="Voliteľné. Prázdne polia sa nekontrolujú.">
            <FormField label="Telo obsahuje">
              <Input
                value={form.bodyContains}
                onChange={(e) => set("bodyContains", e.target.value)}
                placeholder="ok"
                className="h-9"
              />
            </FormField>
            <FormRow>
              <FormField label="JSON path">
                <Input
                  value={form.jsonPath}
                  onChange={(e) => set("jsonPath", e.target.value)}
                  placeholder="data.status"
                  className="h-9"
                />
              </FormField>
              <FormField label="JSON očakávané">
                <Input
                  value={form.jsonExpected}
                  onChange={(e) => set("jsonExpected", e.target.value)}
                  placeholder="healthy"
                  className="h-9"
                />
              </FormField>
            </FormRow>
            <FormRow>
              <FormField label="Hlavička">
                <Input
                  value={form.headerName}
                  onChange={(e) => set("headerName", e.target.value)}
                  placeholder="content-type"
                  className="h-9"
                />
              </FormField>
              <FormField label="Hlavička očakávaná">
                <Input
                  value={form.headerExpected}
                  onChange={(e) => set("headerExpected", e.target.value)}
                  placeholder="application/json"
                  className="h-9"
                />
              </FormField>
            </FormRow>
          </FormSection>
        </>
      ) : null}

      {form.type === "REDIS" ? (
        <FormField label="redis:// URL">
          <Input
            required
            value={form.redisUrl}
            onChange={(e) => set("redisUrl", e.target.value)}
            className="h-9"
          />
        </FormField>
      ) : null}

      {form.type === "DATABASE" ? (
        <FormField label="postgres:// / mysql:// / file:">
          <Input
            required
            value={form.databaseUrl}
            onChange={(e) => set("databaseUrl", e.target.value)}
            className="h-9"
          />
        </FormField>
      ) : null}

      {hostTypes.includes(form.type) ? (
        <>
          <FormField label="Host">
            <Input
              required
              value={form.host}
              onChange={(e) => set("host", e.target.value)}
              className="h-9"
            />
          </FormField>
          {form.type !== "DNS" ? (
            <FormField label="Port">
              <Input
                required
                inputMode="numeric"
                value={form.port}
                onChange={(e) => set("port", e.target.value)}
                className="h-9"
              />
            </FormField>
          ) : null}
        </>
      ) : null}

      {form.type === "SSL" ? (
        <FormRow>
          <FormField label="SNI">
            <Input
              value={form.serverName}
              onChange={(e) => set("serverName", e.target.value)}
              className="h-9"
            />
          </FormField>
          <FormField label="Min. dni do expirácie">
            <Input
              inputMode="numeric"
              value={form.minDays}
              onChange={(e) => set("minDays", e.target.value)}
              className="h-9"
            />
          </FormField>
        </FormRow>
      ) : null}

      {form.type === "DNS" ? (
        <>
          <FormRow>
            <FormField label="Record">
              <EnumSelect
                value={form.recordType}
                onChange={(value) => set("recordType", value)}
                options={DNS_RECORD_TYPES}
              />
            </FormField>
            <FormField label="Nameserver">
              <Input
                value={form.nameserver}
                onChange={(e) => set("nameserver", e.target.value)}
                className="h-9"
              />
            </FormField>
          </FormRow>
          <FormField label="Očakávaná hodnota">
            <Input
              value={form.expectedValue}
              onChange={(e) => set("expectedValue", e.target.value)}
              className="h-9"
            />
          </FormField>
        </>
      ) : null}

      {form.type === "SMTP" ? (
        <>
          <CheckRow
            checked={form.secure}
            onCheckedChange={(checked) => set("secure", checked)}
          >
            Implicit TLS (465)
          </CheckRow>
          <CheckRow
            checked={form.startTls}
            onCheckedChange={(checked) => set("startTls", checked)}
          >
            STARTTLS (587)
          </CheckRow>
        </>
      ) : null}

      {form.type === "KAFKA" ? (
        <>
          <CheckRow
            checked={form.tls}
            onCheckedChange={(checked) => set("tls", checked)}
          >
            TLS
          </CheckRow>
          <FormField label="Topic">
            <Input
              value={form.topic}
              onChange={(e) => set("topic", e.target.value)}
              className="h-9"
            />
          </FormField>
        </>
      ) : null}

      {form.type === "GRPC" ? (
        <>
          <CheckRow
            checked={form.tls}
            onCheckedChange={(checked) => set("tls", checked)}
          >
            TLS
          </CheckRow>
          <FormField label="Health service">
            <Input
              value={form.service}
              onChange={(e) => set("service", e.target.value)}
              className="h-9"
            />
          </FormField>
        </>
      ) : null}

      {(form.type === "SSL" || form.type === "SMTP" || form.type === "GRPC") && (
        <CheckRow
          checked={form.allowUnauthorized}
          onCheckedChange={(checked) => set("allowUnauthorized", checked)}
        >
          Povoliť neoverený certifikát
        </CheckRow>
      )}

      <FormSection
        title="Soft DOWN"
        hint="Monitor prejde na DOWN až po N po sebe idúcich zlyhaniach."
      >
        <FormField
          label="Prah zlyhaní"
          hint={
            consecutiveFailures != null
              ? `Aktuálne po sebe idúcich zlyhaní: ${consecutiveFailures}`
              : undefined
          }
        >
          <Input
            inputMode="numeric"
            value={form.failureThreshold}
            onChange={(e) => set("failureThreshold", e.target.value)}
            placeholder="1"
            className="h-9 max-w-40"
          />
        </FormField>
      </FormSection>

      <FormSection title="SLO" hint="Cieľ latencie a dostupnosti v okne.">
        <FormRow>
          <FormField label="p95 latencia max (ms)">
            <Input
              inputMode="numeric"
              value={form.latencyP95ThresholdMs}
              onChange={(e) => set("latencyP95ThresholdMs", e.target.value)}
              placeholder="—"
              className="h-9"
            />
          </FormField>
          <FormField label="Uptime SLO (%)">
            <Input
              inputMode="decimal"
              value={form.uptimeSloPercent}
              onChange={(e) => set("uptimeSloPercent", e.target.value)}
              placeholder="99.9"
              className="h-9"
            />
          </FormField>
        </FormRow>
        <FormField label="Okno SLO (hodiny)">
          <Input
            inputMode="numeric"
            value={form.sloWindowHours}
            onChange={(e) => set("sloWindowHours", e.target.value)}
            placeholder="24"
            className="h-9 max-w-40"
          />
        </FormField>
      </FormSection>

      <FormSection title="Organizácia" hint="Skupiny a tagy pre filtre a status stránku.">
        <FormRow>
          <FormField label="Skupina">
            <Input
              value={form.groupName}
              onChange={(e) => set("groupName", e.target.value)}
              placeholder="Core API"
              className="h-9"
            />
          </FormField>
          <FormField label="Tagy" hint="Oddeľ čiarkou.">
            <Input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="prod, eu, api"
              className="h-9"
            />
          </FormField>
        </FormRow>
        <CheckRow
          checked={form.showOnStatusPage}
          onCheckedChange={(checked) => set("showOnStatusPage", checked)}
        >
          Zobraziť na verejnej status stránke
        </CheckRow>
      </FormSection>

      <div className="flex flex-wrap gap-2.5">
        {onQuickCheck ? (
          <Button
            disabled={busy || checking}
            type="button"
            variant="outline"
            size="lg"
            onClick={() => onQuickCheck(formToMonitorInput(form))}
          >
            {checking ? "Kontrolujem…" : "Rýchla kontrola"}
          </Button>
        ) : null}
        <Button disabled={busy || checking} type="submit" size="lg">
          {busy ? "Ukladám…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="mb-5 border-t border-border pt-4">
      <legend className="sr-only">{title}</legend>
      <p className="font-heading text-[15px] font-black tracking-[-0.03em]">
        {title}
      </p>
      {hint ? (
        <p className="mb-3 mt-1 text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
      {children}
    </fieldset>
  );
}
