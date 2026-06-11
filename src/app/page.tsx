import type { Metadata } from "next";
import Link from "next/link";
import { FeatureRequestForm } from "./FeatureRequestForm";
import { SearchArtists } from "./SearchArtists";
import { ProWaitlistCard } from "./ProWaitlistCard";

export const metadata: Metadata = {
  title: "inkbook — Booking pages for tattoo artists",
  description:
    "Your professional booking page, live in 3 clicks. Replace client DMs with ink-book.",
};

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Create your account",
    desc: "Sign up with your email. Your profile is yours — no studio required.",
  },
  {
    num: "02",
    title: "Set your availability",
    desc: "Choose which days and time slots you're open for consultations.",
  },
  {
    num: "03",
    title: "Share your link",
    desc: "Drop ink-book.com/you in your bio. Clients book directly — no DMs needed.",
  },
];

const FREE_FEATURES = [
  "Hosted booking page",
  "Consultation request form",
  "Availability calendar",
  "Email notifications",
];


export default function LandingPage() {
  return (
    <main className="bg-black min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-border">
        <span className="text-cream font-semibold tracking-widest text-sm uppercase">
          inkbook
        </span>
        <Link
          href="/signup"
          className="h-10 px-5 border border-cream text-cream text-xs tracking-widest uppercase hover:bg-cream hover:text-black transition-colors flex items-center"
        >
          Get started free
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 border-b border-border overflow-hidden">
        <div className="max-w-4xl">
          <p className="hero-line-1 text-[10px] tracking-[0.45em] text-muted uppercase mb-8">
            For tattoo artists
          </p>
          <h1
            className="hero-line-2 font-light tracking-tight text-cream leading-none mb-8"
            style={{ fontSize: "clamp(2.8rem, 9vw, 6.5rem)" }}
          >
            Your booking page.
            <br />
            Live in 3 clicks.
          </h1>
          <div className="hero-line-3 flex items-start gap-5 mb-12">
            <div className="w-8 h-px bg-[#2a2a2a] shrink-0 mt-3" />
            <p className="text-muted text-lg md:text-xl font-light max-w-xl leading-relaxed">
              Stop managing client DMs. ink-book gives you a professional
              booking page so clients can request consultations, see your
              availability, and pay deposits — all without the back-and-forth.
            </p>
          </div>
          <div className="hero-line-4 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center h-12 px-8 bg-cream text-black text-[11px] tracking-widest uppercase hover:bg-cream/90 transition-colors font-semibold"
            >
              Get started free
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center h-12 px-8 border border-border text-cream text-[11px] tracking-widest uppercase hover:border-cream/60 transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="hero-line-4 absolute bottom-8 left-6 md:left-16 flex items-center gap-3 text-[#2a2a2a]">
          <div className="h-px w-5 bg-current" />
          <span className="text-[9px] tracking-[0.45em] uppercase">Scroll</span>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-24 px-6 md:px-16 border-b border-border"
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-cream mb-16">
            Three steps. That&apos;s it.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.num}
                className="bg-black p-8 md:p-10 flex flex-col gap-5"
              >
                <p className="text-gold text-xs tracking-widest uppercase">
                  {step.num}
                </p>
                <h3 className="text-cream text-xl font-light">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed font-light">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artist Search */}
      <SearchArtists />

      {/* Pricing */}
      <section className="py-24 px-6 md:px-16 border-b border-border bg-card">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">
            Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-cream mb-4">
            Simple. No surprises.
          </h2>
          <p className="text-muted text-sm mb-16 font-light">
            Start free. Upgrade when you&apos;re ready to take deposits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="border border-border p-8 flex flex-col gap-6 hover:border-cream/40 transition-colors">
              <div>
                <p className="text-[10px] tracking-widest uppercase text-muted mb-3">
                  Free
                </p>
                <div className="flex items-end gap-1.5">
                  <p className="text-cream font-light" style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)" }}>
                    $0
                  </p>
                  <p className="text-muted text-sm mb-2">/mo</p>
                </div>
              </div>

              <div className="border-t border-border pt-6 flex flex-col gap-3.5">
                {FREE_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <span className="text-gold text-xs shrink-0">✓</span>
                    <span className="text-muted text-sm">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className="mt-auto inline-flex items-center justify-center h-11 border border-cream/40 text-cream text-[11px] tracking-widest uppercase hover:bg-cream hover:text-black transition-colors"
              >
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <ProWaitlistCard />
          </div>
        </div>
      </section>

      {/* Feature Request */}
      <section id="feedback" className="py-24 px-6 md:px-16 border-b border-border">
        <div className="max-w-lg mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">
            Shape inkbook
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-cream mb-4">
            What do you wish you had?
          </h2>
          <p className="text-muted text-sm mb-12 font-light leading-relaxed">
            We&apos;re building inkbook for tattoo artists — and we want to hear
            from you. What tools would make your life easier? What&apos;s
            missing from the platforms you use now?
          </p>
          <FeatureRequestForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <span className="text-cream font-semibold tracking-widest text-sm uppercase">
            inkbook
          </span>
          <div className="flex items-center gap-4">
            <span>© 2026 ink-book.com</span>
            <span className="text-border">·</span>
            <Link
              href="/miguel"
              className="hover:text-cream transition-colors"
            >
              See a live example →
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
