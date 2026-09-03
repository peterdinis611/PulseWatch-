"use client";

import { useRouter } from "next/navigation";
import type { Monitor } from "@/shared/lib/types";

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 33 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

function colorFor(status: Monitor["lastStatus"]) {
  if (status === "UP") return "var(--up)";
  if (status === "DOWN") return "var(--down)";
  return "var(--muted-foreground)";
}

export function Constellation({ monitors }: { monitors: Monitor[] }) {
  const router = useRouter();
  const source =
    monitors.length > 0
      ? monitors
      : [{ id: "idle", name: "žiadny monitor", lastStatus: "UNKNOWN" as const }];

  const points = source.map((monitor, index, all) => {
    const t = all.length === 1 ? 0.5 : index / (all.length - 1);
    const jitter = (hash(monitor.id) % 36) - 18;
    return {
      id: monitor.id,
      name: "name" in monitor ? monitor.name : "idle",
      x: 70 + t * 860,
      y: 110 + Math.sin(t * Math.PI) * -48 + jitter,
      status: monitor.lastStatus,
    };
  });

  return (
    <svg
      className="block h-[220px] w-full"
      viewBox="0 0 1000 220"
      role="img"
      aria-label="Stav monitorov"
    >
      {points.slice(1).map((point, i) => (
        <line
          key={`${point.id}-line`}
          x1={points[i].x}
          y1={points[i].y}
          x2={point.x}
          y2={point.y}
          stroke="rgba(243,239,228,0.16)"
          strokeWidth="1"
        />
      ))}
      {points.map((point) => (
        <g
          key={point.id}
          className={
            monitors.length
              ? "cursor-pointer outline-none focus-visible:[&_circle]:stroke-primary focus-visible:[&_circle]:stroke-2"
              : undefined
          }
          tabIndex={monitors.length && point.id !== "idle" ? 0 : undefined}
          onClick={() => {
            if (point.id !== "idle") router.push(`/monitors/${point.id}`);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && point.id !== "idle") {
              router.push(`/monitors/${point.id}`);
            }
          }}
        >
          <title>{`${point.name} · ${point.status}`}</title>
          <circle
            cx={point.x}
            cy={point.y}
            r="16"
            fill={colorFor(point.status)}
            opacity="0.16"
          />
          <circle
            cx={point.x}
            cy={point.y}
            r="5"
            fill={colorFor(point.status)}
          />
          <text
            x={point.x}
            y={point.y + 28}
            textAnchor="middle"
            fill="rgba(243,239,228,0.55)"
            fontSize="11"
            fontFamily="Azeret Mono, monospace"
          >
            {point.name.slice(0, 16)}
          </text>
        </g>
      ))}
    </svg>
  );
}
