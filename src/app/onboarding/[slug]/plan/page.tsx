"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const FREE_FEATURES = [
  "Hosted booking page",
  "Consultation request form",
  "Availability calendar",
  "Pricing guide",
  "Email notifications",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Direct Stripe deposit collection",
  "Client dashboard",
  "Priority support",
  "AI booking agent — handles client chats & bookings for you",
  "Tattoo visualizer — customers preview your art on their body before the appointment",
];

export default function PlanPage() {
  const { slug } = useParams<{ slug: string }>();
  const [betaEmail, setBetaEmail] = useState("");
  const [betaSubmitted, setBetaSubmitted] = useState(false);

  function handleBetaSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!betaEmail.trim()) return;
    setBetaSubmitted(true);
  }

  return (
    <main className="bg-black min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-border">
        <Link
          href="/"
          className="text-cream font-semibold tracking-widest text-sm uppercase hover:opacity-70 transition-opacity"
        >
          inkbook
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <p className="text-[10px] tracking-[0.45em] uppercase text-muted mb-4">Step 2 of 6</p>
          <h1 className="text-3xl md:text-4xl font-light text-cream mb-2">Choose your plan.</h1>
          <p className="text-muted text-sm font-light mb-12">
            Free forever. Pro is coming soon.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="border border-border p-8 flex flex-col gap-6">
              <div>
                <p className="text-[10px] tracking-widest uppercase text-muted mb-3">Free</p>
                <div className="flex items-end gap-1.5">
                  <p className="text-cream font-light text-5xl">$0</p>
                  <p className="text-muted text-sm mb-1.5">/mo</p>
                </div>
              </div>
              <div className="border-t border-border pt-5 flex flex-col gap-3">
                {FREE_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <span className="text-gold text-xs shrink-0">✓</span>
                    <span className="text-muted text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href={`/onboarding/${slug}/profile?plan=free`}
                className="mt-auto inline-flex items-center justify-center h-11 bg-cream text-black text-[11px] tracking-widest uppercase hover:bg-cream/90 transition-colors font-semibold"
              >
                Start free
              </Link>
            </div>

            {/* Pro — coming soon */}
            <div className="border border-gold/40 p-8 flex flex-col gap-6 relative">
              <div className="absolute top-5 right-5">
                <span className="text-[9px] tracking-widest uppercase bg-gold/10 text-gold px-3 py-1.5 border border-gold/20">
                  Coming Soon
                </span>
              </div>

              <div>
                <p className="text-[10px] tracking-widest uppercase text-gold mb-3">Pro</p>
                <div className="flex items-end gap-1.5">
                  <p className="text-cream font-light text-5xl">$19</p>
                  <p className="text-muted text-sm mb-1.5">/mo</p>
                </div>
              </div>

              <div className="border-t border-border pt-5 flex flex-col gap-3">
                {PRO_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <span className="text-gold text-xs shrink-0 mt-0.5">✓</span>
                    <span className="text-sm leading-snug">
                      {f.startsWith("AI") ? (
                        <>
                          <span className="text-gold">AI booking agent</span>
                          <span className="text-muted"> — handles client chats &amp; bookings for you</span>
                        </>
                      ) : f.startsWith("Tattoo") ? (
                        <>
                          <span className="text-gold">Tattoo visualizer</span>
                          <span className="text-muted"> — customers preview your art on their body before the appointment</span>
                        </>
                      ) : (
                        <span className="text-muted">{f}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Beta signup */}
              <div className="mt-auto border-t border-border pt-5">
                {betaSubmitted ? (
                  <div className="flex flex-col gap-2 py-1">
                    <span className="text-gold text-lg leading-none">✓</span>
                    <p className="text-cream text-sm font-light">You&apos;re on the beta list.</p>
                    <p className="text-muted text-xs">
                      We&apos;ll email <span className="text-cream">{betaEmail}</span> when Pro launches.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleBetaSubmit} className="flex flex-col gap-3">
                    <p className="text-muted text-xs leading-relaxed">
                      Get early access when Pro launches — join the beta.
                    </p>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={betaEmail}
                      onChange={(e) => setBetaEmail(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="h-11 bg-gold/10 border border-gold/40 text-gold text-[11px] tracking-widest uppercase hover:bg-gold/20 transition-colors font-semibold"
                    >
                      Join Pro beta →
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
