import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/shared/seo/site";
import { routes } from "@/shared/lib/routes";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: [routes.home, routes.login],
        disallow: [
          routes.overview,
          routes.monitors,
          routes.load,
          routes.alerts,
          routes.settings,
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
