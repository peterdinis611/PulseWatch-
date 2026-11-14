export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (raw) return raw;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_NAME = "PulseWatch";

export const SITE_TITLE =
  "PulseWatch — monitoring for HTTP, databases, SSL, and k6 load tests";

export const SITE_DESCRIPTION =
  "PulseWatch keeps an eye on your services. It checks HTTP, Redis, databases, TCP, SSL, DNS, SMTP, Kafka, and gRPC. When something goes down, you get an alert. Test load with k6.";

export const SITE_KEYWORDS = [
  "PulseWatch",
  "service monitoring",
  "uptime monitoring",
  "HTTP monitoring",
  "SSL certificate monitoring",
  "Redis monitoring",
  "database monitoring",
  "DNS monitoring",
  "SMTP monitoring",
  "Kafka monitoring",
  "gRPC health check",
  "k6 load test",
  "load testing",
  "downtime alerts",
  "GraphQL monitoring",
  "availability monitoring",
];
