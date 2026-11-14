"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationInbox } from "@/features/alerts/NotificationInbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { routes } from "@/shared/lib/routes";
import { useSession } from "@/shared/session";

const NAV = [
  { href: routes.overview, label: "Prehľad" },
  { href: routes.monitors, label: "Monitory" },
  { href: routes.alerts, label: "Alerty" },
  { href: routes.load, label: "Záťaž" },
  { href: routes.settings, label: "Nastavenia" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useSession();
  const initial = (user?.name || user?.email || "?").slice(0, 1).toUpperCase();

  function onSignOut() {
    signOut();
    toast.success("Odhlásený.", { description: "Token je preč z prehliadača." });
    router.replace("/");
  }

  return (
    <div className="relative z-2 grid min-h-svh grid-rows-[auto_1fr]">
      <a
        href="#obsah"
        className="absolute top-[-48px] left-3 z-20 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:top-3"
      >
        Preskočiť na obsah
      </a>
      <header className="sticky top-0 z-10 grid items-center gap-4 border-b border-border bg-background px-4 py-3 md:grid-cols-[auto_1fr_auto] md:px-7">
        <Link
          href={routes.overview}
          className="font-heading text-[15px] font-black tracking-[-0.04em]"
        >
          PulseWatch
        </Link>
        <nav className="flex gap-5 overflow-x-auto" aria-label="Hlavná navigácia">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative whitespace-nowrap py-1 text-[14px] text-muted-foreground transition-colors hover:text-foreground",
                  active && "font-medium text-foreground",
                )}
              >
                {item.label}
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-foreground"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <NotificationInbox />
          <Avatar className="size-7 rounded-md">
            <AvatarFallback className="rounded-md bg-muted text-[12px] font-medium text-foreground">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-40 truncate md:inline">
            {user?.name || user?.email}
          </span>
          <Button variant="ghost" size="sm" type="button" onClick={onSignOut}>
            Odhlásiť
          </Button>
        </div>
      </header>
      <main id="obsah" className="mx-auto w-full max-w-[1120px] px-4 py-8 pb-20 md:px-8">
        {children}
      </main>
    </div>
  );
}
