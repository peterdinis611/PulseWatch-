"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { gql, gqlMessage } from "@/shared/graphql/client";
import { toast } from "sonner";
import {
  MARK_ALL_READ,
  MARK_READ,
  NOTIFICATIONS_QUERY,
} from "@/shared/graphql/documents";
import { formatAgo } from "@/shared/lib/format";
import type { Notification } from "@/shared/lib/types";
import { useSession } from "@/shared/session";
import { StatusBadge } from "@/shared/ui/status-badge";
import { cn } from "@/lib/utils";

export function NotificationInbox() {
  const { unread, refresh } = useSession();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;

    async function load() {
      try {
        const data = await gql<{
          notifications: Notification[];
          unreadNotificationCount: number;
        }>(NOTIFICATIONS_QUERY);
        if (!alive) return;
        setItems(data.notifications);
        setError(null);
        setLoaded(true);
      } catch (err) {
        if (!alive) return;
        setError(gqlMessage(err));
        setLoaded(true);
      }
    }

    load();
    const id = window.setInterval(load, 5000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [open]);

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
      toast.error("Označenie zlyhalo.", { description: message });
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
      const message = gqlMessage(err);
      setError(message);
      toast.error("Označenie zlyhalo.", { description: message });
    }
  }

  const label =
    unread > 0
      ? `Upozornenia, ${unread} neprečítané`
      : "Upozornenia";

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
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              Upozornenia
            </p>
            <p className="mt-0.5 font-heading text-lg tracking-[-0.04em]">
              Čo flota povedala.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={unread === 0}
            onClick={markAll}
          >
            Označiť prečítané
          </Button>
        </header>
        {error ? (
          <p className="px-4 py-3 text-sm text-destructive">{error}</p>
        ) : null}
        <div className="max-h-[min(420px,60vh)] overflow-y-auto">
          {!loaded ? (
            <p className="px-4 py-8 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Načítavam…
            </p>
          ) : items.length === 0 ? (
            <div className="px-4 py-10">
              <p className="font-heading text-2xl tracking-[-0.05em]">Ticho.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Keď monitor padne alebo k6 skončí, príde to sem.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "grid w-full grid-cols-[auto_minmax(0,1fr)] gap-3 border-b border-border px-4 py-3 text-left last:border-b-0",
                  !item.readAt && "bg-primary/5 shadow-[inset_3px_0_0_var(--primary)]",
                  item.readAt ? "cursor-default" : "cursor-pointer hover:bg-muted/40",
                )}
                onClick={() => {
                  if (!item.readAt) markOne(item.id);
                }}
              >
                <StatusBadge value={item.type} />
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-heading text-sm tracking-[-0.03em]">
                      {item.title}
                    </p>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {item.readAt ? "READ" : "NEW"}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground">
                    {item.body}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {formatAgo(item.createdAt)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
