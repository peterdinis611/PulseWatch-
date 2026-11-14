import type { Metadata } from "next";
import { PublicStatusView } from "@/features/status/PublicStatusView";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Status · ${slug}`,
    description: `Aktuálny stav služieb – ${slug}.`,
    alternates: { canonical: `/status/${slug}` },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  return <PublicStatusView slug={slug} />;
}
