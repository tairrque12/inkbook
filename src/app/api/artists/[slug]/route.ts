import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/admin-auth";

const SESSION_COOKIE = "inkbook-session";

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function isAuthenticated(slug: string): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(`${SESSION_COOKIE}-${slug}`)?.value ?? "";
  return verifySessionToken(token, slug);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = getAdminClient();
  const { data, error } = await db.from("artists").select("*").eq("slug", slug).single();
  if (error || !data) return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const allowed = ["location", "bio", "instagram", "styles", "plan", "onboarding_complete", "name", "portfolio", "pricing", "available_dates"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const db = getAdminClient();
  const { error } = await db.from("artists").update(update).eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!(await isAuthenticated(slug))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminClient();

  // Fetch the artist's auth user ID before deleting
  const { data: artist, error: fetchError } = await db
    .from("artists")
    .select("id")
    .eq("slug", slug)
    .single();

  if (fetchError || !artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  // Delete artist row first (FK cascade will clean related rows if any)
  const { error: deleteError } = await db.from("artists").delete().eq("slug", slug);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  // Delete the Supabase auth user
  await db.auth.admin.deleteUser(artist.id);

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(`${SESSION_COOKIE}-${slug}`);
  return res;
}
