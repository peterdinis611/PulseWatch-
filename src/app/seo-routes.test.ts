import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("robots", () => {
  it("allows public pages and blocks the signed-in app", () => {
    const doc = robots();
    const rules = Array.isArray(doc.rules) ? doc.rules[0] : doc.rules;
    expect(rules.allow).toEqual(["/", "/vstup"]);
    expect(rules.disallow).toEqual(
      expect.arrayContaining(["/desk", "/monitors", "/load", "/settings"]),
    );
    expect(String(doc.sitemap)).toMatch(/\/sitemap\.xml$/);
  });
});

describe("sitemap", () => {
  it("lists the landing and vstup urls", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(urls[0]).toMatch(/localhost:3000|https:\/\//);
    expect(urls.some((url) => url.endsWith("/vstup"))).toBe(true);
    expect(entries[0].priority).toBe(1);
  });
});
