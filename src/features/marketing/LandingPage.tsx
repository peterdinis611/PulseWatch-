import Link from "next/link";
import { AuthCard } from "@/features/auth/AuthCard";
import { SignedInRedirect } from "@/features/auth/SignedInRedirect";
import { HeroDeskScene } from "@/features/marketing/HeroDeskScene";
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
    call: "Pomenuj, čo má žiť",
    response:
      "Pridáš monitor: URL webu, Redis, databázu, port alebo certifikát. Interval nechaj na default — 60 sekúnd stačí.",
  },
  {
    call: "PulseWatch to kontroluje",
    response:
      "Na pozadí sa pýta cieľa. Stav vidíš ako bod v konštelácii a v zozname: HORE, DOLE, alebo ešte neznámy.",
  },
  {
    call: "Keď spadne, vieš to",
    response:
      "Príde upozornenie. Môžeš spustiť kontrolu ručne. Ak chceš vedieť, ako služba zvládne tlačenku, spustíš k6 scenár.",
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
        className="absolute top-[-48px] left-3 z-20 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:top-3"
      >
        Preskočiť na obsah
      </a>
      <header className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 px-5 pt-6 md:px-10">
        <Link
          href="/"
          className="font-heading text-[15px] font-black tracking-[-0.04em]"
        >
          PulseWatch
        </Link>
        <nav
          className="hidden items-center gap-5 md:flex"
          aria-label="Obsah stránky"
        >
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[14px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#vstup"
            className="text-[14px] font-medium text-foreground underline-offset-4 hover:underline"
          >
            Vstúpiť
          </a>
        </nav>
        <a
          href="#vstup"
          className="text-[14px] font-medium text-foreground md:hidden"
        >
          Vstúpiť
        </a>
      </header>

      <main id="obsah">
        <section className="relative grid min-h-[100svh] grid-rows-[1fr_auto] gap-10 overflow-hidden px-5 pb-10 pt-24 md:px-10 md:pt-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[55%] bg-[radial-gradient(ellipse_at_78%_28%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_55%)]"
          />
          <HeroDeskScene className="hero-desk-scene pointer-events-none absolute top-[4%] right-[-4%] z-0 h-[min(42vh,340px)] w-[min(88vw,420px)] opacity-70 sm:opacity-85 md:top-[6%] md:right-[0%] md:h-[min(58vh,520px)] md:w-[min(70vw,640px)] md:opacity-95 lg:right-[4%]" />
          <h1 className="relative z-[1] self-end font-heading text-[clamp(40px,7.2vw,104px)] font-black leading-[0.94] tracking-[-0.05em]">
            <span className="mask-line">
              <span className="whitespace-nowrap">PulseWatch.</span>
            </span>
            <span className="mask-line mt-1">
              <span className="whitespace-nowrap">Vieš, čo je hore.</span>
            </span>
            <span className="mask-line mt-1 text-primary">
              <span className="whitespace-nowrap">Skôr, ako to padne.</span>
            </span>
          </h1>
          <div className="relative z-[1] flex flex-col gap-8 border-t border-border pt-8 sm:flex-row sm:items-end sm:justify-between">
            <p className="animate-rise max-w-[40ch] text-[clamp(16px,1.6vw,20px)] leading-snug text-muted-foreground [animation-delay:240ms]">
              Prehľad pre ľudí, ktorí prevádzkujú weby a API. Pridáš cieľ, on
              ho pravidelne skontroluje. Keď neodpovie, uvidíš to tu — nie až
              v tikete od zákazníka.
            </p>
            <div className="animate-rise flex shrink-0 flex-wrap gap-3 [animation-delay:240ms]">
              <Button asChild size="lg" className="h-11 rounded-md px-5">
                <a href="#vstup">Vytvoriť účet</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 rounded-md px-5"
              >
                <a href="#ako">Ako to funguje</a>
              </Button>
            </div>
          </div>
        </section>

        <section
          aria-label="Živý stav API"
          className="border-t border-border px-5 py-10 md:px-10"
        >
          <LivePulse />
          <p className="mt-4 max-w-[40ch] text-[15px] text-muted-foreground">
            Čísla sú živý stav tohto API. Rovnaký princíp potom uvidíš pri
            svojich monitoroch.
          </p>
        </section>

        <section className="border-t border-border px-5 py-10 md:px-10">
          <LandingConstellation />
          <p className="mt-3 text-[14px] text-muted-foreground">
            Každý bod je iný typ kontroly · zelená hore · červená dole
          </p>
        </section>

        <section
          id="ako"
          className="scroll-mt-16 border-t border-border px-5 py-20 md:px-10"
        >
          <h2 className="max-w-[14ch] font-heading text-[clamp(32px,5vw,56px)] font-black tracking-[-0.05em]">
            Od URL po upozornenie
          </h2>
          <ol className="mx-auto mt-14 max-w-[560px] space-y-14 md:mx-0 md:ml-[min(12vw,8rem)]">
            {STEPS.map((step) => (
              <li key={step.call}>
                <p className="text-[20px] font-medium leading-snug">
                  {step.call}
                </p>
                <p className="mt-4 border border-border bg-card px-5 py-4 text-[16px] text-muted-foreground">
                  {step.response}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="typy"
          className="scroll-mt-16 border-t border-border px-5 py-20 md:px-10"
        >
          <h2 className="font-heading text-[clamp(40px,6vw,72px)] font-black tracking-[-0.05em]">
            Nie len ping
            <br />
            na homepage.
          </h2>
          <p className="mt-6 max-w-[36ch] text-[18px] text-muted-foreground md:ml-auto">
            Jeden nástroj na web, cache, databázu, certifikát aj frontu. Vyberieš
            typ, vyplníš cieľ, ostane v konštelácii.
          </p>
          <ul className="mt-14">
            {TYPES.map((item) => (
              <li
                key={item.type}
                className="grid gap-1 border-t border-border py-6 md:grid-cols-[7rem_minmax(0,0.8fr)_minmax(0,1.4fr)] md:items-baseline md:gap-8"
              >
                <span className="text-[13px] font-medium text-primary">
                  {item.type}
                </span>
                <strong className="font-heading text-[22px] font-black tracking-[-0.03em]">
                  {item.title}
                </strong>
                <p className="text-[16px] text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="zataz"
          className="scroll-mt-16 border-t border-border bg-primary px-5 py-20 text-primary-foreground md:px-10"
        >
          <h2 className="max-w-[16ch] font-heading text-[clamp(36px,6vw,72px)] font-black tracking-[-0.05em]">
            Nestačí, že to žije. Zvládne to tlak?
          </h2>
          <p className="mt-6 max-w-[44ch] text-[18px] text-primary-foreground/75">
            k6 nie je ďalší monitor. Je to test, ktorý spustíš, keď chceš vedieť
            p95 a fail rate. Beh sa vráti hneď ako RUNNING; keď k6 dopíše
            summary, uvidíš čísla.
          </p>
          <dl className="mt-12 grid max-w-2xl gap-8 sm:grid-cols-3">
            <div>
              <dt className="text-[13px] text-primary-foreground/65">VUs</dt>
              <dd className="mt-1 font-heading text-[32px] font-black tracking-[-0.04em]">
                1–50
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-primary-foreground/65">Trvanie</dt>
              <dd className="mt-1 font-heading text-[32px] font-black tracking-[-0.04em]">
                5–120 s
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-primary-foreground/65">
                Výsledok
              </dt>
              <dd className="mt-1 font-heading text-[32px] font-black tracking-[-0.04em]">
                p95 · fail
              </dd>
            </div>
          </dl>
        </section>

        <section className="scroll-mt-16 border-t border-border px-5 py-20 md:px-10">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <h2 className="font-heading text-[clamp(32px,5vw,52px)] font-black tracking-[-0.05em]">
                Flota ti napíše, keď je ticho zlé
              </h2>
              <p className="mt-5 max-w-[40ch] text-[17px] text-muted-foreground">
                DOWN, recovery, koniec k6 behu. Neprečítané majú pruh. V
                nastaveniach vieš vypnúť recovery, ak ťa zaujíma len pád.
              </p>
            </div>
            <aside
              data-ui
              className="border border-border bg-card p-6"
            >
              <p className="text-[13px] font-medium text-down">ALERT</p>
              <p className="mt-3 font-heading text-[24px] font-black tracking-[-0.04em]">
                Databáza orders je DOWN
              </p>
              <p className="mt-2 text-[16px] text-muted-foreground">
                Posledný check neodpovedal v timeout. Otvor monitor a spusti
                kontrolu znova, alebo pozeraj históriu.
              </p>
              <p className="mt-4 text-[13px] text-muted-foreground">
                pred 12 s · NEW
              </p>
            </aside>
          </div>
        </section>

        <section
          id="cta"
          aria-labelledby="cta-heading"
          className="border-t border-border px-5 py-20 md:px-10"
        >
          <h2
            id="cta-heading"
            className="max-w-[16ch] font-heading text-[clamp(40px,7vw,84px)] font-black tracking-[-0.055em]"
          >
            Prvý monitor za jednu minútu
          </h2>
          <p className="mt-6 max-w-[38ch] text-[18px] text-muted-foreground">
            Účet je zadarmo. Pridáš HTTP GET na službu, ktorá má zostať nažive.
            Keď spadne, uvidíš to skôr ako ticket.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-11 rounded-md px-5">
              <a href="#vstup">Vytvoriť účet</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 rounded-md px-5"
            >
              <Link href="/login">Už mám účet</Link>
            </Button>
          </div>
        </section>

        <section
          id="otazky"
          className="scroll-mt-16 border-t border-border px-5 py-20 md:px-10"
        >
          <div className="space-y-16">
            <div className="grid gap-4 md:grid-cols-2 md:gap-10">
              <h2 className="font-heading text-[clamp(26px,2.6vw,40px)] font-medium tracking-[-0.03em] text-muted-foreground">
                Otázky
              </h2>
              <div aria-hidden />
            </div>
            {FAQS.map((item) => (
              <div
                key={item.q}
                className="grid gap-4 md:grid-cols-2 md:items-start md:gap-10"
              >
                <h3 className="font-heading text-[clamp(26px,2.6vw,40px)] font-medium leading-[1.1] tracking-[-0.03em]">
                  {item.q}
                </h3>
                <p className="max-w-[40ch] text-[17px] leading-relaxed text-muted-foreground md:pt-1">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="vstup"
          className="scroll-mt-16 border-t border-border px-5 py-20 md:px-10"
        >
          <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="lg:sticky lg:top-24">
              <h2 className="font-heading text-[clamp(36px,5vw,64px)] font-black tracking-[-0.05em]">
                Pridaj prvý cieľ ešte dnes
              </h2>
              <p className="mt-5 max-w-[34ch] text-[18px] text-muted-foreground">
                Email a heslo. Potom HTTP GET na endpoint, ktorý má zostať
                nažive. Konštelácia prestane byť prázdna.
              </p>
            </div>
            <AuthCard />
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-5 py-8 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <p className="font-heading text-[15px] font-black tracking-[-0.04em]">
            PulseWatch
          </p>
          <p className="max-w-[46ch] text-[14px] text-muted-foreground">
            Monitoring dostupnosti, SSL a k6 záťaže. GraphQL API.{" "}
            <Link
              href="/login"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Prihlásenie
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
