import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/shared/seo/site";

export function JsonLd() {
  const origin = getSiteUrl();
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: origin,
        name: SITE_NAME,
        inLanguage: "sk-SK",
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${origin}/#app`,
        name: SITE_NAME,
        url: origin,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        inLanguage: "sk-SK",
        description: SITE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
        featureList: [
          "HTTP monitoring",
          "Redis monitoring",
          "Databázový monitoring",
          "TCP port check",
          "SSL certifikát",
          "DNS záznamy",
          "SMTP",
          "Kafka",
          "gRPC health",
          "k6 záťažové testy",
          "Upozornenia pri výpadku",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${origin}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Čo PulseWatch robí?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Pravidelne kontroluje, či tvoje služby odpovedajú. Keď prestanú, dostaneš upozornenie. Okrem toho vieš spustiť k6 záťažový test.",
            },
          },
          {
            "@type": "Question",
            name: "Aké služby viem sledovať?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "HTTP, Redis, databázu (Postgres, MySQL, SQLite), TCP port, SSL certifikát, DNS, SMTP, Kafka a gRPC.",
            },
          },
          {
            "@type": "Question",
            name: "Čo je záťažový test v PulseWatch?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Scenár v k6: nastavíš URL, počet virtuálnych používateľov a dĺžku. PulseWatch spustí test a ukáže p95 latenciu a fail rate.",
            },
          },
          {
            "@type": "Question",
            name: "Potrebujem účet?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Áno. Registrácia je zadarmo. Po prihlásení pridáš monitor a uvidíš stav v prehľade.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
