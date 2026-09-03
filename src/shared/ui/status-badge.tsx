import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ value }: { value: string }) {
  const tone =
    value === "UP" || value === "PASSED" || value === "SUCCESS"
      ? "border-up/30 bg-up/10 text-up"
      : value === "DOWN" || value === "FAILED" || value === "ALERT"
        ? "border-down/30 bg-down/10 text-down"
        : value === "RUNNING" || value === "WARNING"
          ? "border-run/30 bg-run/10 text-run"
          : "text-muted-foreground";

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 font-mono text-[10px] uppercase tracking-[0.16em]",
        tone,
      )}
    >
      <span className="size-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
      {value}
    </Badge>
  );
}
