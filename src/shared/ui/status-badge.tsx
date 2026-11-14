import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function iconFor(value: string) {
  if (value === "UP" || value === "PASSED" || value === "SUCCESS") {
    return CheckCircle2;
  }
  if (value === "DOWN" || value === "FAILED" || value === "ALERT") {
    return XCircle;
  }
  if (value === "RUNNING") {
    return LoaderCircle;
  }
  if (value === "WARNING") {
    return AlertTriangle;
  }
  return CircleHelp;
}

export function StatusBadge({ value }: { value: string }) {
  const Icon = iconFor(value);
  const tone =
    value === "UP" || value === "PASSED" || value === "SUCCESS"
      ? "border-up/35 bg-up/5 text-up"
      : value === "DOWN" || value === "FAILED" || value === "ALERT"
        ? "border-down/35 bg-down/5 text-down"
        : value === "RUNNING" || value === "WARNING"
          ? "border-run/35 bg-run/5 text-run"
          : "border-border bg-muted/40 text-muted-foreground";

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1.5 rounded-md font-mono text-[11px] font-medium tracking-wide",
        tone,
      )}
    >
      <Icon
        className={cn("size-3", value === "RUNNING" && "animate-spin")}
      />
      {value}
    </Badge>
  );
}
