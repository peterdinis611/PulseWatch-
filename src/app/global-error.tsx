"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="sk">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "#07080c",
          color: "#f3efe4",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: "640px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#e8ff47",
            }}
          >
            Kritický výpadok
          </p>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: "clamp(88px, 18vw, 148px)",
              lineHeight: 0.82,
              fontWeight: 800,
              letterSpacing: "-0.08em",
            }}
          >
            500
          </p>
          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "clamp(28px, 4vw, 42px)",
              lineHeight: 0.95,
              letterSpacing: "-0.06em",
            }}
          >
            Aplikácia spadla.
          </h1>
          <p style={{ margin: "16px 0 0", color: "#9a9588", fontSize: "18px" }}>
            Root layout sa nepodarilo načítať. Skús obnoviť stránku.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "32px" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: "none",
                borderRadius: "999px",
                padding: "10px 18px",
                background: "#e8ff47",
                color: "#14160a",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Skúsiť znova
            </button>
            <a
              href="/"
              style={{
                borderRadius: "999px",
                padding: "10px 18px",
                border: "1px solid rgba(243,239,228,0.2)",
                color: "#f3efe4",
                textDecoration: "none",
              }}
            >
              Domov
            </a>
          </div>
          {error.digest ? (
            <p style={{ marginTop: "24px", color: "#9a9588", fontSize: "12px" }}>
              Digest: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
