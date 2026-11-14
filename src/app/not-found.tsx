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
      kicker="Signal not found"
      title="This page doesn't exist."
      description="This URL doesn't lead to any monitor or scenario. Check the address, or head back to the overview."
    />
  );
}
