export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (raw) return raw;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_NAME = "PulseWatch";

export const SITE_TITLE =
  "PulseWatch — monitoring HTTP, databáz, SSL a k6 záťažových testov";

export const SITE_DESCRIPTION =
  "PulseWatch stráži, či tvoje služby bežia. Kontroluje HTTP, Redis, databázy, TCP, SSL, DNS, SMTP, Kafka a gRPC. Keď niečo spadne, dostaneš upozornenie. Záťaž otestuješ cez k6.";

export const SITE_KEYWORDS = [
  "PulseWatch",
  "monitoring služieb",
  "uptime monitoring",
  "HTTP monitoring",
  "SSL certifikát monitoring",
  "Redis monitoring",
  "databázový monitoring",
  "DNS monitoring",
  "SMTP monitoring",
  "Kafka monitoring",
  "gRPC health check",
  "k6 záťažový test",
  "load testing",
  "upozornenia downtime",
  "GraphQL monitoring",
  "sledovanie dostupnosti",
];
