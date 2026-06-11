import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const cookieHeader = req.cookies.getAll();

  for (const cookie of cookieHeader) {
    if (cookie.name.startsWith("inkbook-session-")) {
      const slug = cookie.name.replace("inkbook-session-", "");
      const valid = await verifySessionToken(cookie.value, slug);
      if (valid) {
        return NextResponse.json({ authenticated: true, slug });
      }
    }
  }

  return NextResponse.json({ authenticated: false, slug: null });
}
