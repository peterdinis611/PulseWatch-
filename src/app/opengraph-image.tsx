import { ImageResponse } from "next/og";

export const alt =
  "PulseWatch — monitoring služieb, SSL certifikátov a k6 záťažových testov";
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
          backgroundColor: "#07080c",
          color: "#f3efe4",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 18,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#e8ff47",
          }}
        >
          Uptime · SSL · k6
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: -5,
              lineHeight: 0.9,
            }}
          >
            pulse
          </div>
          <div
            style={{
              fontSize: 72,
              fontStyle: "italic",
              color: "#e8ff47",
              letterSpacing: -3,
            }}
          >
            watch
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#9a9588",
            maxWidth: 820,
            lineHeight: 1.35,
          }}
        >
          Vidíš, či HTTP, databáza, Redis alebo certifikát ešte žijú. Skôr, ako
          to napíše zákazník.
        </div>
      </div>
    ),
    size,
  );
}
