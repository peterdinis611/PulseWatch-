import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BackLink, EmptyState, PageHeader, TypeChips } from "@/shared/ui/page-header";

describe("PageHeader", () => {
  it("renders title, lede and action", () => {
    render(
      <PageHeader
        kicker="Monitors"
        title="Nine types."
        lede="HTTP and Redis."
        actions={<button type="button">New</button>}
      />,
    );
    expect(screen.getByRole("heading", { name: "Nine types." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("shows the quiet copy", () => {
    render(
      <EmptyState title="All quiet.">
        When a monitor goes down, it will show up here.
      </EmptyState>,
    );
    expect(screen.getByRole("heading", { name: "All quiet." })).toBeInTheDocument();
    expect(screen.getByText(/when a monitor goes down/i)).toBeInTheDocument();
  });
});

describe("BackLink", () => {
  it("links back with arrow label", () => {
    render(<BackLink href="/monitors">Back to monitors</BackLink>);
    const link = screen.getByRole("link", { name: /back to monitors/i });
    expect(link).toHaveAttribute("href", "/monitors");
  });
});

describe("TypeChips", () => {
  it("calls onChange when a chip is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TypeChips
        label="Status"
        options={["ALL", "UP", "DOWN"]}
        value="ALL"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "DOWN" }));
    expect(onChange).toHaveBeenCalledWith("DOWN");
  });
});
