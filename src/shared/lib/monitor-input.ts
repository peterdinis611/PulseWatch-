import type { Monitor, MonitorConfig, MonitorType } from "./types";

export interface MonitorFormState {
  name: string;
  type: MonitorType;
  intervalSec: string;
  timeoutMs: string;
  enabled: boolean;
  httpUrl: string;
  httpMethod: string;
  httpStatus: string;
  redisUrl: string;
  databaseUrl: string;
  host: string;
  port: string;
  tls: boolean;
  secure: boolean;
  startTls: boolean;
  allowUnauthorized: boolean;
  serverName: string;
  minDays: string;
  recordType: string;
  nameserver: string;
  expectedValue: string;
  service: string;
  topic: string;
}

const empty: MonitorFormState = {
  name: "",
  type: "HTTP",
  intervalSec: "",
  timeoutMs: "",
  enabled: true,
  httpUrl: "https://",
  httpMethod: "GET",
  httpStatus: "200",
  redisUrl: "redis://localhost:6379",
  databaseUrl: "postgres://localhost:5432/app",
  host: "localhost",
  port: "443",
  tls: false,
  secure: false,
  startTls: false,
  allowUnauthorized: false,
  serverName: "",
  minDays: "14",
  recordType: "A",
  nameserver: "",
  expectedValue: "",
  service: "",
  topic: "",
};

function str(value: string | null | undefined, fallback = "") {
  return value ?? fallback;
}

function num(value: number | null | undefined, fallback = "") {
  return value == null ? fallback : String(value);
}

export function blankMonitorForm(): MonitorFormState {
  return { ...empty };
}

export function monitorToForm(monitor: Monitor): MonitorFormState {
  const c: MonitorConfig = monitor.config ?? {};
  const type = monitor.type;
  return {
    ...empty,
    name: monitor.name,
    type,
    intervalSec: String(monitor.intervalSec),
    timeoutMs: String(monitor.timeoutMs),
    enabled: monitor.enabled,
    httpUrl: str(c.url, empty.httpUrl),
    httpMethod: str(c.method, "GET"),
    httpStatus: num(c.expectedStatus, "200"),
    redisUrl: type === "REDIS" ? str(c.url, empty.redisUrl) : empty.redisUrl,
    databaseUrl:
      type === "DATABASE" ? str(c.url, empty.databaseUrl) : empty.databaseUrl,
    host: str(c.host, empty.host),
    port: num(c.port, defaultPort(type)),
    tls: Boolean(c.tls),
    secure: Boolean(c.secure),
    startTls: Boolean(c.startTls),
    allowUnauthorized: Boolean(c.allowUnauthorized),
    serverName: str(c.serverName),
    minDays: num(c.minDaysUntilExpiry, "14"),
    recordType: str(c.recordType, "A"),
    nameserver: str(c.nameserver),
    expectedValue: str(c.expectedValue),
    service: str(c.service),
    topic: str(c.topic),
  };
}

function defaultPort(type: MonitorType): string {
  if (type === "SSL") return "443";
  if (type === "SMTP") return "587";
  if (type === "KAFKA") return "9092";
  if (type === "GRPC") return "50051";
  if (type === "TCP") return "80";
  return "443";
}

function optionalInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

function optionalStr(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function formToMonitorInput(form: MonitorFormState) {
  const input: Record<string, unknown> = {
    name: form.name.trim(),
    type: form.type,
    enabled: form.enabled,
  };
  const interval = optionalInt(form.intervalSec);
  const timeout = optionalInt(form.timeoutMs);
  if (interval != null) input.intervalSec = interval;
  if (timeout != null) input.timeoutMs = timeout;

  switch (form.type) {
    case "HTTP":
      input.http = {
        url: form.httpUrl.trim(),
        method: form.httpMethod,
        expectedStatus: optionalInt(form.httpStatus),
      };
      break;
    case "REDIS":
      input.redis = { url: form.redisUrl.trim() };
      break;
    case "DATABASE":
      input.database = { url: form.databaseUrl.trim() };
      break;
    case "TCP":
      input.tcp = { host: form.host.trim(), port: Number(form.port) };
      break;
    case "SSL":
      input.ssl = {
        host: form.host.trim(),
        port: Number(form.port),
        serverName: optionalStr(form.serverName),
        minDaysUntilExpiry: optionalInt(form.minDays),
        allowUnauthorized: form.allowUnauthorized,
      };
      break;
    case "DNS":
      input.dns = {
        host: form.host.trim(),
        recordType: form.recordType,
        nameserver: optionalStr(form.nameserver),
        expectedValue: optionalStr(form.expectedValue),
      };
      break;
    case "SMTP":
      input.smtp = {
        host: form.host.trim(),
        port: Number(form.port),
        secure: form.secure,
        startTls: form.startTls,
        allowUnauthorized: form.allowUnauthorized,
      };
      break;
    case "KAFKA":
      input.kafka = {
        host: form.host.trim(),
        port: Number(form.port),
        tls: form.tls,
        topic: optionalStr(form.topic),
      };
      break;
    case "GRPC":
      input.grpc = {
        host: form.host.trim(),
        port: Number(form.port),
        tls: form.tls,
        service: optionalStr(form.service),
        allowUnauthorized: form.allowUnauthorized,
      };
      break;
  }

  return input;
}
