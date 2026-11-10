import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ value }: { value: string }) {
  const tone =
    value === "UP" || value === "PASSED" || value === "SUCCESS"
      ? "border-up/35 text-up"
      : value === "DOWN" || value === "FAILED" || value === "ALERT"
        ? "border-down/35 text-down"
        : value === "RUNNING" || value === "WARNING"
          ? "border-run/35 text-run"
          : "text-muted-foreground";

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1.5 rounded-md bg-transparent font-mono text-[11px] font-medium tracking-wide",
        tone,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {value}
    </Badge>
  );
}
