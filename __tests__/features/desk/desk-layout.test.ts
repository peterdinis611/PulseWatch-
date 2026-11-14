import { describe, expect, it } from "vitest";
import {
  addWidgetToLayout,
  availableWidgetTypes,
  defaultDeskLayout,
  moveWidgetInLayout,
  parseDeskLayout,
  removeWidgetFromLayout,
  renameWidgetInLayout,
  setWidgetColumn,
} from "@/features/desk/desk-layout";

describe("desk-layout", () => {
  it("parses a valid stored layout", () => {
    const parsed = parseDeskLayout({
      version: 1,
      widgets: [
        { id: "a", type: "health", column: "full" },
        { id: "b", type: "incidents", column: "side", title: "Fires" },
        { id: "dup", type: "health", column: "full" },
        { id: "bad", type: "nope", column: "main" },
      ],
    });

    expect(parsed?.widgets).toHaveLength(2);
    expect(parsed?.widgets[1].title).toBe("Fires");
  });

  it("adds unique widgets and skips duplicates", () => {
    const base = defaultDeskLayout();
    const withLoad = addWidgetToLayout(base, "load_runs");
    expect(withLoad.widgets.some((w) => w.type === "load_runs")).toBe(true);
    expect(addWidgetToLayout(withLoad, "load_runs").widgets).toHaveLength(
      withLoad.widgets.length,
    );
  });

  it("renames, moves, and removes widgets", () => {
    let layout = defaultDeskLayout();
    const side = layout.widgets.filter((w) => w.column === "side");
    const first = side[0];
    const second = side[1];

    layout = renameWidgetInLayout(layout, first.id, "Priority");
    expect(
      layout.widgets.find((w) => w.id === first.id)?.title,
    ).toBe("Priority");

    layout = moveWidgetInLayout(layout, second.id, "up");
    const sideAfter = layout.widgets.filter((w) => w.column === "side");
    expect(sideAfter[0].id).toBe(second.id);

    layout = setWidgetColumn(layout, first.id, "main");
    expect(layout.widgets.find((w) => w.id === first.id)?.column).toBe("main");

    layout = removeWidgetFromLayout(layout, first.id);
    expect(layout.widgets.some((w) => w.id === first.id)).toBe(false);
    expect(availableWidgetTypes(layout)).toContain(first.type);
  });
});
