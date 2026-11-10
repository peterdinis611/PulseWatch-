"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gql, gqlMessage } from "@/shared/graphql/client";
import { toast } from "sonner";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/shared/graphql/documents";
import { DEMO_ACCOUNT, routes } from "@/shared/lib/routes";
import type { AuthPayload } from "@/shared/lib/types";
import { useSession } from "@/shared/session/SessionProvider";
import { FormError, FormField } from "@/shared/ui/form";
import { cn } from "@/lib/utils";

export function AuthCard({
  defaultMode = "register",
}: {
  defaultMode?: "login" | "register";
}) {
  const router = useRouter();
  const { signIn } = useSession();
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function completeLogin(accessToken: string) {
    await signIn(accessToken);
    router.replace(routes.overview);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") {
        const data = await gql<{ login: AuthPayload }>(
          LOGIN_MUTATION,
          { input: { email, password } },
          { auth: false },
        );
        await completeLogin(data.login.accessToken);
      } else {
        const data = await gql<{ register: AuthPayload }>(
          REGISTER_MUTATION,
          { input: { email, password, name: name || undefined } },
          { auth: false },
        );
        await completeLogin(data.register.accessToken);
      }
    } catch (err) {
      const message = gqlMessage(err);
      setError(message);
      toast.error(
        mode === "login" ? "Prihlásenie zlyhalo." : "Registrácia zlyhala.",
        { description: message },
      );
    } finally {
      setBusy(false);
    }
  }

  async function onDemoLogin() {
    setMode("login");
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    setBusy(true);
    setError(null);
    try {
      const data = await gql<{ login: AuthPayload }>(
        LOGIN_MUTATION,
        {
          input: {
            email: DEMO_ACCOUNT.email,
            password: DEMO_ACCOUNT.password,
          },
        },
        { auth: false },
      );
      await completeLogin(data.login.accessToken);
      toast.success("Demo účet", {
        description: "Si prihlásený ako demo@pulsewatch.dev.",
      });
    } catch (err) {
      const message = gqlMessage(err);
      setError(message);
      toast.error("Demo login zlyhal.", {
        description: `${message} Spusti \`npm run prisma:seed\` v backende.`,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full border border-border bg-card p-6 md:p-7">
      <div
        className="mb-6 grid grid-cols-2 border-b border-border"
        role="tablist"
        aria-label="Režim vstupu"
      >
        {(
          [
            ["register", "Registrácia"],
            ["login", "Prihlásenie"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            className={cn(
              "relative py-3 text-[14px] text-muted-foreground transition-colors hover:text-foreground",
              mode === value && "font-medium text-foreground",
            )}
            onClick={() => setMode(value)}
          >
            {label}
            {mode === value ? (
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground"
              />
            ) : null}
          </button>
        ))}
      </div>
      <h2 className="mb-5 font-heading text-[26px] font-black tracking-[-0.04em]">
        {mode === "register" ? "Vytvor si účet" : "Prihlás sa"}
      </h2>
      <form onSubmit={onSubmit}>
        <FormError>{error}</FormError>
        {mode === "register" ? (
          <FormField label="Meno">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="h-10 rounded-md"
              placeholder="Ako ťa máme volať"
            />
          </FormField>
        ) : null}
        <FormField label="Email">
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="h-10 rounded-md"
            placeholder="ty@firma.sk"
          />
        </FormField>
        <FormField label={mode === "register" ? "Heslo (min. 8 znakov)" : "Heslo"}>
          <Input
            required
            minLength={mode === "register" ? 8 : undefined}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            className="h-10 rounded-md"
          />
        </FormField>
        <Button disabled={busy} type="submit" className="mt-1 h-10 w-full">
          {busy
            ? "Čakám…"
            : mode === "login"
              ? "Vstúpiť do prehľadu"
              : "Vytvoriť účet a začať"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          className="mt-2 h-10 w-full"
          onClick={onDemoLogin}
        >
          Použiť demo účet
        </Button>
        <p className="mt-4 text-[14px] text-muted-foreground">
          Demo: {DEMO_ACCOUNT.email} · Účet je zadarmo. Potom pridáš prvý HTTP
          monitor na službu, ktorú chceš vidieť hore.
        </p>
      </form>
    </div>
  );
}
