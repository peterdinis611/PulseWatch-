import type { Monitor, StressTest } from "@/shared/lib/types";

export function mockMonitor(overrides: Partial<Monitor> = {}): Monitor {
  return {
    id: "m1",
    name: "Pdf App",
    type: "HTTP",
    enabled: true,
    intervalSec: 60,
    timeoutMs: 10_000,
    lastStatus: "UP",
    lastError: null,
    lastLatencyMs: 1380,
    lastCheckedAt: "2026-09-03T12:00:00.000Z",
    createdAt: "2026-09-03T10:00:00.000Z",
    updatedAt: "2026-09-03T12:00:00.000Z",
    config: {
      url: "https://we-love-pdf-nine.vercel.app/",
      method: "GET",
      expectedStatus: 200,
    },
    ...overrides,
  };
}

export function mockStressTest(overrides: Partial<StressTest> = {}): StressTest {
  return {
    id: "s1",
    name: "Health spike",
    url: "https://api.example.sk/health",
    method: "GET",
    vus: 10,
    durationSec: 30,
    expectedStatus: 200,
    p95Ms: 400,
    maxFailRate: 0.05,
    lastStatus: "IDLE",
    lastRunAt: "2026-09-03T11:00:00.000Z",
    lastSummary: { p95Ms: 320, avgMs: 180, failRate: 0.01 },
    createdAt: "2026-09-03T10:00:00.000Z",
    updatedAt: "2026-09-03T11:00:00.000Z",
    ...overrides,
  };
}
