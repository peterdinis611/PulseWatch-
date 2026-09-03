"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Zap } from "lucide-react";
import { Constellation } from "@/features/desk/Constellation";
import { MonitorList } from "@/features/monitors/MonitorList";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/shared/ui/page-header";
import { usePoll } from "@/shared/hooks/usePoll";
import { gql } from "@/shared/graphql/client";
import { STRESS_TESTS_QUERY } from "@/shared/graphql/documents";
import type { StressTest } from "@/shared/lib/types";
import { useSession } from "@/shared/session";
import { listPanelClass } from "@/shared/ui/list";
import { cn } from "@/lib/utils";

export default function DeskPage() {
  const router = useRouter();
  const { monitors } = useSession();
  const { data } = usePoll(
    () => gql<{ stressTests: StressTest[] }>(STRESS_TESTS_QUERY),
    8000,
  );
  const loads = data?.stressTests ?? [];
  const up = monitors.filter((m) => m.lastStatus === "UP").length;
  const down = monitors.filter((m) => m.lastStatus === "DOWN").length;
  const running = loads.filter((t) => t.lastStatus === "RUNNING").length;
  const downMonitors = monitors.filter((m) => m.lastStatus === "DOWN");
  const previewMonitors =
    downMonitors.length > 0 ? downMonitors : monitors.slice(0, 6);

  return (
    <>
      <PageHeader
        kicker="Prehľad"
        title="Čo je hore."
        lede="Bod v konštelácii je monitor. Klikni naň, alebo prejdi do zoznamu."
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/monitors/new">Nový monitor</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/load/new">Nová záťaž</Link>
            </Button>
          </>
        }
      />

      <section
        className={cn(
          listPanelClass("animate-rise mb-8"),
          "shadow-[0_28px_90px_rgba(0,0,0,0.34)]",
        )}
      >
        <div className="relative overflow-hidden px-1 pt-1 pb-0 md:px-3">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_62%)]"
          />
          <Constellation monitors={monitors} />
        </div>

        <div className="grid grid-cols-1 gap-px border-t border-border/60 bg-border/40 md:grid-cols-[1.35fr_1fr_1fr]">
          <DeskStatCard
            label="Hore"
            value={up}
            suffix={`/ ${monitors.length}`}
            tone="up"
            icon={ArrowUpRight}
            delay={0}
            onClick={() => router.push("/monitors")}
          />
          <DeskStatCard
            label="Dole"
            value={down}
            tone={down ? "down" : "muted"}
            icon={ArrowDownRight}
            delay={1}
            onClick={() => {
              if (downMonitors[0]) router.push(`/monitors/${downMonitors[0].id}`);
              else router.push("/monitors");
            }}
          />
          <DeskStatCard
            label="k6 beží"
            value={running}
            tone="run"
            icon={Zap}
            delay={2}
            onClick={() => router.push("/load")}
          />
        </div>
      </section>

      {monitors.length === 0 ? (
        <EmptyState
          title="Zatiaľ ticho."
          action={
            <Button asChild size="lg">
              <Link href="/monitors/new">Pridať monitor</Link>
            </Button>
          }
        >
          Pridaj HTTP monitor na službu, ktorú chceš vidieť v konštelácii.
        </EmptyState>
      ) : (
        <MonitorList
          monitors={previewMonitors}
          variant="preview"
          previewKicker={downMonitors.length > 0 ? "Pozor" : "Na rade"}
          previewTitle={
            downMonitors.length > 0 ? "Monitory dole" : "Posledné kontroly"
          }
          showAllHref={monitors.length > 6 ? "/monitors" : undefined}
        />
      )}
    </>
  );
}

function DeskStatCard({
  label,
  value,
  suffix,
  tone,
  icon: Icon,
  delay,
  onClick,
}: {
  label: string;
  value: number;
  suffix?: string;
  tone: "up" | "down" | "run" | "muted";
  icon: typeof ArrowUpRight;
  delay: number;
  onClick: () => void;
}) {
  const toneStyles = {
    up: {
      chip: "text-up border-up/25 bg-up/10",
      glow: "from-up/14 via-up/4 to-transparent",
      value: "text-foreground",
    },
    down: {
      chip: "text-down border-down/25 bg-down/10",
      glow: "from-down/16 via-down/5 to-transparent",
      value: "text-down",
    },
    run: {
      chip: "text-run border-run/25 bg-run/10",
      glow: "from-run/14 via-run/4 to-transparent",
      value: "text-foreground",
    },
    muted: {
      chip: "text-muted-foreground border-border/70 bg-background/35",
      glow: "from-foreground/6 via-transparent to-transparent",
      value: "text-foreground",
    },
  }[tone];

  return (
    <button
      type="button"
      className={cn(
        "animate-rise group relative overflow-hidden bg-card/80 px-5 py-5 text-left transition-[background-color,transform] duration-300 hover:bg-card",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
      )}
      style={{ animationDelay: `${delay * 70}ms` }}
      onClick={onClick}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          toneStyles.glow,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]",
            toneStyles.chip,
          )}
        >
          <Icon className="size-3" aria-hidden />
          {label}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          Otvoriť
        </span>
      </div>
      <b
        className={cn(
          "relative mt-3 block font-heading text-[clamp(36px,4vw,46px)] leading-[0.88] tracking-[-0.08em]",
          toneStyles.value,
        )}
      >
        {value}
        {suffix ? (
          <span className="text-[22px] text-muted-foreground">{suffix}</span>
        ) : null}
      </b>
    </button>
  );
}
