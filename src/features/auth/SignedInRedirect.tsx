"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/shared/session/SessionProvider";

export function SignedInRedirect() {
  const router = useRouter();
  const { ready, token } = useSession();

  useEffect(() => {
    if (ready && token) router.replace("/desk");
  }, [ready, token, router]);

  return null;
}
