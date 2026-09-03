import { cn } from "@/lib/utils";

export function listPanelClass(extra?: string) {
  return cn(
    "overflow-hidden rounded-[24px] border border-border/80 bg-card/45 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-md",
    extra,
  );
}

export function listToolbarClass(extra?: string) {
  return cn(
    "border-b border-border/70 bg-[linear-gradient(120deg,color-mix(in_srgb,var(--primary)_7%,transparent),transparent_55%,color-mix(in_srgb,var(--run)_5%,transparent))] px-4 py-4 md:px-6",
    extra,
  );
}

export function listColumnsClass(extra?: string) {
  return cn(
    "hidden border-b border-border/50 px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:grid md:grid-cols-[96px_minmax(0,1.25fr)_minmax(0,1.55fr)_88px_112px] md:gap-4",
    extra,
  );
}

export function fleetRowClass(extra?: string) {
  return cn(
    "group relative grid grid-cols-1 items-center gap-2 border-b border-border/45 px-4 py-4 transition-[background-color,padding] duration-300 last:border-b-0 hover:bg-primary/[0.045] hover:pl-5 md:grid-cols-[96px_minmax(0,1.25fr)_minmax(0,1.55fr)_88px_112px] md:gap-4 md:px-6",
    extra,
  );
}

export function listRowClass(extra?: string) {
  return cn(
    "animate-rise grid grid-cols-1 items-center gap-2 rounded-xl border-t border-border px-3 py-4 transition-colors hover:bg-primary/5 md:grid-cols-[92px_minmax(0,1.4fr)_minmax(0,1.5fr)_88px_120px] md:gap-4",
    extra,
  );
}

export function splitClass(extra?: string) {
  return cn("grid items-start gap-12 md:grid-cols-[1.1fr_0.9fr]", extra);
}

export const noteClass =
  "border-l-2 border-primary pl-4 text-muted-foreground";

export const nameClass = "font-heading text-base font-bold tracking-[-0.04em]";

export const metaClass =
  "overflow-hidden text-ellipsis whitespace-nowrap text-[15px] text-muted-foreground";

export const monoClass = "font-mono text-xs text-muted-foreground";

export const typeBadgeClass =
  "mt-1 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-primary";
