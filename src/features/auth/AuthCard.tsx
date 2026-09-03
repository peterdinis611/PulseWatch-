"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gql, gqlMessage } from "@/shared/graphql/client";
import { toast } from "sonner";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/shared/graphql/documents";
import type { AuthPayload } from "@/shared/lib/types";
import { useSession } from "@/shared/session/SessionProvider";
import { FormError, FormField } from "@/shared/ui/form";

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
        await signIn(data.login.accessToken);
      } else {
        const data = await gql<{ register: AuthPayload }>(
          REGISTER_MUTATION,
          { input: { email, password, name: name || undefined } },
          { auth: false },
        );
        await signIn(data.register.accessToken);
      }
      router.replace("/desk");
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

  return (
    <Card className="w-full rounded-[28px] border-border/80 bg-card/85 backdrop-blur-md">
      <CardContent className="pt-6">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
          {mode === "register" ? "Začni za minútu" : "Vitaj späť"}
        </p>
        <h2 className="mb-5 font-heading text-[28px] leading-none tracking-[-0.05em]">
          {mode === "register" ? "Vytvor si účet" : "Prihlás sa"}
        </h2>
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as "login" | "register")}
        >
          <TabsList className="mb-5">
            <TabsTrigger value="register">Registrácia</TabsTrigger>
            <TabsTrigger value="login">Prihlásenie</TabsTrigger>
          </TabsList>
        </Tabs>
        <form onSubmit={onSubmit}>
          <FormError>{error}</FormError>
          {mode === "register" ? (
            <FormField label="Meno">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="h-9"
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
              className="h-9"
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
              className="h-9"
            />
          </FormField>
          <Button disabled={busy} type="submit" className="h-9 w-full">
            {busy
              ? "Čakám…"
              : mode === "login"
                ? "Vstúpiť do prehľadu"
                : "Vytvoriť účet a začať"}
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            Účet je zadarmo. Potom pridáš prvý HTTP monitor na službu, ktorú
            chceš vidieť hore.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
