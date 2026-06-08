"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <span className="text-gold text-3xl leading-none">✓</span>
        <p className="text-cream text-xl font-light">You&apos;re on the list.</p>
        <p className="text-muted text-sm">
          We&apos;ll reach out to <span className="text-cream">{email}</span> when your spot opens up.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      <div>
        <label className="text-[10px] tracking-widest uppercase text-muted mb-2 block">
          Email
        </label>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="text-[10px] tracking-widest uppercase text-muted mb-2 block">
          Instagram handle
        </label>
        <input
          type="text"
          placeholder="@yourhandle"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="h-12 px-8 bg-cream text-black text-[11px] tracking-widest uppercase hover:bg-cream/90 transition-colors font-semibold"
      >
        Request early access
      </button>
    </form>
  );
}
