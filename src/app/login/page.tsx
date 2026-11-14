import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/AuthCard";
import { SignedInRedirect } from "@/features/auth/SignedInRedirect";
import { routes } from "@/shared/lib/routes";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in or create an account",
  description:
    "Sign in to PulseWatch or create an account and start monitoring HTTP, databases, SSL, and k6 load tests.",
  alternates: { canonical: routes.login },
  robots: { index: true, follow: true },
};

export default function LoginPage() {
  return (
    <div className="relative z-2 mx-auto grid min-h-svh max-w-5xl items-center gap-10 px-5 py-12 md:grid-cols-[1fr_420px] md:px-10">
      <SignedInRedirect />
      <div>
        <Link
          href={routes.home}
          className="text-[14px] text-muted-foreground hover:text-foreground"
        >
          ← Back to overview
        </Link>
        <h1 className="mt-8 font-heading text-[clamp(40px,7vw,72px)] font-black leading-[0.9] tracking-[-0.05em]">
          Step into
          <span className="mt-2 block text-primary">Overview.</span>
        </h1>
        <p className="mt-5 max-w-[32ch] text-[18px] text-muted-foreground">
          The account is free. After you sign in, add a monitor and see what&apos;s
          up. Or try the demo account in one click.
        </p>
      </div>
      <AuthCard defaultMode="login" />
    </div>
  );
}
