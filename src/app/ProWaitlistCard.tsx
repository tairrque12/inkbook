"use client";

import { useState } from "react";

const PRO_FEATURES = [
  "Everything in Free",
  "Direct Stripe deposit collection",
  "Client dashboard",
  "Priority support",
  { label: "AI booking agent", sub: "handles client chats & bookings for you" },
  { label: "Tattoo visualizer", sub: "customers preview your art on their body before the appointment" },
];

export function ProWaitlistCard() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <div className="border border-gold/40 p-8 flex flex-col gap-6 relative">
      <div className="absolute top-5 right-5">
        <span className="text-[9px] tracking-widest uppercase bg-gold/10 text-gold px-3 py-1.5 border border-gold/20">
          Coming Soon
        </span>
      </div>

      <div>
        <p className="text-[10px] tracking-widest uppercase text-gold mb-3">Pro</p>
        <div className="flex items-end gap-1.5">
          <p className="text-cream font-light" style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)" }}>
            $19
          </p>
          <p className="text-muted text-sm mb-2">/mo</p>
        </div>
      </div>

      <div className="border-t border-border pt-6 flex flex-col gap-3.5">
        {PRO_FEATURES.map((f) => {
          if (typeof f === "string") {
            return (
              <div key={f} className="flex items-center gap-3">
                <span className="text-gold text-xs shrink-0">✓</span>
                <span className="text-muted text-sm">{f}</span>
              </div>
            );
          }
          return (
            <div key={f.label} className="flex items-start gap-3">
              <span className="text-gold text-xs shrink-0 mt-0.5">✓</span>
              <span className="text-sm leading-snug">
                <span className="text-cream font-medium">{f.label}</span>
                <span className="text-muted"> — {f.sub}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto border-t border-border pt-5">
        {submitted ? (
          <div className="flex flex-col gap-2.5">
            <span className="text-gold text-xl leading-none">✓</span>
            <p className="text-cream text-sm font-light">You&apos;re on the list.</p>
            <p className="text-muted text-xs leading-relaxed">
              We&apos;ll send a link to{" "}
              <span className="text-cream">{email}</span> the moment Pro goes
              live. Your first month is completely free.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-muted text-xs leading-relaxed">
              Join the beta — get your first month free when Pro launches.
            </p>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className="h-11 bg-gold/10 border border-gold/40 text-gold text-[11px] tracking-widest uppercase hover:bg-gold/20 transition-colors font-semibold"
            >
              Join Pro waitlist →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
