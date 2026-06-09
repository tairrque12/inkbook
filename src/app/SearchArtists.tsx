"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Artist {
  slug: string;
  name: string;
  location: string;
  styles: string[];
  bio: string;
}

export function SearchArtists() {
  const [query, setQuery] = useState("");
  const [all, setAll] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/artists")
      .then((r) => r.json())
      .then((data) => setAll(Array.isArray(data) ? data : []))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const results = query.trim()
    ? all.filter((a) => {
        const q = query.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.styles.some((s) => s.toLowerCase().includes(q))
        );
      })
    : all;

  return (
    <section className="py-24 px-6 md:px-16 border-b border-border">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">Artists</p>
        <h2 className="text-3xl md:text-4xl font-light text-cream mb-10">
          Find your artist.
        </h2>

        {/* Search input */}
        <div className="relative mb-10">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by name, city, or style…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border border-border text-cream placeholder:text-muted px-5 py-4 text-sm focus:border-cream/40 outline-none transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-cream transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <p className="text-muted text-sm">Loading artists…</p>
        ) : results.length === 0 ? (
          <p className="text-muted text-sm">No artists found{query ? ` for "${query}"` : ""}.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {results.map((artist) => (
              <Link
                key={artist.slug}
                href={`/${artist.slug}`}
                className="bg-black p-6 flex flex-col gap-3 hover:bg-[#0a0a0a] transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-cream font-light text-lg group-hover:opacity-80 transition-opacity">
                      {artist.name}
                    </p>
                    <p className="text-muted text-xs mt-0.5">{artist.location}</p>
                  </div>
                  <span className="text-muted text-xs mt-1 shrink-0 group-hover:text-cream transition-colors">
                    →
                  </span>
                </div>
                {artist.styles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {artist.styles.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] tracking-wide text-gold uppercase"
                      >
                        {s}
                      </span>
                    ))}
                    {artist.styles.length > 3 && (
                      <span className="text-[10px] text-muted">
                        +{artist.styles.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
