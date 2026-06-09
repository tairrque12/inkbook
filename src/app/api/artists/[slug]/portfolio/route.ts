import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, and WebP are accepted" }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 8MB" }, { status: 400 });
  }

  const db = getAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await db.storage
    .from("portfolio")
    .upload(filename, arrayBuffer, { contentType: file.type });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = db.storage.from("portfolio").getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl }, { status: 201 });
}
