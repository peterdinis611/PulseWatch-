import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/shared/seo/site";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/vstup"],
        disallow: [
          "/desk",
          "/monitors",
          "/load",
          "/alerts",
          "/settings",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
