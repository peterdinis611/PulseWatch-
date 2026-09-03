import { cn } from "@/lib/utils";

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
