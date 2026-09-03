export function formatWhen(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("sk-SK", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function formatAgo(value: string | null | undefined): string {
  if (!value) return "nikdy";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Date.now() - date.getTime();
  const sec = Math.max(0, Math.round(diff / 1000));
  if (sec < 10) return "teraz";
  if (sec < 60) return `pred ${sec} s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `pred ${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `pred ${hours} h`;
  return formatWhen(value);
}

export function formatMs(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${Math.round(value)} ms`;
}

export function formatPct(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${(value * 100).toFixed(1)} %`;
}

export function targetOf(monitor: {
  type: string;
  config: {
    url?: string | null;
    host?: string | null;
    port?: number | null;
  };
}): string {
  if (monitor.config.url) return monitor.config.url;
  if (monitor.config.host && monitor.config.port) {
    return `${monitor.config.host}:${monitor.config.port}`;
  }
  if (monitor.config.host) return monitor.config.host;
  return "—";
}

export function clockNow(): string {
  return new Intl.DateTimeFormat("sk-SK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}
