"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HttpErrorPage } from "@/shared/ui/http-error-page";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <HttpErrorPage
      code="500"
      kicker="Výpadok signálu"
      title="Niečo sa pokazilo."
      description="Táto obrazovka spadla. Skús obnoviť — ak problém pretrváva, vráť sa na prehľad."
      actions={
        <>
          <Button size="lg" onClick={reset}>
            Skúsiť znova
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/desk">Prehľad</Link>
          </Button>
        </>
      }
    />
  );
}
