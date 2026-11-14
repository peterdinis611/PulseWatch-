export type DeskColumn = "full" | "main" | "side";

export type DeskWidgetType =
  | "health"
  | "metrics"
  | "fleet_map"
  | "latest_checks"
  | "incidents"
  | "attention"
  | "latency"
  | "shortcuts"
  | "load_runs";

export type DeskWidgetInstance = {
  id: string;
  type: DeskWidgetType;
  title?: string;
  column: DeskColumn;
};

export type DeskLayout = {
  version: 1;
  widgets: DeskWidgetInstance[];
};

export type DeskWidgetDefinition = {
  type: DeskWidgetType;
  defaultTitle: string;
  description: string;
  defaultColumn: DeskColumn;
  /** Only one instance of this type may sit on the board. */
  unique: boolean;
};

export const DESK_WIDGET_CATALOG: Record<DeskWidgetType, DeskWidgetDefinition> =
  {
    health: {
      type: "health",
      defaultTitle: "Fleet health",
      description: "Operational status with 24h uptime and check volume.",
      defaultColumn: "full",
      unique: true,
    },
    metrics: {
      type: "metrics",
      defaultTitle: "Metric strip",
      description: "Up, Down, Soft DOWN, Unknown, incidents, and k6 running.",
      defaultColumn: "full",
      unique: true,
    },
    fleet_map: {
      type: "fleet_map",
      defaultTitle: "Fleet map",
      description: "Constellation of monitors and their live status.",
      defaultColumn: "main",
      unique: true,
    },
    latest_checks: {
      type: "latest_checks",
      defaultTitle: "Latest checks",
      description: "Recent probes, prioritized by outages when anything is DOWN.",
      defaultColumn: "main",
      unique: true,
    },
    incidents: {
      type: "incidents",
      defaultTitle: "Open incidents",
      description: "Active outages that still need a resolution.",
      defaultColumn: "side",
      unique: true,
    },
    attention: {
      type: "attention",
      defaultTitle: "Needs attention",
      description: "Paused, muted, DOWN, or soft-failing monitors.",
      defaultColumn: "side",
      unique: true,
    },
    latency: {
      type: "latency",
      defaultTitle: "Slowest right now",
      description: "Highest latency monitors from the latest successful checks.",
      defaultColumn: "side",
      unique: true,
    },
    shortcuts: {
      type: "shortcuts",
      defaultTitle: "Shortcuts",
      description: "Quick links into monitors, load tests, and status.",
      defaultColumn: "side",
      unique: true,
    },
    load_runs: {
      type: "load_runs",
      defaultTitle: "Recent load tests",
      description: "Latest k6 scenarios and their run status.",
      defaultColumn: "side",
      unique: true,
    },
  };

export const DESK_LAYOUT_STORAGE_KEY = "pw.desk.layout.v1";

export function defaultDeskLayout(): DeskLayout {
  return {
    version: 1,
    widgets: [
      { id: "w-health", type: "health", column: "full" },
      { id: "w-metrics", type: "metrics", column: "full" },
      { id: "w-fleet", type: "fleet_map", column: "main" },
      { id: "w-checks", type: "latest_checks", column: "main" },
      { id: "w-incidents", type: "incidents", column: "side" },
      { id: "w-attention", type: "attention", column: "side" },
      { id: "w-latency", type: "latency", column: "side" },
      { id: "w-shortcuts", type: "shortcuts", column: "side" },
    ],
  };
}

function newWidgetId(type: DeskWidgetType) {
  return `w-${type}-${Math.random().toString(36).slice(2, 9)}`;
}

export function widgetTitle(
  instance: DeskWidgetInstance,
  fallback?: string,
): string {
  return (
    instance.title?.trim() ||
    fallback ||
    DESK_WIDGET_CATALOG[instance.type].defaultTitle
  );
}

export function parseDeskLayout(raw: unknown): DeskLayout | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<DeskLayout>;
  if (value.version !== 1 || !Array.isArray(value.widgets)) return null;

  const widgets: DeskWidgetInstance[] = [];
  const seen = new Set<DeskWidgetType>();

  for (const item of value.widgets) {
    if (!item || typeof item !== "object") continue;
    const type = item.type as DeskWidgetType;
    if (!(type in DESK_WIDGET_CATALOG)) continue;
    const column = item.column as DeskColumn;
    if (column !== "full" && column !== "main" && column !== "side") continue;
    if (DESK_WIDGET_CATALOG[type].unique && seen.has(type)) continue;
    seen.add(type);
    widgets.push({
      id:
        typeof item.id === "string" && item.id.trim()
          ? item.id
          : newWidgetId(type),
      type,
      column,
      title:
        typeof item.title === "string" && item.title.trim()
          ? item.title.trim()
          : undefined,
    });
  }

  return widgets.length > 0 ? { version: 1, widgets } : null;
}

export function loadDeskLayout(): DeskLayout {
  if (typeof window === "undefined") return defaultDeskLayout();
  try {
    const raw = window.localStorage.getItem(DESK_LAYOUT_STORAGE_KEY);
    if (!raw) return defaultDeskLayout();
    return parseDeskLayout(JSON.parse(raw)) ?? defaultDeskLayout();
  } catch {
    return defaultDeskLayout();
  }
}

export function saveDeskLayout(layout: DeskLayout) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DESK_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
}

export function addWidgetToLayout(
  layout: DeskLayout,
  type: DeskWidgetType,
  column?: DeskColumn,
): DeskLayout {
  const def = DESK_WIDGET_CATALOG[type];
  if (def.unique && layout.widgets.some((w) => w.type === type)) {
    return layout;
  }
  const targetColumn = column ?? def.defaultColumn;
  const next: DeskWidgetInstance = {
    id: newWidgetId(type),
    type,
    column: targetColumn,
  };

  const widgets = [...layout.widgets];
  const lastSameColumn = [...widgets]
    .map((w, index) => ({ w, index }))
    .reverse()
    .find((entry) => entry.w.column === targetColumn);

  if (lastSameColumn) {
    widgets.splice(lastSameColumn.index + 1, 0, next);
  } else if (targetColumn === "full") {
    widgets.unshift(next);
  } else {
    widgets.push(next);
  }

  return { ...layout, widgets };
}

export function removeWidgetFromLayout(
  layout: DeskLayout,
  id: string,
): DeskLayout {
  return {
    ...layout,
    widgets: layout.widgets.filter((w) => w.id !== id),
  };
}

export function renameWidgetInLayout(
  layout: DeskLayout,
  id: string,
  title: string,
): DeskLayout {
  const trimmed = title.trim();
  return {
    ...layout,
    widgets: layout.widgets.map((w) =>
      w.id === id
        ? {
            ...w,
            title: trimmed || undefined,
          }
        : w,
    ),
  };
}

export function moveWidgetInLayout(
  layout: DeskLayout,
  id: string,
  direction: "up" | "down",
): DeskLayout {
  const index = layout.widgets.findIndex((w) => w.id === id);
  if (index < 0) return layout;
  const widget = layout.widgets[index];
  const siblings = layout.widgets
    .map((w, i) => ({ w, i }))
    .filter((entry) => entry.w.column === widget.column);
  const siblingPos = siblings.findIndex((entry) => entry.w.id === id);
  const swapWith =
    direction === "up" ? siblings[siblingPos - 1] : siblings[siblingPos + 1];
  if (!swapWith) return layout;

  const widgets = [...layout.widgets];
  const a = index;
  const b = swapWith.i;
  [widgets[a], widgets[b]] = [widgets[b], widgets[a]];
  return { ...layout, widgets };
}

export function setWidgetColumn(
  layout: DeskLayout,
  id: string,
  column: DeskColumn,
): DeskLayout {
  const index = layout.widgets.findIndex((w) => w.id === id);
  if (index < 0) return layout;
  const widget = layout.widgets[index];
  if (widget.column === column) return layout;

  const without = layout.widgets.filter((w) => w.id !== id);
  const moved = { ...widget, column };
  const lastSame = [...without]
    .map((w, i) => ({ w, i }))
    .reverse()
    .find((entry) => entry.w.column === column);

  if (lastSame) {
    without.splice(lastSame.i + 1, 0, moved);
  } else if (column === "full") {
    without.unshift(moved);
  } else {
    without.push(moved);
  }

  return { ...layout, widgets: without };
}

export function availableWidgetTypes(layout: DeskLayout): DeskWidgetType[] {
  const present = new Set(layout.widgets.map((w) => w.type));
  return (Object.keys(DESK_WIDGET_CATALOG) as DeskWidgetType[]).filter(
    (type) => !(DESK_WIDGET_CATALOG[type].unique && present.has(type)),
  );
}
