"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const MAX_PORTFOLIO_IMAGES = 15;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

interface ImageEntry {
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  url?: string;
  errorMsg?: string;
}

export function PortfolioUpload({ slug, plan }: { slug: string; plan: string }) {
  const router = useRouter();
  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_PORTFOLIO_IMAGES - entries.length;
    const toAdd = files.slice(0, remaining);

    const invalid = toAdd.find(
      (f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > MAX_FILE_SIZE
    );
    if (invalid) {
      setError("Only JPEG, PNG, and WebP files under 8MB are accepted.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError("");
    const newEntries: ImageEntry[] = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending",
    }));
    setEntries((prev) => [...prev, ...newEntries]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeEntry(index: number) {
    setEntries((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function uploadEntry(entry: ImageEntry, index: number): Promise<string | null> {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, status: "uploading" } : e))
    );

    const formData = new FormData();
    formData.append("file", entry.file);

    try {
      const res = await fetch(`/api/artists/${slug}/portfolio`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, status: "done", url: data.url } : e))
      );
      return data.url as string;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, status: "error", errorMsg: msg } : e))
      );
      return null;
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    const pendingIndices = entries
      .map((e, i) => ({ e, i }))
      .filter(({ e }) => e.status === "pending" || e.status === "error");

    const urls: string[] = entries
      .filter((e) => e.status === "done" && e.url)
      .map((e) => e.url!);

    for (const { e, i } of pendingIndices) {
      if (e.status === "error") {
        setEntries((prev) =>
          prev.map((entry, idx) => (idx === i ? { ...entry, status: "pending" } : entry))
        );
      }
      const url = await uploadEntry(entries[i], i);
      if (url) urls.push(url);
    }

    if (entries.length > 0 && urls.length > 0) {
      const portfolio = urls.map((imageUrl, idx) => ({
        id: `p${Date.now()}-${idx}`,
        imageUrl,
      }));
      await fetch(`/api/artists/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio }),
      });
    }

    setSaving(false);
    router.push(`/onboarding/${slug}/pricing?plan=${plan}`);
  }

  function handleSkip() {
    router.push(`/onboarding/${slug}/pricing?plan=${plan}`);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Grid of selected images */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {entries.map((entry, i) => (
            <div key={i} className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.preview}
                alt={`Portfolio ${i + 1}`}
                className="w-full h-full object-cover rounded"
              />
              {entry.status === "uploading" && (
                <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                  <span className="text-cream text-[10px]">Uploading…</span>
                </div>
              )}
              {entry.status === "done" && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px]">✓</span>
                </div>
              )}
              {entry.status === "error" && (
                <div className="absolute inset-0 bg-red-900/60 rounded flex items-center justify-center px-1">
                  <span className="text-red-200 text-[9px] text-center leading-tight">{entry.errorMsg}</span>
                </div>
              )}
              {entry.status !== "uploading" && (
                <button
                  type="button"
                  onClick={() => removeEntry(i)}
                  className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-[#222] text-cream rounded-full flex items-center justify-center text-xs leading-none hover:bg-red-800 transition-colors border border-border"
                  aria-label="Remove"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add photos button */}
      {entries.length < MAX_PORTFOLIO_IMAGES && (
        <label className="flex items-center justify-center gap-2 h-12 px-4 border border-dashed border-border rounded cursor-pointer text-muted text-sm hover:border-cream/40 hover:text-cream transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {entries.length === 0 ? "Select photos" : `Add more (${entries.length}/${MAX_PORTFOLIO_IMAGES})`}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <p className="text-[#444] text-xs">
        Up to {MAX_PORTFOLIO_IMAGES} photos · JPEG, PNG, or WebP · 8MB max per photo
      </p>

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-12 bg-cream text-black text-[11px] tracking-widest uppercase font-semibold hover:bg-cream/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Uploading…" : entries.length === 0 ? "Continue →" : "Save & continue →"}
        </button>
        <button
          type="button"
          onClick={handleSkip}
          disabled={saving}
          className="h-10 text-muted text-xs tracking-wider uppercase hover:text-cream transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
