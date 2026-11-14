"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HttpErrorPage } from "@/shared/ui/http-error-page";

export default function Error({
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
      kicker="Signal lost"
      title="Something went wrong."
      description="The server or client hit an error. Try reloading the page. If the problem persists, head back to the overview."
      actions={
        <>
          <Button size="lg" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/overview">Overview</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/">Home</Link>
          </Button>
        </>
      }
    />
  );
}
