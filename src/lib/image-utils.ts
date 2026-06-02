export const MAX_IMAGES = 3;
export const MAX_BYTES_PER_IMAGE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
// Embed inline instead of attaching when total decoded size exceeds 10MB
export const INLINE_THRESHOLD_BYTES = 10 * 1024 * 1024;

export interface ImagePayload {
  name: string;
  type: string;
  data: string; // base64-encoded
}

export function validateImageFiles(
  files: { name: string; type: string; size: number }[]
): string | null {
  if (files.length > MAX_IMAGES) {
    return `Maximum ${MAX_IMAGES} images allowed.`;
  }
  for (const f of files) {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return `${f.name}: only JPEG and PNG are accepted.`;
    }
    if (f.size > MAX_BYTES_PER_IMAGE) {
      return `${f.name}: images must be under 5MB.`;
    }
  }
  return null;
}

// base64 chars × 0.75 ≈ decoded bytes
export function shouldEmbedInline(images: ImagePayload[]): boolean {
  const totalDecoded = images.reduce((sum, img) => sum + img.data.length * 0.75, 0);
  return totalDecoded > INLINE_THRESHOLD_BYTES;
}

export function buildInlineImageHtml(images: ImagePayload[]): string {
  return images
    .map(
      (img, i) =>
        `<img src="data:${img.type};base64,${img.data}" ` +
        `alt="Reference image ${i + 1}" ` +
        `style="max-width:100%;display:block;margin-top:12px;" />`
    )
    .join("");
}

export function buildImageAttachments(
  images: ImagePayload[]
): { filename: string; content: Buffer }[] {
  return images.map((img) => ({
    filename: img.name,
    content: Buffer.from(img.data, "base64"),
  }));
}
