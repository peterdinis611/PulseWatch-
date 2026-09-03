"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationInbox } from "@/features/alerts/NotificationInbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSession } from "@/shared/session";

const NAV = [
  { href: "/desk", label: "Prehľad" },
  { href: "/monitors", label: "Monitory" },
  { href: "/load", label: "Záťaž" },
  { href: "/settings", label: "Nastavenia" },
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
        className="absolute top-[-48px] left-3 z-20 rounded-lg bg-primary px-3 py-2 text-primary-foreground focus:top-3"
      >
        Preskočiť na obsah
      </a>
      <header className="sticky top-0 z-10 grid items-center gap-4 border-b border-border bg-background/70 px-4 py-3 backdrop-blur-md md:grid-cols-[auto_1fr_auto] md:px-7">
        <Link href="/desk" className="font-heading text-lg font-extrabold tracking-[-0.06em]">
          pulse<em className="ml-1 font-sans font-medium italic text-primary">watch</em>
        </Link>
        <nav className="flex gap-1 overflow-x-auto" aria-label="Hlavná navigácia">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground hover:bg-muted hover:text-foreground",
                  active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <NotificationInbox />
          <Avatar className="size-7">
            <AvatarFallback className="bg-muted font-heading text-xs text-primary">
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
      <main id="obsah" className="mx-auto w-full max-w-[1120px] px-4 py-7 pb-20 md:px-8">
        {children}
      </main>
    </div>
  );
}
