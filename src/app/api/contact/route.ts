import { Resend } from "resend";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, phone, idea, preferredDate, budget, message } = body;

  if (!name || !email || !idea) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const artistEmail = process.env.ARTIST_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (!artistEmail) {
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // In dev with placeholder key, log and return success
  if (!apiKey || apiKey.includes("placeholder")) {
    console.log("[inkbook] Consultation request (email not sent — no API key):", body);
    return Response.json({ success: true });
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: "inkbook <noreply@ink-book.com>",
      to: artistEmail,
      subject: `New consultation request from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #000; color: #F5F0E8;">
          <h2 style="color: #C9A96E; margin-top: 0;">New Consultation Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Tattoo Idea:</strong> ${idea}</p>
          <p><strong>Preferred Date:</strong> ${preferredDate}</p>
          <p><strong>Budget:</strong> ${budget}</p>
          <p><strong>Message:</strong> ${message}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[inkbook] Resend error:", err);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }

  return Response.json({ success: true });
}
