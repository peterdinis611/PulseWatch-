import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BackLink, EmptyState, PageHeader, TypeChips } from "@/shared/ui/page-header";

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

describe("BackLink", () => {
  it("links back with arrow label", () => {
    render(<BackLink href="/monitors">Späť na monitory</BackLink>);
    const link = screen.getByRole("link", { name: /späť na monitory/i });
    expect(link).toHaveAttribute("href", "/monitors");
  });
});

describe("TypeChips", () => {
  it("calls onChange when a chip is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TypeChips
        label="Stav"
        options={["ALL", "UP", "DOWN"]}
        value="ALL"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "DOWN" }));
    expect(onChange).toHaveBeenCalledWith("DOWN");
  });
});
