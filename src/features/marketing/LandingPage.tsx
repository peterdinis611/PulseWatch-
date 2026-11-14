import Link from "next/link";
import { AuthCard } from "@/features/auth/AuthCard";
import { SignedInRedirect } from "@/features/auth/SignedInRedirect";
import { HeroDeskScene } from "@/features/marketing/HeroDeskScene";
import { LandingConstellation } from "@/features/marketing/LandingConstellation";
import { LivePulse } from "@/features/marketing/LivePulse";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#types", label: "What it monitors" },
  { href: "#load", label: "Load" },
  { href: "#faq", label: "FAQ" },
];

const TYPES = [
  {
    type: "HTTP",
    title: "Web URL",
    body: "Pings a URL. Configure GET or POST and the expected status, such as 200.",
  },
  {
    type: "REDIS",
    title: "Redis cache",
    body: "Connects to redis://. When the cache goes quiet, you see DOWN.",
  },
  {
    type: "DATABASE",
    title: "Database",
    body: "Postgres, MySQL, or SQLite via connection URL. No response means an alert.",
  },
  {
    type: "TCP",
    title: "Open port",
    body: "Checks whether a host is listening on a port. Great for internal services without HTTP.",
  },
  {
    type: "SSL",
    title: "Certificate",
    body: "Verifies that TLS is still valid and how many days remain until expiry.",
  },
  {
    type: "DNS",
    title: "DNS record",
    body: "A, AAAA, CNAME, MX, NS, TXT. Can compare against an expected value.",
  },
  {
    type: "SMTP",
    title: "Mail server",
    body: "STARTTLS or implicit TLS. Know whether your mail server still accepts connections.",
  },
  {
    type: "KAFKA",
    title: "Kafka broker",
    body: "Broker and, optionally, a topic. TLS as needed.",
  },
  {
    type: "GRPC",
    title: "gRPC health",
    body: "Standard health check for a service. Ideal for internal APIs.",
  },
];

const STEPS = [
  {
    call: "Name what must stay alive",
    response:
      "Add a monitor: a website URL, Redis, a database, a port, or a certificate. Leave the interval at the default — 60 seconds is enough.",
  },
  {
    call: "PulseWatch checks it",
    response:
      "It queries your target in the background. You see the status as a dot in the constellation and in the list: UP, DOWN, or UNKNOWN.",
  },
  {
    call: "When it fails, you know",
    response:
      "You get an alert. You can run a check manually. To see how a service handles pressure, run a k6 scenario.",
  },
];

const FAQS = [
  {
    q: "What does PulseWatch do?",
    a: "It regularly checks that your services respond. When they stop, you get an alert. You can also run a k6 load test against an HTTP endpoint.",
  },
  {
    q: "What can I monitor?",
    a: "Nine types: HTTP, Redis, database, TCP port, SSL certificate, DNS, SMTP, Kafka, and gRPC. Load (k6) is not a monitor — it's a separate on-demand test.",
  },
  {
    q: "What is a load test?",
    a: "A k6 scenario: URL, method, number of virtual users (1–50), and duration (5–120 s). Results show up as p95 latency and fail rate. k6 must be running on the machine hosting the API.",
  },
  {
    q: "Do I need an account?",
    a: "Yes. Sign-up is free. After you sign in, add your first monitor and Overview shows what's up.",
  },
];

export function LandingPage() {
  return (
    <div className="relative z-2">
      <SignedInRedirect />
      <a
        href="#content"
        className="absolute top-[-48px] left-3 z-20 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:top-3"
      >
        Skip to content
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
          aria-label="Page sections"
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
            href="#get-started"
            className="text-[14px] font-medium text-foreground underline-offset-4 hover:underline"
          >
            Get started
          </a>
        </nav>
        <a
          href="#get-started"
          className="text-[14px] font-medium text-foreground md:hidden"
        >
          Get started
        </a>
      </header>

      <main id="content">
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
              <span className="whitespace-nowrap">Know what&apos;s up.</span>
            </span>
            <span className="mask-line mt-1 text-primary">
              <span className="whitespace-nowrap">Before it goes down.</span>
            </span>
          </h1>
          <div className="relative z-[1] flex flex-col gap-8 border-t border-border pt-8 sm:flex-row sm:items-end sm:justify-between">
            <p className="animate-rise max-w-[40ch] text-[clamp(16px,1.6vw,20px)] leading-snug text-muted-foreground [animation-delay:240ms]">
              An overview for people who run websites and APIs. Add a target
              and it checks it on a schedule. When it stops responding, you
              see it here — not in a customer ticket.
            </p>
            <div className="animate-rise flex shrink-0 flex-wrap gap-3 [animation-delay:240ms]">
              <Button asChild size="lg" className="h-11 rounded-md px-5">
                <a href="#get-started">Create account</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 rounded-md px-5"
              >
                <a href="#how">How it works</a>
              </Button>
            </div>
          </div>
        </section>

        <section
          aria-label="Live API status"
          className="border-t border-border px-5 py-10 md:px-10"
        >
          <LivePulse />
          <p className="mt-4 max-w-[40ch] text-[15px] text-muted-foreground">
            These numbers are the live status of this API. You&apos;ll see the
            same thing for your own monitors.
          </p>
        </section>

        <section className="border-t border-border px-5 py-10 md:px-10">
          <LandingConstellation />
          <p className="mt-3 text-[14px] text-muted-foreground">
            Each dot is a different check type · green is UP · red is DOWN
          </p>
        </section>

        <section
          id="how"
          className="scroll-mt-16 border-t border-border px-5 py-20 md:px-10"
        >
          <h2 className="max-w-[14ch] font-heading text-[clamp(32px,5vw,56px)] font-black tracking-[-0.05em]">
            From URL to alert
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
          id="types"
          className="scroll-mt-16 border-t border-border px-5 py-20 md:px-10"
        >
          <h2 className="font-heading text-[clamp(40px,6vw,72px)] font-black tracking-[-0.05em]">
            Not just a ping
            <br />
            to your homepage.
          </h2>
          <p className="mt-6 max-w-[36ch] text-[18px] text-muted-foreground md:ml-auto">
            One tool for your website, cache, database, certificate, and queue.
            Pick a type, enter a target, and it joins the constellation.
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
          id="load"
          className="scroll-mt-16 border-t border-border bg-primary px-5 py-20 text-primary-foreground md:px-10"
        >
          <h2 className="max-w-[16ch] font-heading text-[clamp(36px,6vw,72px)] font-black tracking-[-0.05em]">
            Being up isn&apos;t enough. Can it handle the pressure?
          </h2>
          <p className="mt-6 max-w-[44ch] text-[18px] text-primary-foreground/75">
            k6 isn&apos;t another monitor. It&apos;s a test you run when you
            want p95 and fail rate. The run returns immediately as RUNNING;
            once k6 writes its summary, you see the numbers.
          </p>
          <dl className="mt-12 grid max-w-2xl gap-8 sm:grid-cols-3">
            <div>
              <dt className="text-[13px] text-primary-foreground/65">VUs</dt>
              <dd className="mt-1 font-heading text-[32px] font-black tracking-[-0.04em]">
                1–50
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-primary-foreground/65">Duration</dt>
              <dd className="mt-1 font-heading text-[32px] font-black tracking-[-0.04em]">
                5–120 s
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-primary-foreground/65">
                Result
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
                Your fleet tells you when silence is bad
              </h2>
              <p className="mt-5 max-w-[40ch] text-[17px] text-muted-foreground">
                DOWN, recovery, end of a k6 run. Unread alerts are highlighted
                with a stripe. In Settings you can turn off recovery
                notifications if you only care about outages.
              </p>
            </div>
            <aside
              data-ui
              className="border border-border bg-card p-6"
            >
              <p className="text-[13px] font-medium text-down">ALERT</p>
              <p className="mt-3 font-heading text-[24px] font-black tracking-[-0.04em]">
                Database orders is DOWN
              </p>
              <p className="mt-2 text-[16px] text-muted-foreground">
                The last check timed out without a response. Open the monitor
                and run Check now, or browse the history.
              </p>
              <p className="mt-4 text-[13px] text-muted-foreground">
                12 s ago · NEW
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
            Your first monitor in one minute
          </h2>
          <p className="mt-6 max-w-[38ch] text-[18px] text-muted-foreground">
            The account is free. Add an HTTP GET for a service that has to stay
            up. When it fails, you&apos;ll know before the ticket arrives.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-11 rounded-md px-5">
              <a href="#get-started">Create account</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 rounded-md px-5"
            >
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </section>

        <section
          id="faq"
          className="scroll-mt-16 border-t border-border px-5 py-20 md:px-10"
        >
          <div className="space-y-16">
            <div className="grid gap-4 md:grid-cols-2 md:gap-10">
              <h2 className="font-heading text-[clamp(26px,2.6vw,40px)] font-medium tracking-[-0.03em] text-muted-foreground">
                FAQ
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
          id="get-started"
          className="scroll-mt-16 border-t border-border px-5 py-20 md:px-10"
        >
          <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="lg:sticky lg:top-24">
              <h2 className="font-heading text-[clamp(36px,5vw,64px)] font-black tracking-[-0.05em]">
                Add your first target today
              </h2>
              <p className="mt-5 max-w-[34ch] text-[18px] text-muted-foreground">
                Email and password. Then an HTTP GET on an endpoint that has to
                stay up. The constellation won&apos;t be empty anymore.
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
            Uptime, SSL, and k6 load monitoring. GraphQL API.{" "}
            <Link
              href="/login"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
