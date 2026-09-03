import { describe, expect, it } from "vitest";
import {
  blankMonitorForm,
  formToMonitorInput,
  monitorToForm,
} from "@/shared/lib/monitor-input";
import type { Monitor } from "@/shared/lib/types";

function monitor(overrides: Partial<Monitor> = {}): Monitor {
  return {
    id: "m1",
    name: "API",
    type: "HTTP",
    enabled: true,
    intervalSec: 60,
    timeoutMs: 10000,
    lastStatus: "UP",
    lastError: null,
    lastLatencyMs: 12,
    lastCheckedAt: "2026-09-03T12:00:00.000Z",
    createdAt: "2026-09-03T10:00:00.000Z",
    updatedAt: "2026-09-03T12:00:00.000Z",
    config: { url: "https://api.example.sk/health", method: "GET", expectedStatus: 200 },
    ...overrides,
  };
}

describe("blankMonitorForm", () => {
  it("starts as enabled HTTP with defaults", () => {
    const form = blankMonitorForm();
    expect(form.type).toBe("HTTP");
    expect(form.enabled).toBe(true);
    expect(form.httpMethod).toBe("GET");
    expect(form.httpUrl).toBe("https://");
  });
});

describe("formToMonitorInput", () => {
  it("builds HTTP input and skips empty interval", () => {
    const form = blankMonitorForm();
    form.name = "  Web  ";
    form.httpUrl = "https://pulse.sk ";
    form.httpStatus = "204";
    const input = formToMonitorInput(form);
    expect(input).toMatchObject({
      name: "Web",
      type: "HTTP",
      enabled: true,
      http: { url: "https://pulse.sk", method: "GET", expectedStatus: 204 },
    });
    expect(input.intervalSec).toBeUndefined();
  });

  it("includes interval when filled", () => {
    const form = blankMonitorForm();
    form.name = "Web";
    form.intervalSec = "30";
    form.timeoutMs = "5000";
    expect(formToMonitorInput(form)).toMatchObject({
      intervalSec: 30,
      timeoutMs: 5000,
    });
  });

  it("maps redis, tcp and ssl payloads", () => {
    const redis = blankMonitorForm();
    redis.name = "cache";
    redis.type = "REDIS";
    redis.redisUrl = "redis://localhost:6379";
    expect(formToMonitorInput(redis).redis).toEqual({
      url: "redis://localhost:6379",
    });

    const tcp = blankMonitorForm();
    tcp.name = "port";
    tcp.type = "TCP";
    tcp.host = "db.internal";
    tcp.port = "5432";
    expect(formToMonitorInput(tcp).tcp).toEqual({
      host: "db.internal",
      port: 5432,
    });

    const ssl = blankMonitorForm();
    ssl.name = "cert";
    ssl.type = "SSL";
    ssl.host = "pulse.sk";
    ssl.port = "443";
    ssl.minDays = "21";
    ssl.allowUnauthorized = true;
    expect(formToMonitorInput(ssl).ssl).toMatchObject({
      host: "pulse.sk",
      port: 443,
      minDaysUntilExpiry: 21,
      allowUnauthorized: true,
    });
  });
});

describe("monitorToForm", () => {
  it("copies HTTP monitor into the form", () => {
    const form = monitorToForm(monitor());
    expect(form.name).toBe("API");
    expect(form.httpUrl).toBe("https://api.example.sk/health");
    expect(form.httpStatus).toBe("200");
  });

  it("uses redis url and default kafka port", () => {
    const redis = monitorToForm(
      monitor({
        type: "REDIS",
        config: { url: "redis://cache:6379" },
      }),
    );
    expect(redis.redisUrl).toBe("redis://cache:6379");

    const kafka = monitorToForm(
      monitor({
        type: "KAFKA",
        config: { host: "broker" },
      }),
    );
    expect(kafka.port).toBe("9092");
  });
});
