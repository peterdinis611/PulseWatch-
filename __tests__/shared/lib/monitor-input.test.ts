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
    alertsMuted: false,
    intervalSec: 60,
    timeoutMs: 10000,
    lastStatus: "UP",
    lastError: null,
    lastLatencyMs: 12,
    lastCheckedAt: "2026-09-03T12:00:00.000Z",
    createdAt: "2026-09-03T10:00:00.000Z",
    updatedAt: "2026-09-03T12:00:00.000Z",
    failureThreshold: 1,
    consecutiveFailures: 0,
    latencyP95ThresholdMs: null,
    uptimeSloPercent: null,
    sloWindowHours: 24,
    tags: [],
    groupName: null,
    showOnStatusPage: false,
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

describe("new monitor fields", () => {
  it("maps tags, SLO, soft DOWN and HTTP assertions", () => {
    const form = blankMonitorForm();
    form.name = "Web";
    form.failureThreshold = "3";
    form.latencyP95ThresholdMs = "800";
    form.uptimeSloPercent = "99.9";
    form.sloWindowHours = "168";
    form.tags = " prod, eu ,, prod ";
    form.groupName = " Core ";
    form.showOnStatusPage = true;
    form.jsonPath = "data.ok";
    form.jsonExpected = "true";
    const input = formToMonitorInput(form);
    expect(input).toMatchObject({
      failureThreshold: 3,
      latencyP95ThresholdMs: 800,
      uptimeSloPercent: 99.9,
      sloWindowHours: 168,
      tags: ["prod", "eu"],
      groupName: "Core",
      showOnStatusPage: true,
      http: { jsonPath: "data.ok", jsonExpected: "true", bodyContains: null },
    });
  });

  it("clears optional SLO fields with null and round-trips a monitor", () => {
    const form = monitorToForm(
      monitor({ tags: ["a", "b"], groupName: "G", uptimeSloPercent: 99.5 }),
    );
    expect(form.tags).toBe("a, b");
    expect(form.uptimeSloPercent).toBe("99.5");
    form.uptimeSloPercent = "";
    expect(formToMonitorInput(form)).toMatchObject({
      uptimeSloPercent: null,
      latencyP95ThresholdMs: null,
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
