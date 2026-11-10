export const routes = {
  home: "/",
  login: "/login",
  overview: "/overview",
  monitors: "/monitors",
  monitorNew: "/monitors/new",
  monitor: (id: string) => `/monitors/${id}` as const,
  load: "/load",
  loadNew: "/load/new",
  loadDetail: (id: string) => `/load/${id}` as const,
  alerts: "/alerts",
  settings: "/settings",
} as const;

export type MonitorsQuery = {
  status?: string;
  type?: string;
  enabled?: string;
  muted?: string;
  q?: string;
};

export function monitorsWith(query: MonitorsQuery = {}): string {
  const params = new URLSearchParams();
  if (query.status && query.status !== "ALL") params.set("status", query.status);
  if (query.type && query.type !== "ALL") params.set("type", query.type);
  if (query.enabled && query.enabled !== "ALL") {
    params.set("enabled", query.enabled);
  }
  if (query.muted && query.muted !== "ALL") params.set("muted", query.muted);
  if (query.q?.trim()) params.set("q", query.q.trim());
  const qs = params.toString();
  return qs ? `${routes.monitors}?${qs}` : routes.monitors;
}

export const DEMO_ACCOUNT = {
  email: "demo@pulsewatch.dev",
  password: "demo1234",
} as const;
