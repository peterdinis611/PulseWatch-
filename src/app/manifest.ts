import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/shared/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0d14",
    theme_color: "#5a9bfc",
    lang: "sk",
  };
}
