"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { StatusBadge } from "@/shared/ui/status-badge";
import { cn } from "@/lib/utils";

function notificationHref(item: Notification): string | null {
  if (item.monitorId) return `/monitors/${item.monitorId}`;
  if (item.stressTestId) return `/load/${item.stressTestId}`;
  return null;
}

export function NotificationInbox() {
  const router = useRouter();
  const { unread, refresh } = useSession();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
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
    if (!open) return;

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
  }, [open, load, refresh]);

  async function markOne(id: string) {
    try {
      await gql(MARK_READ, { id });
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item,
        ),
      );
      await refresh();
    } catch (err) {
      const message = gqlMessage(err);
      setError(message);
      toast.error("Couldn't mark as read.", { description: message });
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
      const message = gqlMessage(err);
      setError(message);
      toast.error("Couldn't mark as read.", { description: message });
    }
  }

  const label =
    unread > 0
      ? `Notifications, ${unread} unread`
      : "Notifications";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          className="relative"
        >
          <Bell />
          {unread > 0 ? (
            <span className="absolute top-0.5 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-0.5 font-mono text-[9px] leading-none text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(420px,calc(100vw-1.5rem))] overflow-hidden p-0"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <p className="font-heading text-lg font-black tracking-[-0.04em]">
              Notifications
            </p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              What your fleet is saying.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={unread === 0}
              onClick={markAll}
            >
              Mark all as read
            </Button>
            <Link
              href="/alerts"
              className="text-[13px] text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Full history →
            </Link>
          </div>
        </header>
        {error ? (
          <p className="px-4 py-3 text-sm text-destructive">{error}</p>
        ) : null}
        <div className="max-h-[min(420px,60vh)] overflow-y-auto">
          {!loaded ? (
            <p className="px-4 py-8 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Loading…
            </p>
          ) : items.length === 0 ? (
            <div className="px-4 py-10">
              <p className="font-heading text-2xl tracking-[-0.05em]">All quiet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                When a monitor goes down or a k6 run finishes, it will show up here.
              </p>
            </div>
          ) : (
            items.slice(0, 12).map((item) => {
              const href = notificationHref(item);
              const rowClass = cn(
                "grid w-full grid-cols-[auto_minmax(0,1fr)] gap-3 border-b border-border px-4 py-3 text-left last:border-b-0",
                !item.readAt && "bg-primary/5 shadow-[inset_3px_0_0_var(--primary)]",
                href ? "cursor-pointer hover:bg-muted/40" : "cursor-default",
              );

              const content = (
                <>
                  <StatusBadge value={item.type} />
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-heading text-sm tracking-[-0.03em]">
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[12px] text-muted-foreground">
                        {item.readAt ? "READ" : "NEW"}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground">
                      {item.body}
                    </p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {formatAgo(item.createdAt)}
                    </p>
                  </div>
                </>
              );

              if (href) {
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className={rowClass}
                    onClick={() => {
                      if (!item.readAt) void markOne(item.id);
                      setOpen(false);
                    }}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  className={rowClass}
                  onClick={() => {
                    if (!item.readAt) markOne(item.id);
                  }}
                >
                  {content}
                </button>
              );
            })
          )}
        </div>
        {items.length > 12 ? (
          <footer className="border-t border-border px-4 py-2 text-center">
            <button
              type="button"
              className="text-[13px] text-primary"
              onClick={() => {
                setOpen(false);
                router.push("/alerts");
              }}
            >
              +{items.length - 12} more →
            </button>
          </footer>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
