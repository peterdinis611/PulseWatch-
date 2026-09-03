# PulseWatch frontend

Next.js UI pre PulseWatch — monitoring služieb, SSL a k6 záťaže. Celý stack a backend setup sú v [README v koreni](../README.md).

![Landing](../docs/screenshots/landing.png)

## Náhľad

**Landing a CTA**

![Landing CTA](../docs/screenshots/landing-cta.png)

**Prihlásenie**

![Prihlásenie](../docs/screenshots/vstup.png)

**Prehľad** — konštelácia monitorov.

![Prehľad](../docs/screenshots/desk.png)

**Monitory**

![Monitory](../docs/screenshots/monitors.png)

**Záťaž (k6)**

![Záťaž](../docs/screenshots/load.png)

**Upozornenia** — dropdown pri zvončeku.

![Upozornenia](../docs/screenshots/notifications.png)

**Nastavenia**

![Nastavenia](../docs/screenshots/settings.png)

## Spustenie

GraphQL API musí bežať na `:4000`.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Appka je na [http://localhost:3000](http://localhost:3000).

```
NEXT_PUBLIC_GRAPHQL_HTTP=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_WS=ws://localhost:4000/graphql
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm test
npm run lint
```
