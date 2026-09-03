export type MonitorType =
  | "HTTP"
  | "REDIS"
  | "DATABASE"
  | "TCP"
  | "SSL"
  | "DNS"
  | "SMTP"
  | "KAFKA"
  | "GRPC";

export type MonitorStatus = "UP" | "DOWN" | "UNKNOWN";

export type StressTestStatus = "IDLE" | "RUNNING" | "PASSED" | "FAILED";

export type NotificationType = "INFO" | "ALERT" | "WARNING" | "SUCCESS";

export type DnsRecordType = "A" | "AAAA" | "CNAME" | "MX" | "NS" | "TXT";

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AuthPayload {
  accessToken: string;
  user: User;
}

export interface HealthPayload {
  status: string;
  database: string;
  timestamp: string;
}

export interface MonitorConfig {
  url?: string | null;
  method?: string | null;
  expectedStatus?: number | null;
  host?: string | null;
  port?: number | null;
  tls?: boolean | null;
  secure?: boolean | null;
  startTls?: boolean | null;
  allowUnauthorized?: boolean | null;
  serverName?: string | null;
  minDaysUntilExpiry?: number | null;
  recordType?: string | null;
  nameserver?: string | null;
  expectedValue?: string | null;
  service?: string | null;
  topic?: string | null;
}

export interface Monitor {
  id: string;
  name: string;
  type: MonitorType;
  enabled: boolean;
  intervalSec: number;
  timeoutMs: number;
  lastStatus: MonitorStatus;
  lastError: string | null;
  lastLatencyMs: number | null;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
  config: MonitorConfig;
}

export interface MonitorSettings {
  defaultIntervalSec: number;
  defaultTimeoutMs: number;
  notifyOnDown: boolean;
  notifyOnRecover: boolean;
  updatedAt: string;
}

export interface MonitorCheckResult {
  status: MonitorStatus;
  error: string | null;
  latencyMs: number;
  checkedAt: string;
}

export interface StressTestSummary {
  httpReqs?: number | null;
  avgMs?: number | null;
  p95Ms?: number | null;
  failRate?: number | null;
  checksPassed?: number | null;
  checksFailed?: number | null;
}

export interface StressTest {
  id: string;
  name: string;
  url: string;
  method: string;
  vus: number;
  durationSec: number;
  expectedStatus: number;
  p95Ms: number | null;
  maxFailRate: number | null;
  lastStatus: StressTestStatus;
  lastError: string | null;
  lastSummary: StressTestSummary | null;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StressTestRun {
  id: string;
  stressTestId: string;
  status: StressTestStatus;
  error: string | null;
  summary: StressTestSummary | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export const MONITOR_TYPES: MonitorType[] = [
  "HTTP",
  "REDIS",
  "DATABASE",
  "TCP",
  "SSL",
  "DNS",
  "SMTP",
  "KAFKA",
  "GRPC",
];

export const HTTP_METHODS = ["GET", "HEAD", "POST", "PUT"] as const;
export const STRESS_METHODS = [
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
] as const;
export const DNS_RECORD_TYPES: DnsRecordType[] = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "NS",
  "TXT",
];
