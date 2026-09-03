import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/AuthCard";
import { SignedInRedirect } from "@/features/auth/SignedInRedirect";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Prihlásenie a registrácia",
  description:
    "Prihlás sa do PulseWatch alebo si vytvor účet a začni sledovať HTTP, databázy, SSL a k6 záťaž.",
  alternates: { canonical: "/vstup" },
  robots: { index: true, follow: true },
};

export default function VstupPage() {
  return (
    <div className="relative z-2 mx-auto grid min-h-svh max-w-5xl items-center gap-10 px-5 py-12 md:grid-cols-[1fr_420px] md:px-10">
      <SignedInRedirect />
      <div>
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          ← Späť na vysvetlenie
        </Link>
        <h1 className="mt-6 font-heading text-[clamp(40px,7vw,72px)] font-extrabold leading-[0.9] tracking-[-0.07em]">
          Vstúp do
          <em className="mt-2 block font-sans font-medium italic text-primary">
            prehľadu.
          </em>
        </h1>
        <p className="mt-5 max-w-[32ch] text-[19px] text-muted-foreground">
          Účet je zadarmo. Po prihlásení pridáš monitor a uvidíš, čo je hore.
        </p>
      </div>
      <AuthCard defaultMode="login" />
    </div>
  );
}
