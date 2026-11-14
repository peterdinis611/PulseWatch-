import { ImageResponse } from "next/og";

export const alt =
  "PulseWatch — monitoring for services, SSL certificates, and k6 load tests";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#0a0d14",
          color: "#e9edf3",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 18,
            color: "#5a9bfc",
          }}
        >
          Uptime · SSL · k6
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: -5,
            lineHeight: 0.9,
          }}
        >
          PulseWatch
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#8891a1",
            maxWidth: 820,
            lineHeight: 1.35,
          }}
        >
          See whether your HTTP endpoint, database, Redis, or certificate is
          still alive. Before a customer tells you.
        </div>
      </div>
    ),
    size,
  );
}
