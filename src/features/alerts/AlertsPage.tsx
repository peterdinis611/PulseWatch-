"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { listPanelClass, monoClass } from "@/shared/ui/list";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread";

function notificationHref(item: Notification): string | null {
  if (item.monitorId) return `/monitors/${item.monitorId}`;
  if (item.stressTestId) return `/load/${item.stressTestId}`;
  return null;
}

export default function AlertsPage() {
  const router = useRouter();
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
      toast.error("Označenie zlyhalo.", { description: gqlMessage(err) });
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
      toast.success("Všetky prečítané.");
    } catch (err) {
      toast.error("Označenie zlyhalo.", { description: gqlMessage(err) });
    }
  }

  const visible =
    filter === "unread" ? items.filter((item) => !item.readAt) : items;

  return (
    <>
      <PageHeader
        kicker="Upozornenia"
        title="Celá história."
        lede="Monitor DOWN, recovery, k6 výsledky — všetko na jednom mieste. Live cez WebSocket."
        actions={
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={unread === 0}
            onClick={markAll}
          >
            Označiť prečítané
          </Button>
        }
      />

      <section className={listPanelClass("animate-rise")}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div className="flex gap-2">
            {(["all", "unread"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
                  filter === value
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {value === "all" ? "Všetky" : "Neprečítané"}
              </button>
            ))}
          </div>
          <p className={monoClass}>
            {visible.length} záznamov · {unread} neprečítaných
          </p>
        </div>

        {error ? (
          <p className="px-5 py-4 text-sm text-destructive">{error}</p>
        ) : null}

        {!loaded ? (
          <p className="px-5 py-10 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Načítavam…
          </p>
        ) : visible.length === 0 ? (
          <div className="px-5 py-14">
            <p className="font-heading text-3xl tracking-[-0.05em]">Ticho.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {filter === "unread"
                ? "Všetko prečítané."
                : "Keď niečo spadne alebo k6 dopíše beh, uvidíš to tu."}
            </p>
          </div>
        ) : (
          visible.map((item) => {
            const href = notificationHref(item);
            const rowClass = cn(
              "grid w-full grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-border/60 px-5 py-4 text-left last:border-b-0",
              !item.readAt && "bg-primary/5 shadow-[inset_3px_0_0_var(--primary)]",
              href && "transition-colors hover:bg-muted/30",
            );
            const content = (
              <>
                <StatusBadge value={item.type} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-heading text-lg tracking-[-0.04em]">
                      {item.title}
                    </p>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {item.readAt ? "PREČÍTANÉ" : "NOVÉ"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                    {formatAgo(item.createdAt)}
                    {href ? " · detail →" : ""}
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
                  if (!item.readAt) void markOne(item.id);
                }}
              >
                {content}
              </button>
            );
          })
        )}
      </section>

      <p className="mt-6 text-center">
        <button
          type="button"
          className={`${monoClass} text-muted-foreground underline-offset-4 hover:text-foreground hover:underline`}
          onClick={() => router.push("/desk")}
        >
          ← Späť na prehľad
        </button>
      </p>
    </>
  );
}
