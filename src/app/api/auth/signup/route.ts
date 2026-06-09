import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSessionToken } from "@/lib/admin-auth";

const SESSION_COOKIE = "inkbook-session";
const TTL_SECONDS = 24 * 60 * 60;

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const RESERVED_SLUGS = new Set(["admin", "api", "signup", "login", "welcome", "miguel"]);

export async function POST(req: NextRequest) {
  let body: { name?: string; slug?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, slug, email, password } = body;

  // Validate
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!slug?.trim()) return NextResponse.json({ error: "Booking URL is required" }, { status: 400 });
  if (!email?.trim()) return NextResponse.json({ error: "Email is required" }, { status: 400 });
  if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const cleanSlug = slug.toLowerCase().trim();
  if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
    return NextResponse.json({ error: "Booking URL can only contain letters, numbers, and hyphens" }, { status: 400 });
  }
  if (RESERVED_SLUGS.has(cleanSlug)) {
    return NextResponse.json({ error: "That booking URL is not available" }, { status: 400 });
  }

  const db = getAdminClient();

  // Check slug uniqueness
  const { data: existing } = await db.from("artists").select("slug").eq("slug", cleanSlug).single();
  if (existing) {
    return NextResponse.json({ error: "That booking URL is already taken" }, { status: 409 });
  }

  // Create auth user (auto-confirm email for now)
  const { data: authData, error: authError } = await db.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message?.includes("already registered")) {
      return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Insert artist profile
  const { error: insertError } = await db.from("artists").insert({
    id: authData.user.id,
    slug: cleanSlug,
    name: name.trim(),
    email: email.trim().toLowerCase(),
  });

  if (insertError) {
    // Roll back the auth user to avoid orphaned accounts
    await db.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: "Failed to create profile. Please try again." }, { status: 500 });
  }

  const token = await createSessionToken(cleanSlug);
  const res = NextResponse.json({ slug: cleanSlug }, { status: 201 });
  res.cookies.set(`${SESSION_COOKIE}-${cleanSlug}`, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
