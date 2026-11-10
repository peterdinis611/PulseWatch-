import { cn } from "@/lib/utils";

export function listPanelClass(extra?: string) {
  return cn(
    "overflow-hidden rounded-lg border border-border bg-card",
    extra,
  );
}

export function listToolbarClass(extra?: string) {
  return cn("border-b border-border px-4 py-4 md:px-5", extra);
}

export function listColumnsClass(extra?: string) {
  return cn(
    "hidden border-b border-border px-5 py-2.5 text-[13px] text-muted-foreground md:grid md:grid-cols-[96px_minmax(0,1.25fr)_minmax(0,1.55fr)_88px_112px] md:gap-4",
    extra,
  );
}

export function fleetRowClass(extra?: string) {
  return cn(
    "group relative grid grid-cols-1 items-center gap-2 border-b border-border px-4 py-4 transition-colors last:border-b-0 hover:bg-foreground/[0.03] md:grid-cols-[96px_minmax(0,1.25fr)_minmax(0,1.55fr)_88px_112px] md:gap-4 md:px-5",
    extra,
  );
}

export function listRowClass(extra?: string) {
  return cn(
    "animate-rise grid grid-cols-1 items-center gap-2 border-t border-border px-3 py-4 transition-colors hover:bg-foreground/[0.03] md:grid-cols-[92px_minmax(0,1.4fr)_minmax(0,1.5fr)_88px_120px] md:gap-4",
    extra,
  );
}

export function splitClass(extra?: string) {
  return cn("grid items-start gap-12 md:grid-cols-[1.1fr_0.9fr]", extra);
}

export const noteClass = "border-l-2 border-primary pl-4 text-muted-foreground";

export const nameClass = "font-heading text-base font-medium tracking-[-0.03em]";

export const metaClass =
  "overflow-hidden text-ellipsis whitespace-nowrap text-[15px] text-muted-foreground";

export const monoClass = "font-mono text-[13px] tabular-nums text-muted-foreground";

export const typeBadgeClass =
  "mt-1 inline-block text-[12px] font-medium tracking-wide text-primary";
