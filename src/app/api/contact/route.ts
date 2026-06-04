import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import {
  validateImageFiles,
  shouldEmbedInline,
  buildInlineImageHtml,
  buildImageAttachments,
} from "@/lib/image-utils";
import type { ImagePayload } from "@/lib/image-utils";
import { ConsultationService } from "@/services/consultation-service";

export const config = {
  api: { bodyParser: { sizeLimit: "35mb" } },
};

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, phone, idea, placement, preferredDate, budget, message } = body;
  const images: ImagePayload[] = Array.isArray(body.images) ? body.images : [];

  if (!name || !email || !idea) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (images.length > 0) {
    const imageError = validateImageFiles(
      images.map((img) => ({
        name: img.name,
        type: img.type,
        size: Math.round(img.data.length * 0.75),
      }))
    );
    if (imageError) {
      return Response.json({ error: imageError }, { status: 400 });
    }
  }

  // Write consultation to Supabase (best-effort — don't fail the request if DB is down)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      const db = createClient(supabaseUrl, supabaseKey);
      const consultations = new ConsultationService(db as never);
      await consultations.create({
        artistSlug: "miguel",
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        tattooIdea: idea,
        placement,
        budget,
        preferredDate,
        message,
        referenceImageUrls: images.map(img => `data:${img.type};base64,${img.data}`),
      });
    } catch (err) {
      console.error("[inkbook] Failed to write consultation to Supabase:", err);
    }
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

  const embedInline = images.length > 0 && shouldEmbedInline(images);
  const inlineHtml = embedInline ? buildInlineImageHtml(images) : "";
  const attachments = !embedInline && images.length > 0 ? buildImageAttachments(images) : [];
  const imageSection =
    images.length === 0
      ? ""
      : embedInline
        ? `<p><strong>Reference Images:</strong></p>${inlineHtml}`
        : `<p><strong>Reference Images:</strong> ${images.length} image${images.length > 1 ? "s" : ""} attached.</p>`;

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
          ${imageSection}
        </div>
      `,
      ...(attachments.length > 0 && { attachments }),
    });
  } catch (err) {
    console.error("[inkbook] Resend error:", err);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }

  return Response.json({ success: true });
}
