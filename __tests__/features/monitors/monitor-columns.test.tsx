import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { monitorColumns } from "@/features/monitors/monitor-columns";
import { mockMonitor } from "@tests/fixtures";

function MonitorCell({
  columnId,
  monitor,
}: {
  columnId: string;
  monitor: ReturnType<typeof mockMonitor>;
}) {
  const table = useReactTable({
    data: [monitor],
    columns: monitorColumns,
    getCoreRowModel: getCoreRowModel(),
  });
  const cell = table
    .getRowModel()
    .rows[0]
    .getVisibleCells()
    .find((item) => item.column.id === columnId);

  if (!cell) throw new Error(`missing column ${columnId}`);

  return <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>;
}

describe("monitorColumns", () => {
  it("renders status badge and target url", () => {
    const monitor = mockMonitor();

    render(
      <>
        <MonitorCell columnId="lastStatus" monitor={monitor} />
        <MonitorCell columnId="target" monitor={monitor} />
      </>,
    );

    expect(screen.getByText("UP")).toBeInTheDocument();
    expect(
      screen.getByText("https://we-love-pdf-nine.vercel.app/"),
    ).toBeInTheDocument();
  });

  it("renders host:port when url is missing", () => {
    render(
      <MonitorCell
        columnId="target"
        monitor={mockMonitor({
          type: "TCP",
          config: { host: "db.internal", port: 5432 },
        })}
      />,
    );

    expect(screen.getByText("db.internal:5432")).toBeInTheDocument();
  });
});
