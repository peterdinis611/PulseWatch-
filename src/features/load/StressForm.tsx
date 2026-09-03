"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EnumSelect, FormError, FormField, FormRow } from "@/shared/ui/form";
import { STRESS_METHODS } from "@/shared/lib/types";
import {
  blankStressForm,
  formToStressInput,
  type StressFormState,
} from "@/shared/lib/stress-input";

export { blankStressForm, formToStressInput, type StressFormState };

export function StressForm({
  initial,
  submitLabel,
  onSubmit,
  busy,
  error,
}: {
  initial?: StressFormState;
  submitLabel: string;
  onSubmit: (input: Record<string, unknown>) => Promise<void>;
  busy: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<StressFormState>(
    initial ?? blankStressForm(),
  );

  function set<K extends keyof StressFormState>(
    key: K,
    value: StressFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(formToStressInput(form));
  }

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
      <FormField label="HTTP URL">
        <Input
          required
          value={form.url}
          onChange={(e) => set("url", e.target.value)}
          className="h-9"
        />
      </FormField>
      <FormRow>
        <FormField label="Metóda">
          <EnumSelect
            value={form.method}
            onChange={(value) => set("method", value)}
            options={STRESS_METHODS}
          />
        </FormField>
        <FormField label="Očakávaný status">
          <Input
            required
            inputMode="numeric"
            value={form.expectedStatus}
            onChange={(e) => set("expectedStatus", e.target.value)}
            className="h-9"
          />
        </FormField>
      </FormRow>
      <FormRow>
        <FormField label="VUs (1–50)">
          <Input
            required
            inputMode="numeric"
            value={form.vus}
            onChange={(e) => set("vus", e.target.value)}
            className="h-9"
          />
        </FormField>
        <FormField label="Trvanie s (5–120)">
          <Input
            required
            inputMode="numeric"
            value={form.durationSec}
            onChange={(e) => set("durationSec", e.target.value)}
            className="h-9"
          />
        </FormField>
      </FormRow>
      <FormRow>
        <FormField label="p95 ms">
          <Input
            inputMode="numeric"
            value={form.p95Ms}
            onChange={(e) => set("p95Ms", e.target.value)}
            className="h-9"
          />
        </FormField>
        <FormField label="Max fail rate 0–1">
          <Input
            inputMode="decimal"
            value={form.maxFailRate}
            onChange={(e) => set("maxFailRate", e.target.value)}
            placeholder="0.05"
            className="h-9"
          />
        </FormField>
      </FormRow>
      <Button disabled={busy} type="submit" size="lg">
        {busy ? "Ukladám…" : submitLabel}
      </Button>
    </form>
  );
}
