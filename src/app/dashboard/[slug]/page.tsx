import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { verifySessionToken } from "@/lib/admin-auth";
import { DashboardClient } from "./DashboardClient";

const SESSION_COOKIE = "inkbook-session";

interface ArtistRow {
  id: string;
  slug: string;
  name: string;
  plan: string | null;
  pricing: PricingTier[] | null;
  available_dates: string[] | null;
}

interface PricingTier {
  label: string;
  price: string;
  deposit: string;
  hours: string;
  description: string;
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Auth check
  const jar = await cookies();
  const token = jar.get(`${SESSION_COOKIE}-${slug}`)?.value ?? "";
  const authenticated = await verifySessionToken(token, slug);
  if (!authenticated) {
    redirect("/login");
  }

  // Fetch artist data
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) redirect("/login");

  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: artist } = await db
    .from("artists")
    .select("id, slug, name, plan, pricing, available_dates")
    .eq("slug", slug)
    .single<ArtistRow>();

  if (!artist) redirect("/login");

  return (
    <DashboardClient
      slug={artist.slug}
      name={artist.name}
      plan={artist.plan ?? "free"}
      initialPricing={artist.pricing ?? []}
      initialAvailableDates={artist.available_dates ?? []}
    />
  );
}
