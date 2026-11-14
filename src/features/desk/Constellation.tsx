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

const STAR_FIELD = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  x: (hash(`star-x-${index}`) % 980) + 10,
  y: (hash(`star-y-${index}`) % 200) + 10,
  r: (hash(`star-r-${index}`) % 3) * 0.35 + 0.45,
  opacity: 0.08 + (hash(`star-o-${index}`) % 20) / 100,
}));

export function Constellation({ monitors }: { monitors: Monitor[] }) {
  const router = useRouter();
  const source =
    monitors.length > 0
      ? monitors
      : [{ id: "idle", name: "no monitors", lastStatus: "UNKNOWN" as const }];

  const points = source.map((monitor, index, all) => {
    const t = all.length === 1 ? 0.5 : index / (all.length - 1);
    const jitter = (hash(monitor.id) % 36) - 18;
    return {
      id: monitor.id,
      name: "name" in monitor ? monitor.name : "idle",
      x: all.length === 1 ? 500 : 70 + t * 860,
      y: all.length === 1 ? 112 : 118 + Math.sin(t * Math.PI) * -52 + jitter,
      status: monitor.lastStatus,
    };
  });

  return (
    <svg
      className="block h-[min(220px,32vw)] min-h-[180px] w-full max-w-full"
      viewBox="0 0 1000 240"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Monitor status constellation"
    >
      <defs>
        <radialGradient id="constellation-vignette" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="rgba(90,155,252,0.07)" />
          <stop offset="100%" stopColor="rgba(10,13,20,0)" />
        </radialGradient>
      </defs>

      <rect width="1000" height="240" fill="url(#constellation-vignette)" />

      {STAR_FIELD.map((star) => (
        <circle
          key={star.id}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="rgba(233,237,243,0.85)"
          opacity={star.opacity}
        />
      ))}

      <path
        d="M 40 168 Q 500 128 960 168"
        fill="none"
        stroke="rgba(243,239,228,0.08)"
        strokeWidth="1"
        strokeDasharray="4 10"
      />

      {points.slice(1).map((point, i) => (
        <line
          key={`${point.id}-line`}
          x1={points[i].x}
          y1={points[i].y}
          x2={point.x}
          y2={point.y}
          stroke="rgba(233,237,243,0.12)"
          strokeWidth="1"
        />
      ))}

      {points.map((point) => {
        const interactive = monitors.length > 0 && point.id !== "idle";
        const tone = colorFor(point.status);

        return (
          <g
            key={point.id}
            className={
              interactive
                ? "cursor-pointer outline-none focus-visible:[&_circle:nth-of-type(2)]:stroke-primary focus-visible:[&_circle:nth-of-type(2)]:stroke-[2.5]"
                : undefined
            }
            tabIndex={interactive ? 0 : undefined}
            onClick={() => {
              if (interactive) router.push(`/monitors/${point.id}`);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && interactive) {
                router.push(`/monitors/${point.id}`);
              }
            }}
          >
            <title>{`${point.name} · ${point.status}`}</title>
            <circle cx={point.x} cy={point.y} r="18" fill={tone} opacity="0.12" />
            <circle cx={point.x} cy={point.y} r="5" fill={tone} />
            <circle
              cx={point.x}
              cy={point.y}
              r="10"
              fill="none"
              stroke={tone}
              strokeOpacity="0.4"
              strokeWidth="1"
            />
            <text
              x={point.x}
              y={point.y + 32}
              textAnchor="middle"
              fill="rgba(233,237,243,0.7)"
              fontSize="12"
              fontFamily="var(--font-body), Epilogue, sans-serif"
            >
              {point.name.slice(0, 18)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
