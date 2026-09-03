export interface StressFormState {
  name: string;
  url: string;
  method: string;
  vus: string;
  durationSec: string;
  expectedStatus: string;
  p95Ms: string;
  maxFailRate: string;
}

export function blankStressForm(): StressFormState {
  return {
    name: "",
    url: "http://localhost:4000/health",
    method: "GET",
    vus: "10",
    durationSec: "30",
    expectedStatus: "200",
    p95Ms: "",
    maxFailRate: "",
  };
}

export function formToStressInput(form: StressFormState) {
  const input: Record<string, unknown> = {
    name: form.name.trim(),
    url: form.url.trim(),
    method: form.method,
    vus: Number(form.vus),
    durationSec: Number(form.durationSec),
    expectedStatus: Number(form.expectedStatus),
  };
  if (form.p95Ms.trim()) input.p95Ms = Number(form.p95Ms);
  if (form.maxFailRate.trim()) input.maxFailRate = Number(form.maxFailRate);
  return input;
}
