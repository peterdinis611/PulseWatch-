import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePoll } from "@/shared/hooks/usePoll";

describe("usePoll", () => {
  it("loads immediately and polls again", async () => {
    const fn = vi.fn().mockResolvedValue({ ok: true });
    const { result, unmount } = renderHook(() => usePoll(fn, 40));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ ok: true });

    await waitFor(() => expect(fn.mock.calls.length).toBeGreaterThanOrEqual(2));
    const calls = fn.mock.calls.length;
    unmount();
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(fn.mock.calls.length).toBe(calls);
  });

  it("surfaces errors without throwing", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("down"));
    const { result } = renderHook(() => usePoll(fn, 10_000));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
