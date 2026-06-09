import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "inkbook-session";

export async function POST(req: NextRequest) {
  const { slug } = await req.json().catch(() => ({ slug: "" }));
  const res = NextResponse.json({ ok: true });
  if (slug) {
    res.cookies.delete(`${SESSION_COOKIE}-${slug}`);
  }
  return res;
}
