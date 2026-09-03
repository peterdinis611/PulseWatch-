import { describe, expect, it, vi, afterEach } from "vitest";
import {
  clockNow,
  formatAgo,
  formatMs,
  formatPct,
  formatWhen,
  targetOf,
} from "@/shared/lib/format";

describe("formatWhen", () => {
  it("returns dash for empty values", () => {
    expect(formatWhen(null)).toBe("—");
    expect(formatWhen(undefined)).toBe("—");
    expect(formatWhen("")).toBe("—");
  });

  it("returns dash for invalid dates", () => {
    expect(formatWhen("not-a-date")).toBe("—");
  });

  it("formats a valid timestamp in sk-SK", () => {
    const result = formatWhen("2026-09-03T12:00:00.000Z");
    expect(result).not.toBe("—");
    expect(result.length).toBeGreaterThan(4);
  });
});

describe("formatAgo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns nikdy when missing", () => {
    expect(formatAgo(null)).toBe("nikdy");
  });

  it("returns teraz for the last few seconds", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-03T12:00:00.000Z"));
    expect(formatAgo("2026-09-03T11:59:56.000Z")).toBe("teraz");
  });

  it("returns seconds then minutes then hours", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-03T12:00:00.000Z"));
    expect(formatAgo("2026-09-03T11:59:20.000Z")).toBe("pred 40 s");
    expect(formatAgo("2026-09-03T11:50:00.000Z")).toBe("pred 10 min");
    expect(formatAgo("2026-09-03T09:00:00.000Z")).toBe("pred 3 h");
  });
});

describe("formatMs", () => {
  it("rounds milliseconds", () => {
    expect(formatMs(null)).toBe("—");
    expect(formatMs(12.6)).toBe("13 ms");
  });
});

describe("formatPct", () => {
  it("renders fail rate as percent", () => {
    expect(formatPct(null)).toBe("—");
    expect(formatPct(0.053)).toBe("5.3 %");
  });
});

describe("targetOf", () => {
  it("prefers url, then host:port, then host", () => {
    expect(targetOf({ type: "HTTP", config: { url: "https://a.sk" } })).toBe(
      "https://a.sk",
    );
    expect(
      targetOf({ type: "TCP", config: { host: "db", port: 5432 } }),
    ).toBe("db:5432");
    expect(targetOf({ type: "DNS", config: { host: "example.sk" } })).toBe(
      "example.sk",
    );
    expect(targetOf({ type: "HTTP", config: {} })).toBe("—");
  });
});

describe("clockNow", () => {
  it("returns a clock string", () => {
    expect(clockNow()).toMatch(/\d{1,2}:\d{2}:\d{2}/);
  });
});
