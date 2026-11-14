/**
 * Animated desk PC for the landing hero — industrial monitoring aesthetic.
 * Pure SVG + CSS classes in globals.css; respects prefers-reduced-motion.
 */
export function HeroDeskScene({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden data-hero-desk>
      <svg
        viewBox="0 0 640 480"
        className="h-full w-full overflow-visible"
        fill="none"
      >
        <defs>
          <linearGradient id="hd-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#12151c" />
            <stop offset="100%" stopColor="#0a0c10" />
          </linearGradient>
          <linearGradient id="hd-bezel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2a303b" />
            <stop offset="100%" stopColor="#151820" />
          </linearGradient>
          <linearGradient id="hd-desk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1e27" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0d1016" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hd-glow" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
          <clipPath id="hd-clip">
            <rect x="118" y="58" width="404" height="248" rx="4" />
          </clipPath>
        </defs>

        <ellipse
          className="hd-bloom"
          cx="320"
          cy="200"
          rx="220"
          ry="140"
          fill="url(#hd-glow)"
        />

        <path
          d="M40 390 L600 390 L560 455 L80 455 Z"
          fill="url(#hd-desk)"
          opacity="0.85"
        />
        <line
          x1="60"
          y1="392"
          x2="580"
          y2="392"
          stroke="var(--border)"
          strokeWidth="1"
        />

        <path
          d="M292 340 L348 340 L368 390 L272 390 Z"
          fill="#151820"
          stroke="#2a303b"
          strokeWidth="1"
        />
        <rect x="250" y="388" width="140" height="10" rx="2" fill="#1c212b" />
        <rect x="238" y="396" width="164" height="6" rx="2" fill="#12151c" />

        <rect
          x="100"
          y="40"
          width="440"
          height="300"
          rx="14"
          fill="url(#hd-bezel)"
          stroke="#3a4250"
          strokeWidth="1.5"
        />
        <rect
          x="118"
          y="58"
          width="404"
          height="248"
          rx="4"
          fill="url(#hd-screen)"
        />

        <circle cx="320" cy="48" r="2.5" fill="#4a5568" />
        <circle className="hd-led" cx="508" cy="328" r="3" fill="var(--up)" />

        <g clipPath="url(#hd-clip)">
          <rect
            className="hd-scan"
            x="118"
            y="58"
            width="404"
            height="36"
            fill="var(--primary)"
            opacity="0.06"
          />

          <rect x="118" y="58" width="404" height="28" fill="#0e1117" />
          <text
            x="132"
            y="77"
            fill="var(--foreground)"
            fontFamily="var(--font-heading), Epilogue, sans-serif"
            fontSize="11"
            fontWeight="800"
            letterSpacing="-0.04em"
          >
            PulseWatch
          </text>
          <circle
            className="hd-pulse"
            cx="494"
            cy="72"
            r="3.5"
            fill="var(--up)"
          />
          <text
            x="478"
            y="76"
            textAnchor="end"
            fill="var(--muted-foreground)"
            fontFamily="var(--font-mono), ui-monospace, monospace"
            fontSize="9"
          >
            LIVE
          </text>

          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x="132"
              y={102 + i * 28}
              width="52"
              height="10"
              rx="2"
              fill="#1a1f29"
            />
          ))}

          <rect
            x="204"
            y="98"
            width="300"
            height="120"
            rx="3"
            fill="#0c0f14"
            stroke="#1e2430"
          />
          {[0, 1, 2, 3].map((i) => (
            <line
              key={`g-${i}`}
              x1="212"
              x2="496"
              y1={122 + i * 24}
              y2={122 + i * 24}
              stroke="#1e2430"
              strokeDasharray="3 4"
            />
          ))}
          <path
            className="hd-wave"
            d="M212 178 C240 150, 268 200, 296 160 S352 120, 380 155 S436 190, 464 148 S496 130, 496 130"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            className="hd-wave-fill"
            d="M212 178 C240 150, 268 200, 296 160 S352 120, 380 155 S436 190, 464 148 S496 130, 496 130 L496 206 L212 206 Z"
            fill="var(--primary)"
            opacity="0.12"
          />

          <StatusRow x={204} y={232} label="api.prod" status="up" delay={0} />
          <StatusRow x={350} y={232} label="redis" status="up" delay={1} />
          <StatusRow x={204} y={262} label="postgres" status="down" delay={2} />
          <StatusRow x={350} y={262} label="edge-cdn" status="up" delay={3} />
        </g>

        <g className="hd-keys">
          <rect
            x="190"
            y="412"
            width="260"
            height="28"
            rx="4"
            fill="#161a22"
            stroke="#2a303b"
          />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x={200 + i * 20}
              y={418}
              width="14"
              height="8"
              rx="1"
              fill="#222833"
            />
          ))}
          <rect x={248} y={430} width="100" height="6" rx="1" fill="#222833" />
        </g>

        <ellipse
          cx="490"
          cy="426"
          rx="18"
          ry="12"
          fill="#161a22"
          stroke="#2a303b"
        />
        <line x1="490" y1="416" x2="490" y2="430" stroke="#2a303b" />
      </svg>
    </div>
  );
}

function StatusRow({
  x,
  y,
  label,
  status,
  delay,
}: {
  x: number;
  y: number;
  label: string;
  status: "up" | "down";
  delay: number;
}) {
  const color = status === "up" ? "var(--up)" : "var(--down)";
  return (
    <g>
      <circle
        className={`hd-dot hd-dot-${delay}`}
        cx={x + 8}
        cy={y + 6}
        r={3.5}
        fill={color}
      />
      <text
        x={x + 18}
        y={y + 10}
        fill="var(--muted-foreground)"
        fontFamily="var(--font-mono), ui-monospace, monospace"
        fontSize="10"
      >
        {label}
      </text>
      <text
        x={x + 118}
        y={y + 10}
        fill={color}
        fontFamily="var(--font-mono), ui-monospace, monospace"
        fontSize="9"
        fontWeight="600"
      >
        {status === "up" ? "UP" : "DOWN"}
      </text>
    </g>
  );
}
