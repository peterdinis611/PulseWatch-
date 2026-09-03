"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Constellation } from "@/features/desk/Constellation";
import { MonitorList } from "@/features/monitors/MonitorList";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/shared/ui/page-header";
import { usePoll } from "@/shared/hooks/usePoll";
import { gql } from "@/shared/graphql/client";
import { STRESS_TESTS_QUERY } from "@/shared/graphql/documents";
import type { StressTest } from "@/shared/lib/types";
import { useSession } from "@/shared/session";
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
      <div className="-mt-2 mb-2">
        <Constellation monitors={monitors} />
      </div>
      <section className="mb-7 grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
        <button
          type="button"
          className="animate-rise rounded-[18px] border border-border bg-card/70 px-[18px] py-4 text-left transition-colors hover:border-primary/40"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in srgb, var(--primary) 16%, transparent), transparent 55%), color-mix(in srgb, var(--card) 70%, transparent)",
          }}
          onClick={() => router.push("/monitors")}
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Hore
          </span>
          <b className="mt-2 block font-heading text-[40px] leading-[0.9] tracking-[-0.07em]">
            {up}
            <span className="text-[20px] text-muted-foreground">
              {" "}
              / {monitors.length}
            </span>
          </b>
        </button>
        <button
          type="button"
          className="animate-rise rounded-[18px] border border-border bg-card/70 px-[18px] py-4 text-left transition-colors hover:border-primary/40"
          onClick={() => {
            if (downMonitors[0]) router.push(`/monitors/${downMonitors[0].id}`);
            else router.push("/monitors");
          }}
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Dole
          </span>
          <b
            className={cn(
              "mt-2 block font-heading text-[40px] leading-[0.9] tracking-[-0.07em]",
              down && "text-down",
            )}
          >
            {down}
          </b>
        </button>
        <button
          type="button"
          className="animate-rise rounded-[18px] border border-border bg-card/70 px-[18px] py-4 text-left transition-colors hover:border-primary/40"
          onClick={() => router.push("/load")}
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            k6 beží
          </span>
          <b className="mt-2 block font-heading text-[40px] leading-[0.9] tracking-[-0.07em]">
            {running}
          </b>
        </button>
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
        <>
          <MonitorList
            monitors={
              downMonitors.length > 0 ? downMonitors : monitors.slice(0, 6)
            }
          />
          {monitors.length > 6 ? (
            <p className="mt-[18px]">
              <Button asChild variant="outline">
                <Link href="/monitors">Všetky monitory</Link>
              </Button>
            </p>
          ) : null}
        </>
      )}
    </>
  );
}
