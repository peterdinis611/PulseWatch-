"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Constellation } from "@/features/desk/Constellation";
import {
  AddWidgetDialog,
  DeskCustomizeBar,
  EditableFrame,
  RenameWidgetDialog,
  WidgetEditToolbar,
} from "@/features/desk/desk-customize";
import {
  availableWidgetTypes,
  widgetTitle,
  type DeskWidgetInstance,
} from "@/features/desk/desk-layout";
import { useDeskLayout } from "@/features/desk/use-desk-layout";
import {
  AttentionWidget,
  fleetHealthOf,
  HealthBanner,
  IncidentsWidget,
  LatencyWidget,
  LoadRunsWidget,
  MetricStrip,
  ShortcutsWidget,
  Widget,
} from "@/features/desk/desk-widgets";
import { MonitorList } from "@/features/monitors/MonitorList";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/shared/ui/page-header";
import { usePoll } from "@/shared/hooks/usePoll";
import { gql } from "@/shared/graphql/client";
import { DESK_QUERY } from "@/shared/graphql/documents";
import type {
  FleetUptime,
  Incident,
  StatusPageSettings,
  StressTest,
} from "@/shared/lib/types";
import { useSession } from "@/shared/session";
import { monitorsWith, routes } from "@/shared/lib/routes";
import { toast } from "sonner";

export default function DeskPage() {
  const router = useRouter();
  const { monitors } = useSession();
  const {
    layout,
    editing,
    setEditing,
    addWidget,
    removeWidget,
    renameWidget,
    moveWidget,
    changeColumn,
    resetLayout,
  } = useDeskLayout();
  const [addOpen, setAddOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<DeskWidgetInstance | null>(
    null,
  );

  const { data } = usePoll(
    () =>
      gql<{
        fleetUptime: FleetUptime;
        stressTests: StressTest[];
        incidents: Incident[];
        myStatusPage: StatusPageSettings;
      }>(DESK_QUERY),
    8000,
  );

  const loads = data?.stressTests ?? [];
  const uptime = data?.fleetUptime;
  const openIncidents = data?.incidents ?? [];
  const statusPage = data?.myStatusPage;

  const up = monitors.filter((m) => m.lastStatus === "UP").length;
  const down = monitors.filter((m) => m.lastStatus === "DOWN").length;
  const unknown = monitors.filter((m) => m.lastStatus === "UNKNOWN").length;
  const softFailing = monitors.filter(
    (m) =>
      m.lastStatus !== "DOWN" &&
      m.consecutiveFailures > 0 &&
      m.failureThreshold > 1,
  ).length;
  const running = loads.filter((t) => t.lastStatus === "RUNNING").length;
  const downMonitors = monitors.filter((m) => m.lastStatus === "DOWN");
  const previewMonitors =
    downMonitors.length > 0 ? downMonitors : monitors.slice(0, 8);

  const uptimeLabel =
    uptime && uptime.monitorCount > 0
      ? `${uptime.avgUptimePercent.toFixed(1)}%`
      : "—";
  const checksLabel =
    uptime && uptime.monitorCount > 0 ? String(uptime.totalChecks) : "—";

  const health = fleetHealthOf({
    monitorCount: monitors.length,
    down,
    softFailing,
    openIncidents: openIncidents.length,
  });

  const statusHref = statusPage
    ? statusPage.isPublic
      ? routes.status(statusPage.slug)
      : routes.settings
    : routes.settings;

  const columns = useMemo(() => {
    return {
      full: layout.widgets.filter((w) => w.column === "full"),
      main: layout.widgets.filter((w) => w.column === "main"),
      side: layout.widgets.filter((w) => w.column === "side"),
    };
  }, [layout.widgets]);

  function toolbarFor(widget: DeskWidgetInstance) {
    if (!editing) return null;
    return (
      <WidgetEditToolbar
        widget={widget}
        layout={layout}
        onMove={(direction) => moveWidget(widget.id, direction)}
        onColumn={(column) => changeColumn(widget.id, column)}
        onRename={() => setRenameTarget(widget)}
        onRemove={() => {
          removeWidget(widget.id);
          toast.success("Widget removed.", {
            description: "You can add it again from Customize.",
          });
        }}
      />
    );
  }

  function renderWidget(widget: DeskWidgetInstance) {
    const title = widgetTitle(widget);
    const toolbar = toolbarFor(widget);

    switch (widget.type) {
      case "health":
        return (
          <EditableFrame editing={editing} key={widget.id}>
            <div className="relative">
              {editing ? (
                <div className="absolute top-2 right-2 z-10 rounded-md border border-border bg-card/95 p-0.5 shadow-sm">
                  {toolbar}
                </div>
              ) : null}
              <HealthBanner
                health={health}
                uptimeLabel={uptimeLabel}
                checksLabel={checksLabel}
              />
            </div>
          </EditableFrame>
        );
      case "metrics":
        return (
          <EditableFrame editing={editing} key={widget.id}>
            <div className="relative">
              {editing ? (
                <div className="absolute top-2 right-2 z-10 rounded-md border border-border bg-card/95 p-0.5 shadow-sm">
                  {toolbar}
                </div>
              ) : null}
              <MetricStrip
                items={[
                  {
                    label: "Up",
                    value: up,
                    suffix: `/ ${monitors.length}`,
                    tone: "up",
                    onClick: () => router.push(monitorsWith({ status: "UP" })),
                  },
                  {
                    label: "Down",
                    value: down,
                    tone: down ? "down" : "muted",
                    onClick: () =>
                      router.push(monitorsWith({ status: "DOWN" })),
                  },
                  {
                    label: "Soft DOWN",
                    value: softFailing,
                    tone: softFailing ? "warn" : "muted",
                    onClick: () => router.push(routes.monitors),
                  },
                  {
                    label: "Unknown",
                    value: unknown,
                    tone: "muted",
                    onClick: () =>
                      router.push(monitorsWith({ status: "UNKNOWN" })),
                  },
                  {
                    label: "Open incidents",
                    value: openIncidents.length,
                    tone: openIncidents.length ? "down" : "muted",
                    onClick: () => router.push(routes.alerts),
                  },
                  {
                    label: "k6 running",
                    value: running,
                    tone: running ? "run" : "muted",
                    onClick: () => router.push(routes.load),
                  },
                ]}
              />
            </div>
          </EditableFrame>
        );
      case "fleet_map":
        return (
          <EditableFrame editing={editing} key={widget.id}>
            <Widget
              title={title}
              toolbar={toolbar}
              action={
                <Link
                  href={routes.monitors}
                  className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  All monitors →
                </Link>
              }
              bodyClassName="px-1 pb-1 pt-1 md:px-3"
            >
              {monitors.length === 0 ? (
                <p className="px-3 py-6 text-[14px] text-muted-foreground">
                  Add a monitor to populate the fleet map.
                </p>
              ) : (
                <Constellation monitors={monitors} />
              )}
            </Widget>
          </EditableFrame>
        );
      case "latest_checks":
        return (
          <EditableFrame editing={editing} key={widget.id}>
            {monitors.length === 0 ? (
              <Widget title={title} toolbar={toolbar}>
                <p className="text-[14px] text-muted-foreground">
                  Latest checks appear after the first probe.
                </p>
              </Widget>
            ) : (
              <div className="relative">
                {editing ? (
                  <div className="absolute top-3 right-3 z-10 rounded-md border border-border bg-card/95 p-0.5 shadow-sm">
                    {toolbar}
                  </div>
                ) : null}
                <Suspense fallback={null}>
                  <MonitorList
                    monitors={previewMonitors}
                    variant="preview"
                    previewTitle={title}
                    previewKicker={
                      downMonitors.length > 0
                        ? "Prioritized by current outage"
                        : "Most recent probes across the fleet"
                    }
                    showAllHref={
                      downMonitors.length > 0
                        ? monitorsWith({ status: "DOWN" })
                        : routes.monitors
                    }
                  />
                </Suspense>
              </div>
            )}
          </EditableFrame>
        );
      case "incidents":
        return (
          <EditableFrame editing={editing} key={widget.id}>
            <IncidentsWidget
              incidents={openIncidents}
              title={title}
              toolbar={toolbar}
            />
          </EditableFrame>
        );
      case "attention":
        return (
          <EditableFrame editing={editing} key={widget.id}>
            <AttentionWidget
              monitors={monitors}
              title={title}
              toolbar={toolbar}
            />
          </EditableFrame>
        );
      case "latency":
        return (
          <EditableFrame editing={editing} key={widget.id}>
            <LatencyWidget
              monitors={monitors}
              title={title}
              toolbar={toolbar}
            />
          </EditableFrame>
        );
      case "shortcuts":
        return (
          <EditableFrame editing={editing} key={widget.id}>
            <ShortcutsWidget
              statusHref={statusHref}
              statusPublic={Boolean(statusPage?.isPublic)}
              title={title}
              toolbar={toolbar}
            />
          </EditableFrame>
        );
      case "load_runs":
        return (
          <EditableFrame editing={editing} key={widget.id}>
            <LoadRunsWidget tests={loads} title={title} toolbar={toolbar} />
          </EditableFrame>
        );
      default:
        return null;
    }
  }

  const canAdd = availableWidgetTypes(layout).length > 0;
  const boardEmpty = layout.widgets.length === 0;

  return (
    <>
      <PageHeader
        title="Overview"
        lede="Fleet health, active incidents, and the checks that need your eyes first."
        actions={
          <>
            <DeskCustomizeBar
              editing={editing}
              onToggleEditing={() => setEditing((value) => !value)}
              onAddOpen={() => setAddOpen(true)}
              canAdd={canAdd}
              onReset={() => {
                resetLayout();
                toast.success("Layout reset.", {
                  description: "Default Overview widgets restored.",
                });
              }}
            />
            <Button asChild size="lg">
              <Link href={routes.monitorNew}>New monitor</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={routes.loadNew}>New load test</Link>
            </Button>
          </>
        }
      />

      {editing ? (
        <p className="mb-4 border border-primary/30 bg-card px-4 py-2.5 text-[13px] text-muted-foreground">
          Customize mode — reorder, rename, move columns, remove widgets, or add
          new ones. Changes save automatically in this browser.
        </p>
      ) : null}

      {boardEmpty ? (
        <EmptyState
          title="No widgets on the board"
          action={
            <Button type="button" size="lg" onClick={() => setAddOpen(true)}>
              Add widget
            </Button>
          }
        >
          Start from a blank Overview or reset to the default layout.
        </EmptyState>
      ) : (
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid min-w-0 gap-4">
            {columns.full.map(renderWidget)}
          </div>

          {monitors.length === 0 && !editing ? (
            <EmptyState
              title="No monitors in the fleet"
              action={
                <Button asChild size="lg">
                  <Link href={routes.monitorNew}>Add HTTP monitor</Link>
                </Button>
              }
            >
              Start with a GET against an endpoint that must stay up. The fleet
              map and widgets fill in after the first check.
            </EmptyState>
          ) : (
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
              <div className="grid min-w-0 flex-1 gap-4">
                {columns.main.length > 0
                  ? columns.main.map(renderWidget)
                  : editing ? (
                      <div className="border border-dashed border-border px-4 py-8 text-center text-[13px] text-muted-foreground">
                        Main column is empty — move a widget here or add one.
                      </div>
                    ) : null}
              </div>
              <aside className="grid w-full min-w-0 shrink-0 gap-4 lg:w-[280px]">
                {columns.side.length > 0
                  ? columns.side.map(renderWidget)
                  : editing ? (
                      <div className="border border-dashed border-border px-4 py-8 text-center text-[13px] text-muted-foreground">
                        Side column is empty — move a widget here or add one.
                      </div>
                    ) : null}
              </aside>
            </div>
          )}
        </div>
      )}

      <AddWidgetDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        layout={layout}
        onAdd={(type) => {
          addWidget(type);
          toast.success("Widget added.");
          if (!editing) setEditing(true);
        }}
      />
      <RenameWidgetDialog
        widget={renameTarget}
        open={Boolean(renameTarget)}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
        onSave={(title) => {
          if (!renameTarget) return;
          renameWidget(renameTarget.id, title);
          toast.success("Widget renamed.");
        }}
      />
    </>
  );
}
