"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "#0a0d14",
          color: "#e9edf3",
          fontFamily: "Epilogue, system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: "640px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#5a9bfc",
            }}
          >
            Critical failure
          </p>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: "clamp(88px, 18vw, 148px)",
              lineHeight: 0.82,
              fontWeight: 900,
              letterSpacing: "-0.05em",
            }}
          >
            500
          </p>
          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "clamp(28px, 4vw, 42px)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              fontWeight: 900,
            }}
          >
            The app crashed.
          </h1>
          <p style={{ margin: "16px 0 0", color: "#8891a1", fontSize: "18px" }}>
            The root layout failed to load. Try reloading the page.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "32px" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "10px 18px",
                background: "#5a9bfc",
                color: "#0a0d14",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                borderRadius: "8px",
                padding: "10px 18px",
                border: "1px solid rgba(233,237,243,0.2)",
                color: "#e9edf3",
                textDecoration: "none",
              }}
            >
              Home
            </a>
          </div>
          {error.digest ? (
            <p style={{ marginTop: "24px", color: "#8891a1", fontSize: "12px" }}>
              Digest: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
