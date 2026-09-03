import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Constellation } from "@/features/desk/Constellation";
import { mockMonitor } from "@tests/fixtures";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
}));

describe("Constellation", () => {
  it("shows idle placeholder when there are no monitors", () => {
    render(<Constellation monitors={[]} />);

    expect(
      screen.getByRole("img", { name: /stav monitorov v konštelácii/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("žiadny monitor")).toBeInTheDocument();
  });

  it("labels monitor nodes and navigates on click", async () => {
    const user = userEvent.setup();
    push.mockClear();

    render(
      <Constellation
        monitors={[
          mockMonitor(),
          mockMonitor({ id: "m2", name: "API Gateway" }),
        ]}
      />,
    );

    expect(screen.getByText("Pdf App")).toBeInTheDocument();
    expect(screen.getByText("API Gateway")).toBeInTheDocument();

    await user.click(screen.getByText("Pdf App"));
    expect(push).toHaveBeenCalledWith("/monitors/m1");
  });
});
