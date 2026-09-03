import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MonitorList } from "@/features/monitors/MonitorList";
import { mockMonitor } from "@tests/fixtures";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

describe("MonitorList", () => {
  const monitors = [
    mockMonitor(),
    mockMonitor({
      id: "m2",
      name: "Redis",
      type: "REDIS",
      lastStatus: "DOWN",
      config: { host: "redis.local", port: 6379 },
    }),
    mockMonitor({
      id: "m3",
      name: "Mystery",
      lastStatus: "UNKNOWN",
      config: {},
    }),
  ];

  it("filters by search query and status chips", async () => {
    const user = userEvent.setup();

    render(<MonitorList monitors={monitors} filterable />);

    expect(screen.getByText("Pdf App")).toBeInTheDocument();
    expect(screen.getByText("Redis")).toBeInTheDocument();

    await user.type(
      screen.getAllByPlaceholderText(/hľadať názov/i)[0],
      "redis",
    );
    expect(screen.queryByText("Pdf App")).not.toBeInTheDocument();
    expect(screen.getByText("Redis")).toBeInTheDocument();

    await user.clear(screen.getAllByPlaceholderText(/hľadať názov/i)[0]);
    await user.click(screen.getByRole("radio", { name: "DOWN" }));

    expect(screen.getByText("Redis")).toBeInTheDocument();
    expect(screen.queryByText("Pdf App")).not.toBeInTheDocument();
    expect(screen.queryByText("Mystery")).not.toBeInTheDocument();
  });

  it("shows stat pills and count in fleet mode", () => {
    render(<MonitorList monitors={monitors} filterable />);

    expect(screen.getByText("3 / 3")).toBeInTheDocument();
    expect(screen.getAllByText("Hore").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dole").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Neznáme").length).toBeGreaterThan(0);
  });

  it("renders preview header and link to all monitors", () => {
    render(
      <MonitorList
        monitors={monitors.slice(0, 2)}
        variant="preview"
        previewKicker="Na rade"
        previewTitle="Posledné kontroly"
      />,
    );

    expect(screen.getByText("Na rade")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Posledné kontroly" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /všetky monitory/i }),
    ).toHaveAttribute("href", "/monitors");
  });

  it("shows empty filter message when nothing matches", async () => {
    const user = userEvent.setup();

    render(<MonitorList monitors={monitors} filterable />);
    await user.type(
      screen.getAllByPlaceholderText(/hľadať názov/i)[0],
      "kafka-neexistuje",
    );

    expect(screen.getByText("Nič nesedí na filter.")).toBeInTheDocument();
  });
});
