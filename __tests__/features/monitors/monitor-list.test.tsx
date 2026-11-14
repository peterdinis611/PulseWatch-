import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MonitorList } from "@/features/monitors/MonitorList";
import { mockMonitor } from "@tests/fixtures";

const replace = vi.fn();
const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace, back: vi.fn() }),
  useSearchParams: () => searchParams,
}));

vi.mock("@/shared/session", () => ({
  useSession: () => ({
    refresh: vi.fn(),
    monitors: [],
    ready: true,
    token: "t",
    user: null,
    unread: 0,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("@/features/monitors/FleetBanner", () => ({
  FleetBanner: () => <div data-testid="fleet-banner">Fleet 24h</div>,
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

  it("filters by monitor type", async () => {
    const user = userEvent.setup();

    render(<MonitorList monitors={monitors} filterable />);
    await user.selectOptions(screen.getByLabelText("Type"), "REDIS");

    expect(screen.getByText("Redis")).toBeInTheDocument();
    expect(screen.queryByText("Pdf App")).not.toBeInTheDocument();
  });

  it("filters by search query and status chips", async () => {
    const user = userEvent.setup();

    render(<MonitorList monitors={monitors} filterable />);

    expect(screen.getByText("Pdf App")).toBeInTheDocument();
    expect(screen.getByText("Redis")).toBeInTheDocument();

    await user.type(
      screen.getAllByPlaceholderText(/search name/i)[0],
      "redis",
    );
    expect(screen.queryByText("Pdf App")).not.toBeInTheDocument();
    expect(screen.getByText("Redis")).toBeInTheDocument();

    await user.clear(screen.getAllByPlaceholderText(/search name/i)[0]);
    await user.click(screen.getByRole("radio", { name: "DOWN" }));

    expect(screen.getByText("Redis")).toBeInTheDocument();
    expect(screen.queryByText("Pdf App")).not.toBeInTheDocument();
    expect(screen.queryByText("Mystery")).not.toBeInTheDocument();
  });

  it("shows status facets with counts and fleet strip", () => {
    render(<MonitorList monitors={monitors} filterable />);

    expect(screen.getByText("3 / 3")).toBeInTheDocument();
    expect(screen.getByTestId("fleet-banner")).toBeInTheDocument();

    const status = screen.getByRole("radiogroup", { name: "Status" });
    expect(within(status).getByRole("radio", { name: "ALL" })).toHaveTextContent("3");
    expect(within(status).getByRole("radio", { name: "UP" })).toHaveTextContent("1");
    expect(within(status).getByRole("radio", { name: "DOWN" })).toHaveTextContent("1");
    expect(within(status).getByRole("radio", { name: "UNKNOWN" })).toHaveTextContent("1");
  });

  it("clears filters from empty state", async () => {
    const user = userEvent.setup();

    render(<MonitorList monitors={monitors} filterable />);
    await user.type(
      screen.getAllByPlaceholderText(/search name/i)[0],
      "kafka-does-not-exist",
    );

    expect(screen.getByText("No monitors match your filters.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(screen.getByText("Pdf App")).toBeInTheDocument();
  });

  it("renders preview header and link to all monitors", () => {
    render(
      <MonitorList
        monitors={monitors.slice(0, 2)}
        variant="preview"
        previewKicker="Up next"
        previewTitle="Recent checks"
      />,
    );

    expect(screen.getByText("Up next")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Recent checks" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /all monitors/i }),
    ).toHaveAttribute("href", "/monitors");
  });

  it("shows empty filter message when nothing matches", async () => {
    const user = userEvent.setup();

    render(<MonitorList monitors={monitors} filterable />);
    await user.type(
      screen.getAllByPlaceholderText(/search name/i)[0],
      "kafka-does-not-exist",
    );

    expect(screen.getByText("No monitors match your filters.")).toBeInTheDocument();
  });
});
