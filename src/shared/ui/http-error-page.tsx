import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HttpErrorPage({
  code,
  kicker,
  title,
  description,
  actions,
  className,
}: {
  code: string;
  kicker: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "relative grid min-h-svh place-items-center overflow-hidden px-6 py-16",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--primary)_12%,transparent),transparent_55%),radial-gradient(ellipse_at_90%_100%,color-mix(in_srgb,var(--down)_10%,transparent),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[18%] left-[8%] h-px w-[min(420px,70vw)] rotate-[-18deg] bg-gradient-to-r from-transparent via-primary/35 to-transparent"
      />

      <section className="animate-rise relative z-1 w-full max-w-[640px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          {kicker}
        </p>
        <p
          aria-hidden
          className="mt-3 font-heading text-[clamp(88px,18vw,148px)] leading-[0.82] font-extrabold tracking-[-0.08em] text-transparent bg-clip-text bg-[linear-gradient(180deg,var(--foreground)_0%,color-mix(in_srgb,var(--foreground)_35%,transparent)_100%)]"
        >
          {code}
        </p>
        <h1 className="mt-2 font-heading text-[clamp(28px,4vw,42px)] leading-[0.95] tracking-[-0.06em]">
          {title}
        </h1>
        <p className="mt-4 max-w-[46ch] text-[18px] text-muted-foreground">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {actions ?? (
            <>
              <Button asChild size="lg">
                <Link href="/">Domov</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/vstup">Vstup</Link>
              </Button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
