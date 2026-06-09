"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STYLE_OPTIONS = [
  "Realism", "Portrait", "Black & Grey", "Traditional", "Neo-Traditional",
  "Japanese", "Fine Line", "Blackwork", "Geometric", "Watercolor",
  "Illustrative", "Lettering", "Abstract", "Dotwork", "Tribal",
];

export function ProfileForm({ slug, plan }: { slug: string; plan: string }) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [error, setError] = useState("");

  function toggleStyle(style: string) {
    setStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (styles.length === 0) {
      setError("Select at least one style.");
      return;
    }
    setError("");

    sessionStorage.setItem(
      "inkbook_profile",
      JSON.stringify({ location, bio, instagram, styles, plan })
    );

    router.push(`/onboarding/${slug}/portfolio?plan=${plan}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Location */}
      <div>
        <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
          City / Location
        </label>
        <input
          type="text"
          placeholder="Austin, TX"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
          About you
        </label>
        <textarea
          placeholder="Tell clients about your style, experience, and what makes your work unique..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          required
          className="resize-none"
        />
      </div>

      {/* Instagram */}
      <div>
        <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
          Instagram handle
        </label>
        <input
          type="text"
          placeholder="@yourhandle"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
      </div>

      {/* Styles */}
      <div>
        <label className="block text-[10px] tracking-widest uppercase text-muted mb-3">
          Tattoo styles <span className="normal-case">(pick all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((style) => {
            const selected = styles.includes(style);
            return (
              <button
                key={style}
                type="button"
                onClick={() => toggleStyle(style)}
                className={`px-3 py-1.5 text-xs tracking-wide border transition-colors ${
                  selected
                    ? "border-gold text-gold bg-gold/10"
                    : "border-border text-muted hover:border-cream/40 hover:text-cream"
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        className="h-12 bg-cream text-black text-[11px] tracking-widest uppercase font-semibold hover:bg-cream/90 transition-colors"
      >
        Continue →
      </button>
    </form>
  );
}
