"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  BellRing,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationInbox } from "@/features/alerts/NotificationInbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { routes } from "@/shared/lib/routes";
import { useSession } from "@/shared/session";

const NAV_GROUPS = [
  {
    label: "Operate",
    items: [
      { href: routes.overview, label: "Overview", icon: LayoutDashboard },
      { href: routes.monitors, label: "Monitors", icon: Activity },
      { href: routes.alerts, label: "Alerts", icon: BellRing },
    ],
  },
  {
    label: "Test",
    items: [{ href: routes.load, label: "Load", icon: Gauge }],
  },
  {
    label: "Configure",
    items: [{ href: routes.settings, label: "Settings", icon: Settings }],
  },
] as const;

function navActive(pathname: string, href: string) {
  if (href === routes.overview) {
    return pathname === href || pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, unread } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initial = (user?.name || user?.email || "?").slice(0, 1).toUpperCase();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  function onSignOut() {
    signOut();
    toast.success("Signed out.", {
      description: "Your token was removed from this browser.",
    });
    router.replace("/");
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between gap-2 border-b border-sidebar-border px-4">
        <Link
          href={routes.overview}
          className="font-heading text-[15px] font-black tracking-[-0.04em]"
        >
          PulseWatch
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        >
          <X className="size-4" />
        </Button>
      </div>

      <nav
        className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
        aria-label="Main navigation"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-2 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = navActive(pathname, item.href);
                const Icon = item.icon;
                const showBadge =
                  item.href === routes.alerts && unread > 0 ? unread : null;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] transition-colors",
                        active
                          ? "bg-sidebar-accent font-medium text-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                      {showBadge != null ? (
                        <span className="rounded-sm bg-primary px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary-foreground tabular-nums">
                          {showBadge > 99 ? "99+" : showBadge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 flex items-center gap-2.5 px-1">
          <Avatar className="size-8 rounded-md">
            <AvatarFallback className="rounded-md bg-muted text-[12px] font-medium text-foreground">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-foreground">
              {user?.name || "Account"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="h-9 w-full justify-start gap-2 text-muted-foreground"
          onClick={onSignOut}
        >
          <LogOut className="size-3.5" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="relative z-2 min-h-svh md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <a
        href="#content"
        className="absolute top-[-48px] left-3 z-30 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:top-3"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-svh border-r border-sidebar-border bg-sidebar md:block">
        {sidebar}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(100%,280px)] border-r border-sidebar-border bg-sidebar shadow-2xl">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
            <Link
              href={routes.overview}
              className="font-heading text-[14px] font-black tracking-[-0.04em] md:hidden"
            >
              PulseWatch
            </Link>
            <p className="hidden truncate text-[13px] text-muted-foreground md:block">
              Monitoring console
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <NotificationInbox />
            <Avatar className="size-7 rounded-md md:hidden">
              <AvatarFallback className="rounded-md bg-muted text-[11px] font-medium">
                {initial}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main
          id="content"
          className="mx-auto w-full min-w-0 max-w-[1280px] flex-1 overflow-x-hidden px-4 py-6 pb-16 md:px-7 md:py-7"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
