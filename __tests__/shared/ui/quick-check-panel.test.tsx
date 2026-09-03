import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuickCheckPanel } from "@/shared/ui/quick-check-panel";

describe("QuickCheckPanel", () => {
  it("shows draft probe result", () => {
    render(
      <QuickCheckPanel
        draft
        result={{
          status: "UP",
          error: null,
          latencyMs: 128,
          checkedAt: "2026-09-03T12:00:00.000Z",
        }}
      />,
    );

    expect(screen.getByText("Rýchla kontrola")).toBeInTheDocument();
    expect(screen.getByText("UP")).toBeInTheDocument();
    expect(screen.getByText("128 ms")).toBeInTheDocument();
    expect(
      screen.getByText(/výsledok sa neukladá/i),
    ).toBeInTheDocument();
  });
});
