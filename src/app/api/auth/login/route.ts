import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email?.trim() || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Verify credentials using anon client (service role cannot check passwords)
  const authClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  // Look up their artist slug by user ID
  const adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: artist } = await adminClient
    .from("artists")
    .select("slug, onboarding_complete")
    .eq("id", authData.user.id)
    .single();

  if (!artist) {
    return NextResponse.json({ error: "No artist profile found for this account." }, { status: 404 });
  }

  // If they never finished onboarding, send them back there
  if (!artist.onboarding_complete) {
    return NextResponse.json({ slug: artist.slug, onboarding_complete: false });
  }

  return NextResponse.json({ slug: artist.slug, onboarding_complete: true });
}
