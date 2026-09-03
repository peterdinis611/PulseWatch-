import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { HttpErrorPage } from "@/shared/ui/http-error-page";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: false },
};

export default function AppNotFound() {
  return (
    <HttpErrorPage
      code="404"
      kicker="Stratený signál"
      title="Táto stránka neexistuje."
      description="Monitor alebo scenár na tejto adrese sa nenašiel. Skús prehľad, alebo choď späť do zoznamu."
      actions={
        <>
          <Button asChild size="lg">
            <Link href="/desk">Prehľad</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/monitors">Monitory</Link>
          </Button>
        </>
      }
    />
  );
}
