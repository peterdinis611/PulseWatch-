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
  busy,
  error,
}: {
  initial?: MonitorFormState;
  submitLabel: string;
  onSubmit: (input: Record<string, unknown>) => Promise<void>;
  busy: boolean;
  error: string | null;
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

      <Button disabled={busy} type="submit" size="lg">
        {busy ? "Ukladám…" : submitLabel}
      </Button>
    </form>
  );
}
