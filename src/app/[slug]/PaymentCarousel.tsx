"use client";

export interface PaymentMethod {
  name: string;
  logo: React.ReactNode;
}

const s = (obj: React.CSSProperties): React.CSSProperties => obj;

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    name: "Visa",
    logo: (
      <span style={s({ fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontStyle: "italic", fontSize: 22, color: "#1A1F71", letterSpacing: "-0.5px", textShadow: "none" })}>
        VISA
      </span>
    ),
  },
  {
    name: "Mastercard",
    logo: (
      <div style={s({ position: "relative", width: 52, height: 32 })}>
        <div style={s({ position: "absolute", left: 0, width: 32, height: 32, borderRadius: "50%", background: "#EB001B" })} />
        <div style={s({ position: "absolute", left: 20, width: 32, height: 32, borderRadius: "50%", background: "#F79E1B", opacity: 0.95 })} />
      </div>
    ),
  },
  {
    name: "American Express",
    logo: (
      <div style={s({ display: "flex", alignItems: "center", gap: 0 })}>
        <div style={s({ background: "#007BC1", borderRadius: 5, padding: "4px 10px" })}>
          <span style={s({ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", letterSpacing: 0.5 })}>
            AMEX
          </span>
        </div>
      </div>
    ),
  },
  {
    name: "Discover",
    logo: (
      <div style={s({ display: "flex", alignItems: "center", gap: 6 })}>
        <span style={s({ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: 13, color: "#F5F0E8", letterSpacing: 0.5 })}>
          DISCOVER
        </span>
        <div style={s({ width: 22, height: 22, borderRadius: "50%", background: "#F60" })} />
      </div>
    ),
  },
  {
    name: "Apple Pay",
    logo: (
      <div style={s({ display: "flex", alignItems: "center", gap: 5 })}>
        {/* Apple logo mark — path only, no SVG text */}
        <svg viewBox="0 0 14 17" height={20} fill="white" aria-hidden>
          <path d="M13.2 12.9c-.5 1.2-1 2-1.7 2.9-.9 1.2-1.8 1.8-2.6 1.8-.6 0-1.4-.4-2.5-.4s-1.9.4-2.5.4c-.8 0-1.7-.6-2.7-1.9C.4 14.6 0 12.6 0 10.7 0 6.1 3 3.7 5.9 3.7c1 0 2 .4 2.7.4.7 0 1.7-.5 3-.5.7 0 2.5.2 3.6 1.9-.1 0-2.1 1.2-2.1 3.6 0 2.8 2.5 3.7 2.5 3.7-.1.5-.3 1-.4 1.1zM9.5.4c.5.7.8 1.7.7 2.7-1 .1-2.1-.5-2.8-1.2C6.7 1.2 6.4.3 6.5-.5 7.5-.4 8.9.3 9.5.4z" />
        </svg>
        <span style={s({ fontFamily: "system-ui, sans-serif", fontWeight: 500, fontSize: 16, color: "#fff" })}>
          Pay
        </span>
      </div>
    ),
  },
  {
    name: "Google Pay",
    logo: (
      <div style={s({ display: "flex", alignItems: "center", gap: 6 })}>
        {/* Multicolor G ring */}
        <div style={s({ position: "relative", width: 26, height: 26 })}>
          <svg viewBox="0 0 26 26" width={26} height={26} aria-hidden>
            <circle cx="13" cy="13" r="12" fill="none" stroke="#EA4335" strokeWidth="4" strokeDasharray="19 57" strokeDashoffset="0" />
            <circle cx="13" cy="13" r="12" fill="none" stroke="#FBBC05" strokeWidth="4" strokeDasharray="19 57" strokeDashoffset="-19" />
            <circle cx="13" cy="13" r="12" fill="none" stroke="#34A853" strokeWidth="4" strokeDasharray="19 57" strokeDashoffset="-38" />
            <circle cx="13" cy="13" r="12" fill="none" stroke="#4285F4" strokeWidth="4" strokeDasharray="19 57" strokeDashoffset="-57" />
          </svg>
        </div>
        <span style={s({ fontFamily: "system-ui, sans-serif", fontWeight: 500, fontSize: 16, color: "#F5F0E8" })}>
          Pay
        </span>
      </div>
    ),
  },
  {
    name: "Cash App Pay",
    logo: (
      <div style={s({ display: "flex", alignItems: "center", gap: 7 })}>
        <div style={s({ width: 28, height: 28, borderRadius: 8, background: "#00D632", display: "flex", alignItems: "center", justifyContent: "center" })}>
          <span style={s({ color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "system-ui, sans-serif" })}>$</span>
        </div>
        <span style={s({ color: "#00D632", fontSize: 14, fontWeight: 600, fontFamily: "system-ui, sans-serif" })}>
          Pay
        </span>
      </div>
    ),
  },
  {
    name: "Afterpay",
    logo: (
      <span style={s({ fontFamily: "system-ui, sans-serif", fontWeight: 700, fontSize: 15, color: "#B2FCE4", letterSpacing: 0.2 })}>
        Afterpay
      </span>
    ),
  },
  {
    name: "Klarna",
    logo: (
      <div style={s({ display: "flex", alignItems: "center", gap: 6 })}>
        <span style={s({ fontFamily: "system-ui, sans-serif", fontWeight: 700, fontSize: 16, color: "#FFB3C7" })}>
          Klarna
        </span>
        <div style={s({ width: 10, height: 10, borderRadius: "50%", background: "#FFB3C7" })} />
      </div>
    ),
  },
  {
    name: "Affirm",
    logo: (
      <span style={s({ fontFamily: "system-ui, sans-serif", fontWeight: 400, fontSize: 17, color: "#4A4AF4", letterSpacing: 0.3 })}>
        affirm
      </span>
    ),
  },
  {
    name: "Link",
    logo: (
      <div style={s({ display: "flex", alignItems: "center", gap: 6 })}>
        {/* Chain link icon — path only */}
        <svg viewBox="0 0 22 22" height={18} fill="none" aria-hidden>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#635BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#635BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={s({ fontFamily: "system-ui, sans-serif", fontWeight: 600, fontSize: 15, color: "#635BFF" })}>
          Link
        </span>
      </div>
    ),
  },
];

export function PaymentCarousel() {
  const doubled = [...PAYMENT_METHODS, ...PAYMENT_METHODS];

  return (
    <div className="mt-12">
      <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">Payment</p>
      <h2 className="text-3xl font-light text-cream mb-8">Payment Options</h2>

      {/* Carousel */}
      <div className="relative overflow-hidden" data-testid="carousel-track">
        {/* Left fade */}
        <div
          data-testid="carousel-fade"
          className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #000 0%, transparent 100%)" }}
        />
        {/* Right fade */}
        <div
          data-testid="carousel-fade"
          className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #000 0%, transparent 100%)" }}
        />

        {/* Scrolling track */}
        <div className="flex animate-carousel py-4">
          {doubled.map((method, i) => (
            <div
              key={i}
              className="flex-none px-8 flex items-center justify-center"
              style={{ minWidth: 140 }}
            >
              <div
                role="img"
                aria-label={method.name}
                className="flex items-center justify-center"
                style={{ height: 40 }}
              >
                {method.logo}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe security badge */}
      <div className="mt-8 flex items-center justify-center">
        <a
          href="https://stripe.com/docs/security"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Secured by Stripe"
          className="flex items-center gap-2 text-[#444] text-xs hover:text-muted transition-colors"
        >
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden>
            <rect x="1" y="5" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <path d="M3 5V3.5a3 3 0 016 0V5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span>Secured by Stripe</span>
        </a>
      </div>
    </div>
  );
}
