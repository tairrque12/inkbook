import { notFound } from "next/navigation";
import Image from "next/image";
import { getArtist } from "@/lib/mock-artists";
import { BookingSection } from "./BookingSection";
import { PaymentGrid } from "./PaymentGrid";
import { ScrollReveal } from "./ScrollReveal";
import { StickyHeader } from "./StickyHeader";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = getArtist(slug);

  if (!artist) notFound();

  return (
    <main className="bg-black min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-border">
        <span className="text-cream font-semibold tracking-widest text-sm uppercase">
          inkbook
        </span>
        <a
          href="#book"
          className="h-10 px-5 border border-cream text-cream text-xs tracking-widest uppercase hover:bg-cream hover:text-black transition-colors flex items-center"
        >
          Book Now
        </a>
      </nav>

      {/* Splash hero — full viewport */}
      <section data-hero className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 border-b border-border overflow-hidden">
        <div className="max-w-5xl">
          <p className="hero-line-1 text-[10px] tracking-[0.45em] text-[#3a3a3a] uppercase mb-8">
            Tattoo Artist &nbsp;·&nbsp; {artist.location}
          </p>
          <h1 className="hero-line-2 font-light tracking-tight text-cream leading-none mb-8 md:mb-10"
              style={{ fontSize: "clamp(3.5rem, 13vw, 8.5rem)" }}>
            {artist.name}
          </h1>
          <div className="hero-line-3 flex items-center gap-5 mb-12">
            <div className="w-8 h-px bg-[#2a2a2a] shrink-0" />
            <p className="text-muted text-sm md:text-base font-light">
              Custom tattoo art in {artist.location}.
            </p>
          </div>
          <div className="hero-line-4">
            <a
              href="#book"
              className="inline-flex items-center h-12 px-8 border border-cream/60 text-cream text-[11px] tracking-widest uppercase hover:bg-cream hover:text-black transition-colors"
            >
              Book a Consultation
            </a>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="hero-line-4 absolute bottom-8 left-6 md:left-16 flex items-center gap-3 text-[#2a2a2a]">
          <div className="h-px w-5 bg-current" />
          <span className="text-[9px] tracking-[0.45em] uppercase">Scroll</span>
        </div>
      </section>

      {/* Artist — bio & styles */}
      <section className="px-6 py-20 md:py-28 max-w-4xl mx-auto">
        <div data-reveal className="flex items-start gap-2 mb-6">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500 mt-1.5 animate-pulse" />
          <span className="text-xs text-muted tracking-wider uppercase">Accepting new clients</span>
        </div>
        <p data-reveal data-reveal-delay="80" className="text-5xl md:text-7xl font-light tracking-tight text-cream mb-4">
          {artist.name}
        </p>
        <p data-reveal data-reveal-delay="140" className="text-gold text-sm tracking-[0.2em] uppercase mb-8">
          Tattoo Artist · {artist.location}
        </p>
        <p data-reveal data-reveal-delay="200" className="text-muted text-lg max-w-2xl leading-relaxed font-light">
          {artist.bio}
        </p>
        <div data-reveal data-reveal-delay="260" className="flex flex-wrap gap-2 mt-8">
          {artist.styles.map((s) => (
            <span
              key={s}
              className="px-3 py-1.5 border border-border text-xs text-muted tracking-wider uppercase"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Portfolio */}
      <section
        data-testid="portfolio-section"
        className="border-t border-border py-20 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div data-reveal className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">Portfolio</p>
              <h2 className="text-3xl font-light text-cream">The Work</h2>
            </div>
            <p className="text-muted text-xs hidden md:block">
              {artist.portfolio.length} pieces · all custom
            </p>
          </div>

          <div data-reveal data-reveal-delay="80" className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {artist.portfolio.map((item) => (
              <div key={item.id} className="group relative">
                {/* Photo */}
                <div className="aspect-[3/4] w-full relative overflow-hidden bg-zinc-900">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>

                {/* Caption */}
                <div className="pt-3 pb-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-cream text-sm font-medium leading-tight">{item.title}</p>
                      <p className="text-muted text-xs mt-0.5">{item.placement}</p>
                    </div>
                    <span className="text-[10px] text-gold tracking-widest uppercase shrink-0 mt-0.5">
                      {item.style}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cream text-sm font-semibold">
                      ${item.cost.toLocaleString()}
                    </span>
                    <span className="text-border">·</span>
                    <span className="text-muted text-xs">
                      {item.durationHours >= 12
                        ? `${Math.round(item.durationHours / 8)} days`
                        : `${item.durationHours}h`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[#444] text-xs text-center mt-10">
            All prices shown are final settled amounts for completed work.
            Estimates vary by complexity and revision rounds.
          </p>
        </div>
      </section>

      {/* Pricing guide */}
      <section className="border-t border-border py-16 px-6 bg-card">
        <div className="max-w-4xl mx-auto">
          <div data-reveal>
            <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">Pricing</p>
            <h2 className="text-3xl font-light text-cream mb-2">What to Expect</h2>
            <p className="text-muted text-sm mb-10">No surprises. Every tier below includes a required deposit to hold your date.</p>
          </div>

          <div data-reveal data-reveal-delay="80" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Small */}
            <div className="border border-border p-5 flex flex-col gap-3">
              <p className="text-gold text-xs tracking-widest uppercase">Small</p>
              <div>
                <p className="text-cream text-2xl font-light">$100</p>
                <p className="text-muted text-xs mt-0.5">minimum</p>
              </div>
              <div className="border-t border-border pt-3 flex flex-col gap-1.5">
                <p className="text-muted text-xs">1–2 hours</p>
                <p className="text-muted text-xs">$50 deposit to book</p>
              </div>
              <p className="text-[#555] text-xs leading-relaxed">
                Simple symbols, words, dates, minimal designs, small fine line pieces
              </p>
            </div>

            {/* Half Day */}
            <div className="border border-border p-5 flex flex-col gap-3">
              <p className="text-gold text-xs tracking-widest uppercase">Half Day</p>
              <div>
                <p className="text-cream text-2xl font-light">$400–600</p>
                <p className="text-muted text-xs mt-0.5">estimated</p>
              </div>
              <div className="border-t border-border pt-3 flex flex-col gap-1.5">
                <p className="text-muted text-xs">3–5 hours</p>
                <p className="text-muted text-xs">$100 deposit to book</p>
              </div>
              <p className="text-[#555] text-xs leading-relaxed">
                Detailed forearm pieces, portraits, animals, medium geometric work
              </p>
            </div>

            {/* Full Day */}
            <div className="border border-border p-5 flex flex-col gap-3">
              <p className="text-gold text-xs tracking-widest uppercase">Full Day</p>
              <div>
                <p className="text-cream text-2xl font-light">$800–1,000</p>
                <p className="text-muted text-xs mt-0.5">estimated</p>
              </div>
              <div className="border-t border-border pt-3 flex flex-col gap-1.5">
                <p className="text-muted text-xs">6+ hours</p>
                <p className="text-muted text-xs">$100 deposit to book</p>
              </div>
              <p className="text-[#555] text-xs leading-relaxed">
                Full inner/outer arm, upper arm, large back pieces, chest pieces, full thigh pieces
              </p>
            </div>

            {/* Full Sleeve */}
            <div className="border border-border p-5 flex flex-col gap-3">
              <p className="text-gold text-xs tracking-widest uppercase">Full Sleeve</p>
              <div>
                <p className="text-cream text-2xl font-light">$800–1,000</p>
                <p className="text-muted text-xs mt-0.5">per session</p>
              </div>
              <div className="border-t border-border pt-3 flex flex-col gap-1.5">
                <p className="text-muted text-xs">4–5 full day sessions</p>
                <p className="text-muted text-xs">$100 deposit per session</p>
              </div>
              <p className="text-[#555] text-xs leading-relaxed">
                Discounts may be available — Miguel will discuss directly during your consultation.
              </p>
            </div>
          </div>

          <p data-reveal data-reveal-delay="80" className="text-[#444] text-xs mt-8">
            All prices are estimates. Final cost depends on complexity, detail level, and placement.
            Deposits are applied to the total cost of your tattoo.
          </p>

          <div data-reveal data-reveal-delay="120">
            <PaymentGrid />
          </div>
        </div>
      </section>

      {/* Booking + Calendar */}
      <div id="book">
        <BookingSection />
      </div>

      <ScrollReveal />
      <StickyHeader artistName={artist.name} />

      {/* Footer */}
      <footer className="border-t border-border px-6 py-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-cream font-semibold tracking-widest text-sm uppercase">inkbook</span>
            <p className="text-[#444] text-xs mt-1">© 2026 Miguel · Austin, TX</p>
          </div>
          <div className="flex gap-6 text-xs text-muted">
            <a href={artist.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors">@miguel_tattoos</a>
            <a href="#book" className="hover:text-cream transition-colors">Book a Consultation</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
