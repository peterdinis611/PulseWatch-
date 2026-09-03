import type { Metadata } from "next";
import { AuthGate } from "@/features/auth/AuthGate";
import { AppShell } from "@/shared/layout/AppShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
