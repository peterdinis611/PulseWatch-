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
      kicker="Signal not found"
      title="This page doesn't exist."
      description="No monitor or scenario was found at this address. Try the overview, or go back to the list."
      actions={
        <>
          <Button asChild size="lg">
            <Link href="/overview">Overview</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/monitors">Monitors</Link>
          </Button>
        </>
      }
    />
  );
}
