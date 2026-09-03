import { afterEach, describe, expect, it } from "vitest";
import { getSiteUrl, SITE_KEYWORDS, SITE_NAME } from "@/shared/seo/site";

describe("getSiteUrl", () => {
  const originalSite = process.env.NEXT_PUBLIC_SITE_URL;
  const originalVercel = process.env.VERCEL_URL;

  afterEach(() => {
    if (originalSite === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = originalSite;
    if (originalVercel === undefined) delete process.env.VERCEL_URL;
    else process.env.VERCEL_URL = originalVercel;
  });

  it("strips trailing slash from NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://pulsewatch.sk/";
    expect(getSiteUrl()).toBe("https://pulsewatch.sk");
  });

  it("falls back to VERCEL_URL then localhost", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_URL = "app.vercel.app";
    expect(getSiteUrl()).toBe("https://app.vercel.app");
    delete process.env.VERCEL_URL;
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});

describe("site copy", () => {
  it("includes PulseWatch keywords", () => {
    expect(SITE_NAME).toBe("PulseWatch");
    expect(SITE_KEYWORDS).toContain("uptime monitoring");
    expect(SITE_KEYWORDS).toContain("k6 záťažový test");
  });
});
