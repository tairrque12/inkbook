"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const FREE_FEATURES = [
  "Hosted booking page",
  "Consultation request form",
  "Availability calendar",
  "Email notifications",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Direct Stripe deposit collection",
  "Client dashboard",
  "Priority support",
];

export default function PlanPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <main className="bg-black min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-border">
        <Link href="/" className="text-cream font-semibold tracking-widest text-sm uppercase hover:opacity-70 transition-opacity">
          inkbook
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <p className="text-[10px] tracking-[0.45em] uppercase text-muted mb-4">Step 2 of 6</p>
          <h1 className="text-3xl md:text-4xl font-light text-cream mb-2">Choose your plan.</h1>
          <p className="text-muted text-sm font-light mb-12">You can upgrade anytime.</p>

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

            {/* Pro */}
            <div className="border border-gold/40 p-8 flex flex-col gap-6 relative">
              <div className="absolute top-5 right-5">
                <span className="text-[9px] tracking-widest uppercase bg-gold/10 text-gold px-3 py-1.5 border border-gold/20">
                  Popular
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
                  <div key={f} className="flex items-center gap-3">
                    <span className="text-gold text-xs shrink-0">✓</span>
                    <span className="text-muted text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href={`/onboarding/${slug}/profile?plan=pro`}
                className="mt-auto inline-flex items-center justify-center h-11 bg-gold text-black text-[11px] tracking-widest uppercase hover:bg-gold/90 transition-colors font-semibold"
              >
                Start with Pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
