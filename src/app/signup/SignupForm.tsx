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
  const [loading, setLoading] = useState(false);

  // Auto-derive slug from name until user edits it manually
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(`/onboarding/${data.slug}/plan`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
            className="pl-[calc(theme(spacing.4)+var(--prefix-width,5.5rem))]"
            style={{ paddingLeft: `calc(1rem + ${baseUrl.length + 1}ch)` }}
            placeholder="miguel-torres"
          />
        </div>
        {slug && (
          <p className="text-[10px] text-muted mt-1.5">
            {baseUrl}/{slug}
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
        disabled={loading || !slug}
        className="h-12 bg-cream text-black text-[11px] tracking-widest uppercase font-semibold hover:bg-cream/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Creating your account…" : "Create my account"}
      </button>
    </form>
  );
}
