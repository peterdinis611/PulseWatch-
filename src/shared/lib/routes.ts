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

export const DEMO_ACCOUNT = {
  email: "demo@pulsewatch.dev",
  password: "demo1234",
} as const;
