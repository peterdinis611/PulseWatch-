import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState, PageHeader } from "@/shared/ui/page-header";

describe("PageHeader", () => {
  it("renders kicker, title and action", () => {
    render(
      <PageHeader
        kicker="Monitory"
        title="Deväť typov."
        lede="HTTP aj Redis."
        actions={<button type="button">Nový</button>}
      />,
    );
    expect(screen.getByText("Monitory")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Deväť typov." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nový" })).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("shows the quiet copy", () => {
    render(
      <EmptyState title="Ticho.">
        Keď monitor padne, príde to sem.
      </EmptyState>,
    );
    expect(screen.getByRole("heading", { name: "Ticho." })).toBeInTheDocument();
    expect(screen.getByText(/keď monitor padne/i)).toBeInTheDocument();
  });
});
