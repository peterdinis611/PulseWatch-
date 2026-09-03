import { LandingPage } from "@/features/marketing/LandingPage";
import { JsonLd } from "@/features/marketing/JsonLd";
import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/shared/seo/site";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <LandingPage />
    </>
  );
}
