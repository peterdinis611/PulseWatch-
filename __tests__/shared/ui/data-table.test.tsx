import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { monitorColumns } from "@/features/monitors/monitor-columns";
import { stressColumns } from "@/features/load/stress-columns";
import { mockMonitor } from "@tests/fixtures";
import { DataTable } from "@/shared/ui/data-table";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
}));

describe("table columns", () => {
  it("defines monitor and stress column sets", () => {
    expect(monitorColumns).toHaveLength(5);
    expect(stressColumns).toHaveLength(5);
    expect(
      "accessorKey" in monitorColumns[0] && monitorColumns[0].accessorKey,
    ).toBe("lastStatus");
    expect(
      "accessorKey" in stressColumns[0] && stressColumns[0].accessorKey,
    ).toBe("lastStatus");
  });
});

describe("DataTable", () => {
  it("renders rows and navigates on click", async () => {
    const user = userEvent.setup();
    push.mockClear();

    render(
      <DataTable
        columns={monitorColumns}
        data={[
          mockMonitor(),
          mockMonitor({
            id: "m2",
            name: "Redis Cache",
            type: "REDIS",
            lastStatus: "DOWN",
            config: { host: "redis", port: 6379 },
          }),
        ]}
        getRowHref={(monitor) => `/monitors/${monitor.id}`}
        getRowId={(monitor) => monitor.id}
      />,
    );

    expect(screen.getByText("Pdf App")).toBeInTheDocument();
    expect(screen.getByText("Redis Cache")).toBeInTheDocument();
    expect(screen.getByText("DOWN")).toBeInTheDocument();

    await user.click(screen.getByText("Pdf App"));
    expect(push).toHaveBeenCalledWith("/monitors/m1");
  });

  it("shows empty message when there is no data", () => {
    render(
      <DataTable
        columns={monitorColumns}
        data={[]}
        emptyMessage="Nič nesedí na filter."
      />,
    );

    expect(screen.getByText("Nič nesedí na filter.")).toBeInTheDocument();
  });

  it("sorts by latency when the ms header is clicked", async () => {
    const user = userEvent.setup();

    render(
      <DataTable
        columns={monitorColumns}
        data={[
          mockMonitor({ id: "slow", name: "Slow", lastLatencyMs: 900 }),
          mockMonitor({ id: "fast", name: "Fast", lastLatencyMs: 40 }),
        ]}
        getRowId={(monitor) => monitor.id}
      />,
    );

    const rowNames = () =>
      screen
        .getAllByRole("row")
        .slice(1)
        .map((row) => row.textContent?.includes("Slow") ? "Slow" : "Fast");

    expect(rowNames()).toEqual(["Slow", "Fast"]);

    await user.click(screen.getByRole("button", { name: /^ms/i }));
    expect(rowNames()).toEqual(["Slow", "Fast"]);

    await user.click(screen.getByRole("button", { name: /^ms/i }));
    expect(rowNames()).toEqual(["Fast", "Slow"]);
  });

  it("highlights a row when highlightRowId matches", () => {
    render(
      <DataTable
        columns={monitorColumns}
        data={[mockMonitor(), mockMonitor({ id: "m2", name: "Other" })]}
        getRowId={(monitor) => monitor.id}
        highlightRowId="m2"
      />,
    );

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[1].className).toContain("bg-primary");
  });
});
