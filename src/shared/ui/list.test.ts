import { describe, expect, it } from "vitest";
import { listRowClass, noteClass, splitClass } from "@/shared/ui/list";

describe("list class helpers", () => {
  it("appends extras without dropping the grid", () => {
    expect(listRowClass("opacity-55")).toContain("opacity-55");
    expect(listRowClass()).toContain("grid");
    expect(splitClass("mt-4")).toContain("mt-4");
    expect(noteClass).toContain("border-primary");
  });
});
