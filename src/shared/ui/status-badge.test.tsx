import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "@/shared/ui/status-badge";

describe("StatusBadge", () => {
  it("uses up tone for UP and PASSED", () => {
    const { rerender } = render(<StatusBadge value="UP" />);
    expect(screen.getByText("UP").className).toContain("text-up");
    rerender(<StatusBadge value="PASSED" />);
    expect(screen.getByText("PASSED").className).toContain("text-up");
  });

  it("uses down tone for DOWN and ALERT", () => {
    render(<StatusBadge value="DOWN" />);
    expect(screen.getByText("DOWN").className).toContain("text-down");
  });

  it("uses run tone for RUNNING", () => {
    render(<StatusBadge value="RUNNING" />);
    expect(screen.getByText("RUNNING").className).toContain("text-run");
  });
});
