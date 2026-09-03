"use client";

import Link from "next/link";
import { MonitorList } from "@/features/monitors/MonitorList";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/shared/ui/page-header";
import { useSession } from "@/shared/session";

export default function MonitorsPage() {
  const { monitors } = useSession();

  return (
    <>
      <PageHeader
        kicker="Monitory"
        title="Deväť typov."
        lede="HTTP, Redis, databáza, TCP, SSL, DNS, SMTP, Kafka, gRPC. Hľadaj podľa názvu alebo odfiltruj stav."
        actions={
          <Button asChild size="lg">
            <Link href="/monitors/new">Nový monitor</Link>
          </Button>
        }
      />
      {monitors.length === 0 ? (
        <EmptyState
          title="Žiadny monitor."
          action={
            <Button asChild size="lg">
              <Link href="/monitors/new">Pridať HTTP monitor</Link>
            </Button>
          }
        >
          Začni GET na endpoint, ktorý má zostať nažive.
        </EmptyState>
      ) : (
        <MonitorList monitors={monitors} filterable />
      )}
    </>
  );
}
