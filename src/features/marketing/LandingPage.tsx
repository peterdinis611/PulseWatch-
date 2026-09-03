import Link from "next/link";
import { AuthCard } from "@/features/auth/AuthCard";
import { SignedInRedirect } from "@/features/auth/SignedInRedirect";
import { LandingConstellation } from "@/features/marketing/LandingConstellation";
import { LivePulse } from "@/features/marketing/LivePulse";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "#ako", label: "Ako to ide" },
  { href: "#typy", label: "Čo sleduje" },
  { href: "#zataz", label: "Záťaž" },
  { href: "#otazky", label: "Otázky" },
];

const TYPES = [
  {
    type: "HTTP",
    title: "Webová adresa",
    body: "Pingne URL. Vieš nastaviť GET/POST a očakávaný status, napríklad 200.",
  },
  {
    type: "REDIS",
    title: "Redis cache",
    body: "Skúsi sa pripojiť na redis://. Keď cache mlčí, uvidíš DOWN.",
  },
  {
    type: "DATABASE",
    title: "Databáza",
    body: "Postgres, MySQL alebo SQLite cez connection URL. Bez odpovede = alarm.",
  },
  {
    type: "TCP",
    title: "Otvorený port",
    body: "Overí, či host počúva na porte. Hodí sa na interné služby bez HTTP.",
  },
  {
    type: "SSL",
    title: "Certifikát",
    body: "Kontroluje, či TLS ešte platí a koľko dní ostáva do expirácie.",
  },
  {
    type: "DNS",
    title: "DNS záznam",
    body: "A, AAAA, CNAME, MX, NS, TXT. Vie porovnať očakávanú hodnotu.",
  },
  {
    type: "SMTP",
    title: "Mail server",
    body: "STARTTLS alebo implicitné TLS. Vieš, či pošta ešte prijíma spojenie.",
  },
  {
    type: "KAFKA",
    title: "Kafka broker",
    body: "Broker a voliteľne topic. TLS podľa potreby.",
  },
  {
    type: "GRPC",
    title: "gRPC health",
    body: "Standard health check na službu. Vhodné pre interné API.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Pomenuj, čo má žiť",
    body: "Pridáš monitor: URL webu, Redis, databázu, port alebo certifikát. Interval nechaj na default, ak nevieš — 60 sekúnd stačí.",
  },
  {
    n: "02",
    title: "PulseWatch to kontroluje",
    body: "Na pozadí sa pýta cieľa. Stav vidíš ako bod v konštelácii a v zozname: HORE, DOLE, alebo ešte neznámy.",
  },
  {
    n: "03",
    title: "Keď spadne, vieš to",
    body: "Príde upozornenie. Môžeš spustiť kontrolu ručne. Ak chceš vedieť, ako služba zvládne tlačenku, spustíš k6 scenár.",
  },
];

const FAQS = [
  {
    q: "Čo PulseWatch robí?",
    a: "Pravidelne overuje, či tvoje služby odpovedajú. Keď prestanú, dostaneš upozornenie. Okrem toho vieš spustiť k6 záťažový test na HTTP endpoint.",
  },
  {
    q: "Aké služby viem sledovať?",
    a: "Deväť typov: HTTP, Redis, databáza, TCP port, SSL certifikát, DNS, SMTP, Kafka a gRPC. Záťaž (k6) nie je monitor — je to samostatný test na požiadanie.",
  },
  {
    q: "Čo je záťažový test?",
    a: "Scenár pre k6: URL, metóda, počet virtuálnych používateľov (1–50) a dĺžka (5–120 s). Výsledok uvidíš ako p95 latenciu a fail rate. k6 musí bežať na stroji s API.",
  },
  {
    q: "Potrebujem účet?",
    a: "Áno. Registrácia je zadarmo. Po prihlásení pridáš prvý monitor a prehľad ukáže, čo je hore.",
  },
];

export function LandingPage() {
  return (
    <div className="relative z-2">
      <SignedInRedirect />
      <a
        href="#obsah"
        className="absolute top-[-48px] left-3 z-20 rounded-lg bg-primary px-3 py-2 text-primary-foreground focus:top-3"
      >
        Preskočiť na obsah
      </a>
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/70 px-4 py-3 backdrop-blur-md md:px-8">
        <Link
          href="/"
          className="font-heading text-lg font-extrabold tracking-[-0.06em]"
        >
          pulse
          <em className="ml-1 font-sans font-medium italic text-primary">watch</em>
        </Link>
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Obsah stránky"
        >
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <Button asChild size="sm">
          <a href="#vstup">Vstúpiť</a>
        </Button>
      </header>

      <main id="obsah">
        <section className="relative overflow-hidden px-4 pb-6 pt-10 md:px-10 md:pt-16">
          <p className="animate-rise font-mono text-xs uppercase tracking-[0.28em] text-primary">
            Monitoring služieb · nočná služba
          </p>
          <div className="mt-5 grid items-end gap-8 lg:grid-cols-[minmax(0,1.15fr)_0.85fr]">
            <div>
              <h1 className="animate-rise font-heading text-[clamp(44px,8vw,96px)] font-extrabold leading-[0.86] tracking-[-0.07em] [animation-delay:80ms]">
                Vieš, čo je hore.
                <em className="mt-2 block font-sans text-[0.62em] font-medium italic tracking-[-0.04em] text-primary">
                  Skôr, ako to padne.
                </em>
              </h1>
              <p className="animate-rise mt-6 max-w-[38ch] text-[21px] leading-snug text-muted-foreground [animation-delay:140ms]">
                PulseWatch je prehľad pre ľudí, ktorí prevádzkujú weby a API.
                Pridáš cieľ, on ho pravidelne skontroluje. Keď neodpovie,
                uvidíš to tu — nie až v tikete od zákazníka.
              </p>
              <div className="animate-rise mt-8 flex flex-wrap gap-3 [animation-delay:200ms]">
                <Button asChild size="lg">
                  <a href="#vstup">Vytvoriť účet</a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#ako">Ako to funguje</a>
                </Button>
              </div>
            </div>
            <div className="animate-rise [animation-delay:180ms]">
              <LivePulse />
              <p className="mt-5 max-w-[32ch] text-sm text-muted-foreground">
                Čísla vpravo sú živý stav tohto API. Rovnaký princíp potom
                uvidíš pri svojich monitoroch.
              </p>
            </div>
          </div>
          <div className="animate-rise relative -mx-2 mt-10 md:mx-0 [animation-delay:260ms]">
            <LandingConstellation />
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Každý bod je iný typ kontroly · zelená hore · červená dole
            </p>
          </div>
        </section>

        <section
          id="ako"
          className="scroll-mt-20 border-t border-border px-4 py-16 md:px-10"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
            Tri kroky
          </p>
          <h2 className="mt-2 max-w-[16ch] font-heading text-[clamp(32px,5vw,56px)] leading-[0.94] tracking-[-0.06em]">
            Od URL po upozornenie.
          </h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.n}
                className="relative md:-rotate-1 md:odd:rotate-1 md:odd:translate-y-6"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <span className="font-heading text-[56px] leading-none tracking-[-0.08em] text-primary/80">
                  {step.n}
                </span>
                <h3 className="mt-2 text-[26px] tracking-[-0.04em]">{step.title}</h3>
                <p className="mt-3 text-[17px] text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="typy"
          className="scroll-mt-20 border-t border-border px-4 py-16 md:px-10"
        >
          <div className="grid items-end gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                Deväť typov
              </p>
              <h2 className="mt-2 font-heading text-[clamp(32px,5vw,56px)] leading-[0.94] tracking-[-0.06em]">
                Nie len ping na homepage.
              </h2>
            </div>
            <p className="max-w-[42ch] text-[18px] text-muted-foreground">
              Jeden nástroj na web, cache, databázu, certifikát aj frontu.
              Vyberieš typ, vyplníš cieľ, ostane v konštelácii.
            </p>
          </div>
          <ul className="mt-12 divide-y divide-border">
            {TYPES.map((item) => (
              <li
                key={item.type}
                className="grid gap-2 py-5 md:grid-cols-[120px_minmax(0,0.7fr)_minmax(0,1.4fr)] md:items-baseline md:gap-8"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
                  {item.type}
                </span>
                <strong className="font-heading text-[22px] tracking-[-0.04em]">
                  {item.title}
                </strong>
                <p className="text-[16px] text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="zataz"
          className="scroll-mt-20 relative overflow-hidden border-t border-border px-4 py-16 md:px-10"
        >
          <p className="pointer-events-none absolute -right-6 top-8 font-heading text-[clamp(80px,18vw,220px)] leading-none tracking-[-0.1em] text-primary/12">
            k6
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
            Záťaž na požiadanie
          </p>
          <h2 className="relative mt-2 max-w-[14ch] font-heading text-[clamp(32px,5vw,56px)] leading-[0.94] tracking-[-0.06em]">
            Nestačí, že to žije. Zvládne to tlak?
          </h2>
          <p className="relative mt-6 max-w-[48ch] text-[19px] text-muted-foreground">
            k6 nie je ďalší monitor. Je to test, ktorý spustíš, keď chceš
            vedieť p95 a fail rate. Beh sa vráti hneď ako RUNNING; keď k6
            dopíše summary, uvidíš čísla.
          </p>
          <dl className="relative mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                VUs
              </dt>
              <dd className="mt-1 font-heading text-[28px] tracking-[-0.05em]">
                1–50
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Trvanie
              </dt>
              <dd className="mt-1 font-heading text-[28px] tracking-[-0.05em]">
                5–120 s
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Výsledok
              </dt>
              <dd className="mt-1 font-heading text-[28px] tracking-[-0.05em]">
                p95 · fail
              </dd>
            </div>
          </dl>
        </section>

        <section className="scroll-mt-20 border-t border-border px-4 py-16 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                Upozornenia
              </p>
              <h2 className="mt-2 font-heading text-[clamp(32px,5vw,52px)] leading-[0.94] tracking-[-0.06em]">
                Flota ti napíše, keď je ticho zlé.
              </h2>
              <p className="mt-5 max-w-[40ch] text-[18px] text-muted-foreground">
                DOWN, recovery, koniec k6 behu. Neprečítané majú pruh. V
                nastaveniach vieš vypnúť recovery, ak ťa zaujíma len pád.
              </p>
            </div>
            <aside className="rotate-1 rounded-[24px] border border-border bg-card/70 p-6 shadow-[12px_18px_0_rgba(232,255,71,0.08)]">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-down">
                ALERT
              </p>
              <p className="mt-3 font-heading text-[26px] tracking-[-0.04em]">
                Databáza orders je DOWN
              </p>
              <p className="mt-2 text-muted-foreground">
                Posledný check neodpovedal v timeout. Otvor monitor a spusti
                kontrolu znova, alebo pozeraj históriu.
              </p>
              <p className="mt-4 font-mono text-xs text-muted-foreground">
                pred 12 s · NEW
              </p>
            </aside>
          </div>
        </section>

        <section
          id="cta"
          aria-labelledby="cta-heading"
          className="relative overflow-hidden bg-primary px-4 py-16 text-primary-foreground md:px-10 md:py-20"
        >
          <p className="pointer-events-none absolute -right-4 -bottom-8 font-heading text-[clamp(96px,22vw,260px)] leading-none tracking-[-0.12em] text-primary-foreground/12">
            now
          </p>
          <div className="relative grid items-end gap-10 lg:grid-cols-[minmax(0,1.3fr)_auto]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary-foreground/70">
                Ďalší krok
              </p>
              <h2
                id="cta-heading"
                className="mt-3 max-w-[14ch] font-heading text-[clamp(40px,7vw,84px)] font-extrabold leading-[0.88] tracking-[-0.07em]"
              >
                Prvý monitor
                <em className="mt-1 block font-sans text-[0.58em] font-medium italic tracking-[-0.04em]">
                  za jednu minútu.
                </em>
              </h2>
              <p className="mt-5 max-w-[36ch] text-[19px] leading-snug text-primary-foreground/75">
                Účet je zadarmo. Pridáš HTTP GET na službu, ktorá má zostať
                nažive. Keď spadne, uvidíš to skôr ako ticket.
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 lg:items-end">
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-11 bg-primary-foreground px-5 text-primary hover:bg-primary-foreground/90"
                >
                  <a href="#vstup">Vytvoriť účet</a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 border-primary-foreground/35 bg-transparent px-5 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/vstup">Už mám účet</Link>
                </Button>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-primary-foreground/65">
                <li>Bez karty</li>
                <li>9 typov kontrol</li>
                <li>k6 na požiadanie</li>
              </ul>
            </div>
          </div>
        </section>

        <section
          id="otazky"
          className="scroll-mt-20 border-t border-border px-4 py-16 md:px-10"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
            Otázky
          </p>
          <h2 className="mt-2 font-heading text-[clamp(32px,5vw,52px)] leading-[0.94] tracking-[-0.06em]">
            Stručne, bez žargónu navyše.
          </h2>
          <div className="mt-10 max-w-3xl">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group border-t border-border py-5 first:border-t-0"
              >
                <summary className="cursor-pointer list-none font-heading text-[22px] tracking-[-0.04em] marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-4">
                    {item.q}
                    <span className="font-mono text-sm text-primary group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 max-w-[62ch] text-[17px] text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section
          id="vstup"
          className="scroll-mt-20 relative border-t border-border px-4 py-16 md:px-10"
        >
          <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="lg:sticky lg:top-24">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                Vstup
              </p>
              <h2 className="mt-2 font-heading text-[clamp(36px,5vw,64px)] leading-[0.9] tracking-[-0.07em]">
                Pridaj prvý cieľ ešte dnes.
              </h2>
              <p className="mt-5 max-w-[34ch] text-[19px] text-muted-foreground">
                Email a heslo. Potom HTTP GET na endpoint, ktorý má zostať
                nažive. Konštelácia prestane byť prázdna.
              </p>
            </div>
            <AuthCard />
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-8 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <p className="font-heading text-lg tracking-[-0.05em]">
            pulse
            <em className="ml-1 font-sans italic text-primary">watch</em>
          </p>
          <p className="max-w-[46ch] text-sm text-muted-foreground">
            Monitoring dostupnosti, SSL a k6 záťaže. GraphQL API.{" "}
            <Link href="/vstup" className="text-foreground underline-offset-4 hover:underline">
              Prihlásenie
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
