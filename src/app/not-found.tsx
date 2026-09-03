import type { Metadata } from "next";
import { HttpErrorPage } from "@/shared/ui/http-error-page";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <HttpErrorPage
      code="404"
      kicker="Stratený signál"
      title="Táto stránka neexistuje."
      description="URL nevedie na žiadny monitor ani scenár. Skontroluj adresu, alebo sa vráť na prehľad."
    />
  );
}
