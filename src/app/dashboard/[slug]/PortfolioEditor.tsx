"use client";

import { useState, useRef } from "react";

interface PortfolioItem {
  id: string;
  imageUrl: string;
}

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_IMAGES = 15;

export function PortfolioEditor({
  slug,
  initialItems,
}: {
  slug: string;
  initialItems: PortfolioItem[];
}) {
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const toAdd = Array.from(files).slice(0, MAX_IMAGES - items.length);

    const invalid = toAdd.find(
      (f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > MAX_FILE_SIZE
    );
    if (invalid) {
      setError("Only JPEG, PNG, and WebP files under 8MB are accepted.");
      return;
    }

    setError("");
    setUploading(true);

    const uploaded: PortfolioItem[] = [];
    for (const file of toAdd) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch(`/api/artists/${slug}/portfolio`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          uploaded.push({ id: `p${Date.now()}-${Math.random().toString(36).slice(2)}`, imageUrl: data.url });
        } else {
          const data = await res.json();
          setError(data.error ?? "Upload failed for one or more files.");
        }
      } catch {
        setError("Network error uploading one or more files.");
      }
    }

    if (uploaded.length > 0) {
      const updated = [...items, ...uploaded];
      setItems(updated);
      await savePortfolio(updated);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function removeItem(id: string) {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    await savePortfolio(updated);
  }

  async function savePortfolio(portfolio: PortfolioItem[]) {
    try {
      await fetch(`/api/artists/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio }),
      });
    } catch {
      setError("Failed to save changes. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-cream text-lg font-light mb-1">Portfolio</h2>
        <p className="text-muted text-sm">
          {items.length === 0
            ? "No photos yet. Upload your work to show clients what you do."
            : `${items.length} photo${items.length !== 1 ? "s" : ""} · visible on your profile`}
        </p>
      </div>

      {/* Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className="relative aspect-square group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt="Portfolio"
                className="w-full h-full object-cover rounded"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded"
              >
                <span className="text-red-400 text-xs tracking-widest uppercase">Remove</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {items.length < MAX_IMAGES && (
        <label
          className={`flex items-center justify-center gap-2 h-12 px-4 border border-dashed border-border rounded cursor-pointer text-sm transition-colors ${
            uploading
              ? "text-muted pointer-events-none"
              : "text-muted hover:border-cream/40 hover:text-cream"
          }`}
        >
          {uploading ? (
            "Uploading…"
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {items.length === 0 ? "Upload photos" : `Add more (${items.length}/${MAX_IMAGES})`}
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}

      <p className="text-[#444] text-xs">
        Up to {MAX_IMAGES} photos · JPEG, PNG, or WebP · 8MB max each
      </p>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
