const STARS = [
  { id: "http", name: "HTTP", status: "UP" as const, x: 70, y: 118 },
  { id: "redis", name: "Redis", status: "UP" as const, x: 175, y: 72 },
  { id: "db", name: "Databáza", status: "DOWN" as const, x: 290, y: 128 },
  { id: "tcp", name: "TCP", status: "UP" as const, x: 400, y: 64 },
  { id: "ssl", name: "SSL", status: "UP" as const, x: 505, y: 122 },
  { id: "dns", name: "DNS", status: "UP" as const, x: 615, y: 70 },
  { id: "smtp", name: "SMTP", status: "UNKNOWN" as const, x: 720, y: 130 },
  { id: "kafka", name: "Kafka", status: "UP" as const, x: 830, y: 78 },
  { id: "grpc", name: "gRPC", status: "UP" as const, x: 930, y: 118 },
];

function colorFor(status: "UP" | "DOWN" | "UNKNOWN") {
  if (status === "UP") return "var(--up)";
  if (status === "DOWN") return "var(--down)";
  return "var(--muted-foreground)";
}

export function LandingConstellation() {
  return (
    <svg
      className="block h-[240px] w-full"
      viewBox="0 0 1000 220"
      role="img"
      aria-labelledby="constellation-title constellation-desc"
    >
      <title id="constellation-title">Deväť typov monitorov PulseWatch</title>
      <desc id="constellation-desc">
        Konštelácia ukazuje HTTP, Redis, databázu, TCP, SSL, DNS, SMTP, Kafka a
        gRPC. Zelená je hore, červená dole.
      </desc>
      {STARS.slice(1).map((star, i) => (
        <line
          key={`${star.id}-line`}
          x1={STARS[i].x}
          y1={STARS[i].y}
          x2={star.x}
          y2={star.y}
          stroke="rgba(243,239,228,0.16)"
          strokeWidth="1"
        />
      ))}
      {STARS.map((star) => (
        <g key={star.id}>
          <circle
            cx={star.x}
            cy={star.y}
            r="16"
            fill={colorFor(star.status)}
            opacity="0.16"
          />
          <circle
            cx={star.x}
            cy={star.y}
            r="5"
            fill={colorFor(star.status)}
          />
          <text
            x={star.x}
            y={star.y + 28}
            textAnchor="middle"
            fill="rgba(243,239,228,0.62)"
            fontSize="11"
            fontFamily="Azeret Mono, ui-monospace, monospace"
          >
            {star.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
