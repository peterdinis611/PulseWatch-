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
          Vidíš, či HTTP, databáza, Redis alebo certifikát ešte žijú. Skôr, ako
          to napíše zákazník.
        </div>
      </div>
    ),
    size,
  );
}
