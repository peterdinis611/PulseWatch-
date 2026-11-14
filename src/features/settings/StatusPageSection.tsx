"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { gql, gqlMessage } from "@/shared/graphql/client";
import { MY_STATUS_PAGE, UPDATE_STATUS_PAGE } from "@/shared/graphql/documents";
import { routes } from "@/shared/lib/routes";
import type { StatusPageSettings } from "@/shared/lib/types";
import { useSession } from "@/shared/session";
import { CheckRow, FormError, FormField, FormRow } from "@/shared/ui/form";
import { listPanelClass } from "@/shared/ui/list";
import { cn } from "@/lib/utils";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export function StatusPageSection() {
  const { monitors } = useSession();
  const [saved, setSaved] = useState<StatusPageSettings | null>(null);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onPage = useMemo(
    () => monitors.filter((m) => m.showOnStatusPage),
    [monitors],
  );

  function apply(next: StatusPageSettings) {
    setSaved(next);
    setSlug(next.slug);
    setTitle(next.title);
    setIsPublic(next.isPublic);
  }

  function load() {
    setLoading(true);
    gql<{ myStatusPage: StatusPageSettings }>(MY_STATUS_PAGE)
      .then((data) => {
        apply(data.myStatusPage);
        setError(null);
      })
      .catch((err) => setError(gqlMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const validation = useMemo(() => {
    if (!slug.trim()) return "Slug je povinný.";
    if (!SLUG_RE.test(slug.trim())) {
      return "Slug: malé písmená, čísla a pomlčky.";
    }
    if (!title.trim()) return "Názov je povinný.";
    return null;
  }, [slug, title]);

  const dirty =
    saved != null &&
    (slug.trim() !== saved.slug ||
      title.trim() !== saved.title ||
      isPublic !== saved.isPublic);

  const publicPath = routes.status((saved?.slug || slug).trim() || "demo");
  const publicUrl =
    typeof window === "undefined"
      ? publicPath
      : `${window.location.origin}${publicPath}`;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (validation) {
      setError(validation);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const data = await gql<{ updateStatusPage: StatusPageSettings }>(
        UPDATE_STATUS_PAGE,
        { input: { slug: slug.trim(), title: title.trim(), isPublic } },
      );
      apply(data.updateStatusPage);
      toast.success("Status stránka uložená.");
    } catch (err) {
      const message = gqlMessage(err);
      setError(message);
      toast.error("Uloženie zlyhalo.", { description: message });
    } finally {
      setBusy(false);
    }
  }

  if (loading && !saved) {
    return (
      <section className={cn(listPanelClass(), "grid gap-3 p-5 md:p-6")}>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </section>
    );
  }

  return (
    <section className={cn(listPanelClass(), "p-5 md:p-6")}>
      <header className="mb-5 border-b border-border pb-4">
        <h2 className="font-heading text-[20px] font-black tracking-[-0.04em]">
          Status stránka
        </h2>
        <p className="mt-1 max-w-[52ch] text-[14px] text-muted-foreground">
          Verejná stránka bez prihlásenia. Zobrazí monitory so zapnutým „Zobraziť
          na status stránke“.
        </p>
      </header>
      <form onSubmit={onSubmit}>
        <FormError>{error}</FormError>
        {error && !saved ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mb-4"
            onClick={load}
          >
            Skúsiť znova
          </Button>
        ) : null}
        <FormRow>
          <FormField label="Slug" hint="Časť adresy /status/…">
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="moja-firma"
              className="h-10"
            />
          </FormField>
          <FormField label="Názov">
            <Input
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Moja firma"
              className="h-10"
            />
          </FormField>
        </FormRow>
        <CheckRow
          checked={isPublic}
          onCheckedChange={setIsPublic}
          description="Vypnuté = stránka vráti „nie je dostupná“."
        >
          Stránka je verejná
        </CheckRow>

        <div className="mb-4 mt-4 border border-border bg-background px-4 py-3">
          <p className="text-[13px] font-medium text-foreground">
            Na stránke: {onPage.length}
          </p>
          {onPage.length === 0 ? (
            <p className="mt-1 text-[13px] text-muted-foreground">
              Žiadny monitor. Zapni „Zobraziť na status stránke“ v detaile
              monitora.
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
              {onPage.slice(0, 8).map((monitor) => (
                <li key={monitor.id}>
                  <Link
                    href={routes.monitor(monitor.id)}
                    className="underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {monitor.name}
                  </Link>
                </li>
              ))}
              {onPage.length > 8 ? (
                <li>+{onPage.length - 8} ďalších</li>
              ) : null}
            </ul>
          )}
        </div>

        {saved || slug.trim() ? (
          <p className="mb-4 break-all font-mono text-[13px] text-muted-foreground">
            {isPublic ? (
              <Link
                href={publicPath}
                target="_blank"
                className="text-primary underline-offset-4 hover:underline"
              >
                {publicUrl} ↗
              </Link>
            ) : (
              <span>{publicUrl} (súkromná)</span>
            )}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            size="lg"
            disabled={busy || Boolean(validation) || (saved != null && !dirty)}
          >
            {busy
              ? "Ukladám…"
              : !saved
                ? "Vytvoriť stránku"
                : dirty
                  ? "Uložiť stránku"
                  : "Bez zmien"}
          </Button>
          {isPublic && (saved || slug.trim()) ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                void navigator.clipboard?.writeText(publicUrl);
                toast.success("Odkaz skopírovaný.");
              }}
            >
              Kopírovať odkaz
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
