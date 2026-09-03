import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/shared/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteUrl();
  const now = new Date();
  return [
    {
      url: origin,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${origin}/vstup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
