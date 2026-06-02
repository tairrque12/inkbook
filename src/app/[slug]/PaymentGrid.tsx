export interface PaymentMethod {
  name: string;
  bg: string;
  textColor: string;
  markColors?: string[];
  mark: React.ReactNode;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    name: "Visa",
    bg: "#1A1F71",
    textColor: "#fff",
    mark: (
      <span style={{ fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontStyle: "italic", fontSize: 13, color: "#fff", letterSpacing: "-0.5px" }}>
        VISA
      </span>
    ),
  },
  {
    name: "Mastercard",
    bg: "#1a1a1a",
    textColor: "#fff",
    markColors: ["#EB001B", "#F79E1B"],
    mark: (
      <div style={{ position: "relative", width: 28, height: 18, flexShrink: 0 }}>
        <div style={{ position: "absolute", left: 0, width: 18, height: 18, borderRadius: "50%", background: "#EB001B" }} />
        <div style={{ position: "absolute", left: 10, width: 18, height: 18, borderRadius: "50%", background: "#F79E1B", opacity: 0.95 }} />
      </div>
    ),
  },
  {
    name: "American Express",
    bg: "#2E77BC",
    textColor: "#fff",
    mark: (
      <span style={{ fontFamily: "Arial, sans-serif", fontWeight: 800, fontSize: 11, color: "#fff", letterSpacing: 0.5 }}>
        AMEX
      </span>
    ),
  },
  {
    name: "Discover",
    bg: "#FF6600",
    textColor: "#fff",
    mark: (
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
    ),
  },
  {
    name: "Apple Pay",
    bg: "#000000",
    textColor: "#fff",
    mark: (
      <svg viewBox="0 0 14 17" height={16} fill="white" aria-hidden style={{ flexShrink: 0 }}>
        <path d="M13.2 12.9c-.5 1.2-1 2-1.7 2.9-.9 1.2-1.8 1.8-2.6 1.8-.6 0-1.4-.4-2.5-.4s-1.9.4-2.5.4c-.8 0-1.7-.6-2.7-1.9C.4 14.6 0 12.6 0 10.7 0 6.1 3 3.7 5.9 3.7c1 0 2 .4 2.7.4.7 0 1.7-.5 3-.5.7 0 2.5.2 3.6 1.9-.1 0-2.1 1.2-2.1 3.6 0 2.8 2.5 3.7 2.5 3.7-.1.5-.3 1-.4 1.1zM9.5.4c.5.7.8 1.7.7 2.7-1 .1-2.1-.5-2.8-1.2C6.7 1.2 6.4.3 6.5-.5 7.5-.4 8.9.3 9.5.4z" />
      </svg>
    ),
  },
  {
    name: "Google Pay",
    bg: "#fff",
    textColor: "#3c4043",
    mark: (
      // Colorful G using stroke arcs — no SVG text
      <svg viewBox="0 0 20 20" width={18} height={18} aria-hidden style={{ flexShrink: 0 }}>
        <circle cx="10" cy="10" r="9" fill="none" stroke="#EA4335" strokeWidth="3.5" strokeDasharray="14 42" />
        <circle cx="10" cy="10" r="9" fill="none" stroke="#FBBC05" strokeWidth="3.5" strokeDasharray="14 42" strokeDashoffset="-14" />
        <circle cx="10" cy="10" r="9" fill="none" stroke="#34A853" strokeWidth="3.5" strokeDasharray="14 42" strokeDashoffset="-28" />
        <circle cx="10" cy="10" r="9" fill="none" stroke="#4285F4" strokeWidth="3.5" strokeDasharray="14 42" strokeDashoffset="-42" />
      </svg>
    ),
  },
  {
    name: "Cash App Pay",
    bg: "#00D64F",
    textColor: "#fff",
    mark: (
      <span style={{ fontFamily: "system-ui, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>$</span>
    ),
  },
  {
    name: "Afterpay",
    bg: "#B2FCE4",
    textColor: "#000",
    mark: (
      <svg viewBox="0 0 16 16" width={14} height={14} fill="none" aria-hidden style={{ flexShrink: 0 }}>
        <polygon points="8,2 14,13 2,13" fill="#000" opacity="0.5" />
      </svg>
    ),
  },
  {
    name: "Klarna",
    bg: "#FFB3C7",
    textColor: "#000",
    mark: (
      <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#000", opacity: 0.3, flexShrink: 0 }} />
    ),
  },
  {
    name: "Affirm",
    bg: "#4A90E2",
    textColor: "#fff",
    mark: (
      <span style={{ fontFamily: "system-ui, sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>a</span>
    ),
  },
  {
    name: "Link",
    bg: "#00D4FF",
    textColor: "#000",
    mark: (
      <svg viewBox="0 0 22 22" height={16} fill="none" aria-hidden style={{ flexShrink: 0 }}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
    ),
  },
];

export function PaymentGrid() {
  return (
    <div className="mt-14">
      <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3 text-center">Payment</p>
      <h2 className="text-3xl font-light text-cream mb-8 text-center">Payment Options</h2>

      <div
        data-testid="payment-grid"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
      >
        {PAYMENT_METHODS.map((method) => (
          <div
            key={method.name}
            style={{ background: method.bg }}
            className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl"
          >
            {method.mark}
            <span
              style={{ color: method.textColor, fontFamily: "system-ui, sans-serif", fontSize: 13, fontWeight: 600 }}
            >
              {method.name}
            </span>
          </div>
        ))}
      </div>

      {/* Deposit note */}
      <p
        className="mt-6 text-xs text-center italic"
        style={{ color: "#F5F0E8", fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
      >
        After your consultation is approved, Miguel will send you a secure Stripe link to submit your deposit and lock in your appointment date.
      </p>

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
