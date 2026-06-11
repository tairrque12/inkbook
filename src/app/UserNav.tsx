"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function UserNav() {
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.slug) {
          setSlug(data.slug);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-10 w-10 flex items-center justify-center">
        <div className="w-5 h-5 border border-cream/20 rounded-full" />
      </div>
    );
  }

  if (slug) {
    return (
      <Link
        href={`/dashboard/${slug}`}
        className="h-10 w-10 flex items-center justify-center border border-cream text-cream hover:bg-cream hover:text-black transition-colors rounded-full"
        title="Dashboard"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </Link>
    );
  }

  return (
    <Link
      href="/signup"
      className="h-10 px-5 border border-cream text-cream text-xs tracking-widest uppercase hover:bg-cream hover:text-black transition-colors flex items-center"
    >
      Get started free
    </Link>
  );
}
