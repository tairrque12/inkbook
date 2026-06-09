"use client";

export function CopyButton({ url }: { url: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(url)}
      className="h-12 border border-border text-cream text-[11px] tracking-widest uppercase hover:border-cream/60 transition-colors"
    >
      Copy link
    </button>
  );
}
