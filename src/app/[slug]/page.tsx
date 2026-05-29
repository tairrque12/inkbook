import { notFound } from 'next/navigation'
import { getArtist } from '@/lib/mock-artists'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params
  const artist = getArtist(slug)

  if (!artist) notFound()

  return (
    <main className="bg-black text-[#F5F0E8] min-h-screen w-full overflow-x-hidden font-sans">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-[#F5F0E8]/10 sticky top-0 bg-black/95 backdrop-blur-sm z-50">
        <span className="text-[13px] font-medium tracking-[0.06em] text-[#F5F0E8]">inkbook</span>
        <div className="flex gap-5">
          <a href="#portfolio" className="text-[12px] text-[#F5F0E8]/55 tracking-[0.04em] hover:text-[#F5F0E8] transition-colors min-h-[44px] flex items-center">Portfolio</a>
          <a href="#book" className="text-[12px] text-[#F5F0E8]/55 tracking-[0.04em] hover:text-[#F5F0E8] transition-colors min-h-[44px] flex items-center">Book</a>
        </div>
      </nav>

      {/* HERO VIDEO / REEL */}
      <div className="relative w-full h-[340px] bg-[#0A0A0A] overflow-hidden">
        {/* Video placeholder — swap src for real reel */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-[#0D0D0D] via-[#111] to-[#0A0A0A] flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-36 h-36 opacity-[0.12]" fill="none" stroke="#F5F0E8" strokeWidth="0.6">
              <path d="M100 160 Q80 140 70 110 Q60 80 75 60 Q90 40 100 50 Q110 40 125 60 Q140 80 130 110 Q120 140 100 160Z"/>
              <path d="M100 120 Q85 110 80 90 Q78 75 85 65" strokeWidth="0.4" opacity="0.6"/>
              <path d="M100 120 Q115 110 120 90 Q122 75 115 65" strokeWidth="0.4" opacity="0.6"/>
              <path d="M90 85 Q85 75 80 70 Q88 68 93 75" strokeWidth="0.4"/>
              <path d="M110 85 Q115 75 120 70 Q112 68 107 75" strokeWidth="0.4"/>
              <path d="M100 105 L100 160" strokeWidth="0.4" opacity="0.4"/>
              <circle cx="100" cy="48" r="3" fill="rgba(245,240,232,0.2)"/>
            </svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute bottom-5 left-6 right-6">
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#F5F0E8]/50 mb-1">Featured work</p>
          <p className="text-[11px] italic text-[#F5F0E8]/70 font-light">Botanical, fine line — upper arm, 2025</p>
        </div>
      </div>

      {/* ARTIST INFO */}
      <div className="px-6 py-7 border-b border-[#F5F0E8]/10">
        <h1 className="text-[42px] font-light tracking-[-0.01em] leading-[1.05] text-[#F5F0E8] mb-2">
          {artist.firstName}
        </h1>
        <p className="text-[12px] uppercase tracking-[0.12em] text-[#F5F0E8]/55 font-normal mb-5">
          {artist.specialties.join(' · ')} · {artist.borough}
        </p>
        <p className="text-[13px] leading-[1.7] text-[#F5F0E8]/55 font-light">{artist.bio}</p>
      </div>

      {/* PORTFOLIO SECTION */}
      <section data-testid="portfolio-section" id="portfolio" className="border-t border-[#F5F0E8]/10">
        <div className="px-6 pt-5 pb-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#F5F0E8]/50 font-normal">Portfolio</p>
        </div>

        <div className="px-6 py-4 grid grid-cols-2 gap-3">
          {artist.portfolio.map((item) => (
            <article key={item.id} className="bg-[#0A0A0A] border border-[#F5F0E8]/10 overflow-hidden">
              {/* Photo placeholder — swap for real <Image> */}
              <div className="aspect-square bg-[#0D0D0D] flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-[55%] h-[55%] opacity-[0.18]" fill="none" stroke="#F5F0E8" strokeWidth="0.7">
                  <path d="M50 80 Q35 65 30 45 Q27 28 40 20 Q50 14 60 20 Q73 28 70 45 Q65 65 50 80Z"/>
                  <path d="M50 60 Q42 52 40 38" strokeWidth="0.4" opacity="0.6"/>
                  <path d="M50 60 Q58 52 60 38" strokeWidth="0.4" opacity="0.6"/>
                </svg>
              </div>
              <div className="px-[10px] py-[10px] border-t border-[#F5F0E8]/08">
                <span className="block text-[11px] font-normal text-[#F5F0E8] mb-[2px] tracking-[0.03em]">{item.title}</span>
                <span className="text-[9px] text-[#F5F0E8]/50 font-light tracking-[0.06em]">{item.date}</span>
              </div>
            </article>
          ))}
        </div>

        <button className="w-full flex items-center justify-between px-6 border-t border-[#F5F0E8]/10 text-[#F5F0E8] text-[11px] tracking-[0.1em] font-normal min-h-[44px]">
          <span>View all {artist.totalWorks} works</span>
          <span className="text-[#F5F0E8]/50">→</span>
        </button>
      </section>

      {/* VISUALIZER SECTION */}
      <section data-testid="visualizer-section" className="border-t border-[#F5F0E8]/10">
        <div className="px-6 pt-5 pb-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#F5F0E8]/50 font-normal">Try it on</p>
        </div>

        <div className="px-6 py-4">
          <p className="text-[13px] italic leading-[1.6] text-[#F5F0E8]/55 font-light mb-5">
            See how {artist.firstName}&rsquo;s work would look on your skin before you book.
          </p>

          {/* Upload zone */}
          <label className="block border border-[#F5F0E8]/15 cursor-pointer mb-4">
            <div className="py-8 flex flex-col items-center gap-2">
              <div className="w-9 h-9 border border-[#F5F0E8]/15 rounded-full flex items-center justify-center">
                <span className="text-[22px] font-extralight text-[#F5F0E8]/50 leading-none">+</span>
              </div>
              <span className="text-[13px] text-[#F5F0E8] font-normal tracking-[0.03em]">Upload a photo</span>
              <span className="text-[11px] text-[#F5F0E8]/40 font-light">JPG or PNG · any lighting</span>
            </div>
            <input type="file" accept="image/*" className="sr-only" aria-label="Upload photo for tattoo preview" />
          </label>

          {/* Configuration */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-[9px] uppercase tracking-[0.16em] text-[#F5F0E8]/50 mb-2 font-normal">Placement</label>
              <select
                defaultValue="arm"
                className="w-full bg-transparent border-b border-[#F5F0E8]/15 text-[#F5F0E8] text-[13px] py-2 font-light appearance-none min-h-[44px]"
                aria-label="Tattoo placement"
              >
                <option value="arm" className="bg-black">Upper arm</option>
                <option value="back" className="bg-black">Back</option>
                <option value="leg" className="bg-black">Leg</option>
                <option value="chest" className="bg-black">Chest</option>
                <option value="other" className="bg-black">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[0.16em] text-[#F5F0E8]/50 mb-2 font-normal">Size</label>
              <select
                defaultValue="medium"
                className="w-full bg-transparent border-b border-[#F5F0E8]/15 text-[#F5F0E8] text-[13px] py-2 font-light appearance-none min-h-[44px]"
                aria-label="Tattoo size"
              >
                <option value="small" className="bg-black">Small</option>
                <option value="medium" className="bg-black">Medium</option>
                <option value="large" className="bg-black">Large</option>
                <option value="sleeve" className="bg-black">Sleeve</option>
              </select>
            </div>
          </div>

          {/* CTA */}
          <button className="w-full min-h-[52px] bg-[#F5F0E8] text-black text-[13px] font-medium tracking-[0.08em] flex items-center justify-between px-6">
            See it on your skin
            <svg width="14" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M0 4h12M8 1l4 3-4 3"/>
            </svg>
          </button>
          <p className="text-[10px] text-[#F5F0E8]/40 text-center mt-3 font-light tracking-[0.04em]">5 free previews per day · No account required</p>
        </div>
      </section>

      {/* BOOKING SECTION */}
      <section data-testid="booking-section" id="book" className="border-t border-[#F5F0E8]/10">
        <div className="px-6 pt-5 pb-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#F5F0E8]/50 font-normal">Book a session</p>
        </div>

        <div className="px-6 py-4">
          <p className="text-[12px] italic leading-[1.5] text-[#F5F0E8]/50 font-light mb-5">
            Sessions {artist.sessionRange}. Deposit required to hold your slot.
          </p>

          <div className="flex flex-col gap-[10px]">
            {artist.availableSlots.map((slot) => (
              <div
                key={slot.id}
                className={`border border-[#F5F0E8]/15 px-4 py-4 flex items-center justify-between min-h-[60px] ${
                  slot.available ? '' : 'opacity-35'
                }`}
              >
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-[#F5F0E8]/50 font-normal mb-[4px]">{slot.date}</span>
                  <span className="block text-[14px] font-normal text-[#F5F0E8]">{slot.type}</span>
                  <span className="text-[11px] text-[#F5F0E8]/50 font-light">
                    {slot.timeRange}{slot.estimatedPrice ? ` · est. $${slot.estimatedPrice}` : ''}
                  </span>
                </div>
                {slot.available ? (
                  <button className="border border-[#F5F0E8]/20 text-[#F5F0E8] text-[10px] uppercase tracking-[0.12em] font-normal px-[14px] min-h-[44px] hover:bg-[#F5F0E8]/10 transition-colors whitespace-nowrap">
                    Reserve
                  </button>
                ) : (
                  <span className="text-[10px] uppercase tracking-[0.1em] text-[#F5F0E8]/40 font-normal">Booked</span>
                )}
              </div>
            ))}
          </div>

          <button className="w-full min-h-[52px] border border-[#F5F0E8]/15 text-[#F5F0E8] text-[12px] tracking-[0.1em] font-normal flex items-center justify-between px-6 mt-4 hover:bg-[#F5F0E8]/05 transition-colors">
            Request a custom date
            <svg width="14" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M0 4h12M8 1l4 3-4 3"/>
            </svg>
          </button>
        </div>
      </section>

    </main>
  )
}
