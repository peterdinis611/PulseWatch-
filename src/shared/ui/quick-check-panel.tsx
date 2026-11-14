import { StatusBadge } from "@/shared/ui/status-badge";
import { formatAgo, formatMs } from "@/shared/lib/format";
import type { MonitorCheckResult } from "@/shared/lib/types";
import { monoClass } from "@/shared/ui/list";
import { cn } from "@/lib/utils";

export function QuickCheckPanel({
  result,
  draft = false,
  className,
}: {
  result: MonitorCheckResult;
  draft?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "animate-rise mb-6 rounded-lg border px-4 py-4 md:px-5",
        result.status === "UP"
          ? "border-up/35 bg-transparent"
          : result.status === "DOWN"
            ? "border-down/35 bg-transparent"
            : "border-border bg-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] text-muted-foreground">
            {draft ? "Quick check" : "Check"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <StatusBadge value={result.status} />
            <span className={monoClass}>{formatMs(result.latencyMs)}</span>
            <span className={monoClass}>{formatAgo(result.checkedAt)}</span>
          </div>
        </div>
        {draft ? (
          <p className="max-w-[28ch] text-sm text-muted-foreground">
            This result is not saved. Save the monitor to apply the new configuration.
          </p>
        ) : null}
      </div>
      {result.error ? (
        <p className="mt-3 font-mono text-xs text-down">{result.error}</p>
      ) : null}
    </section>
  );
}
