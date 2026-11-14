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
        inLanguage: "en-US",
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${origin}/#app`,
        name: SITE_NAME,
        url: origin,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        inLanguage: "en-US",
        description: SITE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
        featureList: [
          "HTTP monitoring",
          "Redis monitoring",
          "Database monitoring",
          "TCP port check",
          "SSL certificate monitoring",
          "DNS record checks",
          "SMTP",
          "Kafka",
          "gRPC health",
          "k6 load tests",
          "Downtime alerts",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${origin}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What does PulseWatch do?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It regularly checks that your services respond. When they stop, you get an alert. You can also run a k6 load test.",
            },
          },
          {
            "@type": "Question",
            name: "What can I monitor?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "HTTP, Redis, databases (Postgres, MySQL, SQLite), TCP ports, SSL certificates, DNS, SMTP, Kafka, and gRPC.",
            },
          },
          {
            "@type": "Question",
            name: "What is a load test in PulseWatch?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A k6 scenario: set a URL, number of virtual users, and duration. PulseWatch runs the test and shows p95 latency and fail rate.",
            },
          },
          {
            "@type": "Question",
            name: "Do I need an account?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Sign-up is free. After you sign in, add a monitor and see its status in Overview.",
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
