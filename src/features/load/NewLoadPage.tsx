"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StressForm } from "@/features/load/StressForm";
import { BackLink, PageHeader } from "@/shared/ui/page-header";
import { gql, gqlMessage } from "@/shared/graphql/client";
import { toast } from "sonner";
import { CREATE_STRESS } from "@/shared/graphql/documents";
import type { StressTest } from "@/shared/lib/types";
import { useSession } from "@/shared/session/SessionProvider";
import { noteClass, splitClass } from "@/shared/ui/list";

export default function NewLoadPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <BackLink href="/load">Späť na záťaž</BackLink>
      <PageHeader
        kicker="Nový scenár"
        title="Nastaviť tlak."
        lede="Len http/https. Jeden RUNNING beh naraz na scenár."
      />
      <div className={splitClass()}>
        <StressForm
          submitLabel="Vytvoriť"
          busy={busy}
          error={error}
          onSubmit={async (input) => {
            setBusy(true);
            setError(null);
            try {
              const data = await gql<{ createStressTest: StressTest }>(
                CREATE_STRESS,
                { input },
              );
              await refresh();
              toast.success("Scenár vytvorený.");
              router.replace(`/load/${data.createStressTest.id}`);
            } catch (err) {
              const message = gqlMessage(err);
              setError(message);
              toast.error("Vytvorenie zlyhalo.", { description: message });
              setBusy(false);
            }
          }}
        />
        <aside className={noteClass}>
          k6 musí byť nainštalované na stroji, kde beží API.
        </aside>
      </div>
    </>
  );
}
