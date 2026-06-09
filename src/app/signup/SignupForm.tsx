"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-derive slug from name until user edits it manually
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  // Debounced slug availability check
  useEffect(() => {
    if (!slug) {
      setSlugAvailable(null);
      return;
    }
    setSlugChecking(true);
    setSlugAvailable(null);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/signup?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        setSlugAvailable(data.available ?? false);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (slugAvailable === false) {
      setError("That booking URL is already taken. Please choose another.");
      return;
    }
    if (!slugAvailable) {
      setError("Please wait for the URL check to finish.");
      return;
    }

    setLoading(true);

    // Store credentials in sessionStorage — account is created at the END of onboarding
    sessionStorage.setItem(
      "inkbook_signup",
      JSON.stringify({ name, slug, email, password })
    );

    router.push(`/onboarding/${slug}/plan`);
  }

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.host
      : "ink-book.com";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Name */}
      <div>
        <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
          Your name
        </label>
        <input
          type="text"
          required
          placeholder="Miguel Torres"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          autoFocus
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
          Your booking URL
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">
            {baseUrl}/
          </span>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
            }}
            style={{ paddingLeft: `calc(1rem + ${baseUrl.length + 1}ch)` }}
            placeholder="miguel-torres"
          />
        </div>
        {slug && (
          <p className="text-[10px] mt-1.5">
            {slugChecking ? (
              <span className="text-muted">Checking availability…</span>
            ) : slugAvailable === true ? (
              <span className="text-green-500">✓ {baseUrl}/{slug} is available</span>
            ) : slugAvailable === false ? (
              <span className="text-red-400">✗ That URL is already taken</span>
            ) : (
              <span className="text-muted">{baseUrl}/{slug}</span>
            )}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
          Email
        </label>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
          Password
        </label>
        <input
          type="password"
          required
          minLength={8}
          placeholder="8+ characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !slug || slugAvailable === false || slugChecking}
        className="h-12 bg-cream text-black text-[11px] tracking-widest uppercase font-semibold hover:bg-cream/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "One moment…" : "Continue →"}
      </button>

      <p className="text-[10px] text-muted text-center">
        Your account is created at the end of setup.
      </p>
    </form>
  );
}
