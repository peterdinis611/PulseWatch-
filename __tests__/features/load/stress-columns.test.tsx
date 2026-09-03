import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { stressColumns } from "@/features/load/stress-columns";
import { mockStressTest } from "@tests/fixtures";

function StressCell({
  columnId,
  test,
}: {
  columnId: string;
  test: ReturnType<typeof mockStressTest>;
}) {
  const table = useReactTable({
    data: [test],
    columns: stressColumns,
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

describe("stressColumns", () => {
  it("renders scenario meta and p95", () => {
    render(
      <>
        <StressCell columnId="name" test={mockStressTest()} />
        <StressCell columnId="p95" test={mockStressTest()} />
      </>,
    );

    expect(screen.getByText("Health spike")).toBeInTheDocument();
    expect(screen.getByText(/10 VU/)).toBeInTheDocument();
    expect(screen.getByText("320 ms")).toBeInTheDocument();
  });

  it("shows dash when summary is missing", () => {
    render(
      <StressCell
        columnId="p95"
        test={mockStressTest({ lastSummary: null })}
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
