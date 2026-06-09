import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ARTISTS } from "@/lib/mock-artists";

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET() {
  const db = getAdminClient();

  // DB artists
  let dbArtists: { slug: string; name: string; location: string; styles: string[]; bio: string }[] = [];
  if (db) {
    const { data } = await db
      .from("artists")
      .select("slug, name, location, styles, bio")
      .eq("onboarding_complete", true);
    dbArtists = data ?? [];
  }

  // Merge mock artists that aren't already in DB
  const dbSlugs = new Set(dbArtists.map((a) => a.slug));
  const mockArtists = ARTISTS
    .filter((a) => !dbSlugs.has(a.slug))
    .map((a) => ({ slug: a.slug, name: a.name, location: a.location, styles: a.styles, bio: a.bio }));

  return NextResponse.json([...dbArtists, ...mockArtists]);
}
