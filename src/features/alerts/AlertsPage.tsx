"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  BellRing,
  CheckCheck,
  Inbox,
  Siren,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { IncidentsPanel } from "@/features/alerts/IncidentsPanel";
import { gql, gqlMessage, subscribeGql } from "@/shared/graphql/client";
import { toast } from "sonner";
import {
  MARK_ALL_READ,
  MARK_READ,
  NOTIFICATIONS_QUERY,
  NOTIFICATION_SUB,
} from "@/shared/graphql/documents";
import { formatAgo } from "@/shared/lib/format";
import type { Notification } from "@/shared/lib/types";
import { useSession } from "@/shared/session";
import { PageHeader } from "@/shared/ui/page-header";
import { StatusBadge } from "@/shared/ui/status-badge";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread";

function notificationHref(item: Notification): string | null {
  if (item.monitorId) return `/monitors/${item.monitorId}`;
  if (item.stressTestId) return `/load/${item.stressTestId}`;
  return null;
}

export default function AlertsPage() {
  const { unread } = useSession();
  const [tab, setTab] = useState("incidents");

  return (
    <>
      <PageHeader
        title="Alerts"
        lede="Incidents open on DOWN and resolve on recovery. Notifications stay in the feed."
      />

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList variant="line" className="w-full justify-start gap-1">
          <TabsTrigger value="incidents" className="gap-1.5 px-3">
            <Siren className="size-3.5" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 px-3">
            <BellRing className="size-3.5" />
            Notifications
            {unread > 0 ? (
              <Badge className="h-5 min-w-5 justify-center rounded-md px-1 font-mono text-[10px]">
                {unread > 99 ? "99+" : unread}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="mt-0">
          <IncidentsPanel />
        </TabsContent>
        <TabsContent value="notifications" className="mt-0">
          <NotificationsPanel />
        </TabsContent>
      </Tabs>
    </>
  );
}

function NotificationsPanel() {
  const { unread, refresh } = useSession();
  const [items, setItems] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await gql<{
        notifications: Notification[];
        unreadNotificationCount: number;
      }>(NOTIFICATIONS_QUERY);
      setItems(data.notifications);
      setError(null);
      setLoaded(true);
    } catch (err) {
      setError(gqlMessage(err));
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();
    const stop = subscribeGql<{ notificationReceived: Notification }>(
      NOTIFICATION_SUB,
      (data) => {
        setItems((prev) => {
          if (prev.some((item) => item.id === data.notificationReceived.id)) {
            return prev;
          }
          return [data.notificationReceived, ...prev];
        });
        void refresh();
      },
    );
    return stop;
  }, [load, refresh]);

  async function markOne(id: string) {
    try {
      await gql(MARK_READ, { id });
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, readAt: item.readAt ?? new Date().toISOString() }
            : item,
        ),
      );
      await refresh();
    } catch (err) {
      toast.error("Couldn't mark as read.", { description: gqlMessage(err) });
    }
  }

  async function markAll() {
    try {
      await gql(MARK_ALL_READ);
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          readAt: item.readAt ?? new Date().toISOString(),
        })),
      );
      await refresh();
      toast.success("All marked as read.");
    } catch (err) {
      toast.error("Couldn't mark as read.", { description: gqlMessage(err) });
    }
  }

  const visible =
    filter === "unread" ? items.filter((item) => !item.readAt) : items;

  return (
    <Card className="animate-rise gap-0 overflow-hidden py-0 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3 md:px-5">
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(next) => {
            if (next) setFilter(next as Filter);
          }}
          variant="outline"
          className="flex flex-wrap gap-1"
          aria-label="Notification filter"
        >
          <ToggleGroupItem
            value="all"
            className="h-8 gap-1.5 rounded-md px-2.5 text-[12px] data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
          >
            <Inbox className="size-3.5" />
            All
          </ToggleGroupItem>
          <ToggleGroupItem
            value="unread"
            className="h-8 gap-1.5 rounded-md px-2.5 text-[12px] data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
          >
            <Bell className="size-3.5" />
            Unread
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="h-7 gap-1.5 rounded-md px-2 font-mono text-[12px] tabular-nums"
          >
            {visible.length} · {unread} unread
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            disabled={unread === 0}
            onClick={() => void markAll()}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        </div>
      </div>

      {error ? (
        <p className="px-4 py-4 text-sm text-destructive md:px-5">{error}</p>
      ) : null}

      {!loaded ? (
        <div className="grid gap-3 px-4 py-5 md:px-5">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : visible.length === 0 ? (
        <div className="grid justify-items-start gap-2 px-4 py-12 md:px-5">
          <span className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-muted/30 text-muted-foreground">
            <Bell className="size-5" />
          </span>
          <p className="font-heading text-[22px] font-black tracking-[-0.04em]">
            All quiet
          </p>
          <p className="max-w-[42ch] text-[14px] text-muted-foreground">
            {filter === "unread"
              ? "Everything is read."
              : "Outages and finished load tests show up here."}
          </p>
        </div>
      ) : (
        <ul>
          {visible.map((item) => {
            const href = notificationHref(item);
            const rowClass = cn(
              "grid w-full grid-cols-[auto_minmax(0,1fr)] gap-3 border-b border-border/60 px-4 py-3.5 text-left last:border-b-0 md:gap-4 md:px-5",
              !item.readAt &&
                "bg-primary/[0.04] shadow-[inset_3px_0_0_var(--primary)]",
              href && "transition-colors hover:bg-muted/25",
            );
            const content = (
              <>
                <StatusBadge value={item.type} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-heading text-[15px] font-medium tracking-[-0.03em]">
                      {item.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 rounded-md px-1.5 font-mono text-[10px]",
                        item.readAt
                          ? "text-muted-foreground"
                          : "border-primary/40 text-primary",
                      )}
                    >
                      {item.readAt ? "READ" : "NEW"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {item.body}
                  </p>
                  <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                    {formatAgo(item.createdAt)}
                    {item.incidentId ? " · incident" : ""}
                    {href ? " · open details" : ""}
                  </p>
                </div>
              </>
            );

            if (href) {
              return (
                <li key={item.id}>
                  <Link
                    href={href}
                    className={rowClass}
                    onClick={() => {
                      if (!item.readAt) void markOne(item.id);
                    }}
                  >
                    {content}
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={rowClass}
                  onClick={() => {
                    if (!item.readAt) void markOne(item.id);
                  }}
                >
                  {content}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
