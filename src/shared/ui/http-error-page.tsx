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
        "relative grid min-h-svh place-items-center px-6 py-16",
        className,
      )}
    >
      <section className="animate-rise relative z-1 w-full max-w-[640px]">
        <p className="text-[13px] text-muted-foreground">{kicker}</p>
        <p
          aria-hidden
          className="mt-3 font-heading text-[clamp(88px,18vw,148px)] leading-[0.82] font-black tracking-[-0.05em] text-foreground/25"
        >
          {code}
        </p>
        <h1 className="mt-2 font-heading text-[clamp(28px,4vw,42px)] font-black tracking-[-0.04em]">
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
                <Link href="/login">Prihlásenie</Link>
              </Button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
