"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getToken, useSession } from "@/shared/session";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, token } = useSession();

  useEffect(() => {
    if (!getToken()) router.replace("/");
  }, [pathname, router]);

  if (!ready || !token) {
    return (
      <div className="grid max-w-md gap-3 p-10">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    );
  }

  return <>{children}</>;
}
