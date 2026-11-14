import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingConstellation } from "@/features/marketing/LandingConstellation";

describe("LandingConstellation", () => {
  it("exposes the nine monitor types to assistive tech", () => {
    render(<LandingConstellation />);
    expect(
      screen.getByRole("img", { name: /nine pulsewatch monitor types/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("HTTP")).toBeInTheDocument();
    expect(screen.getByText("gRPC")).toBeInTheDocument();
    expect(screen.getByText("Database")).toBeInTheDocument();
  });
});
