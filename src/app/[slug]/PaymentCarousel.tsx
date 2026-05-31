"use client";

export interface PaymentMethod {
  name: string;
  logo: React.ReactNode;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    name: "Visa",
    logo: (
      <svg viewBox="0 0 780 500" aria-label="Visa" role="img" fill="currentColor" height="28">
        <path d="M290.1 331.5l33.5-196.8h53.6L343.7 331.5zm248.3-192.2c-10.6-4-27.2-8.2-48-8.2-52.9 0-90.1 26.7-90.3 64.9-.3 28.2 26.6 43.9 46.9 53.3 20.8 9.6 27.8 15.8 27.7 24.4-.1 13.2-16.6 19.2-31.9 19.2-21.3 0-32.7-3-50.2-10.4l-6.9-3.1-7.5 43.9c12.4 5.4 35.4 10.2 59.3 10.4 56.2 0 92.6-26.4 93-67.3.2-22.4-14.1-39.5-44.9-53.6-18.7-9.1-30.2-15.2-30.1-24.4 0-8.2 9.7-16.9 30.7-16.9 17.5-.3 30.2 3.5 40.1 7.5l4.8 2.3 7.3-42.0zM663.5 134.7h-41.4c-12.8 0-22.4 3.5-28 16.3l-79.5 180.5h56.2s9.2-24.2 11.2-29.5c6.1 0 60.5.1 68.2.1 1.6 6.9 6.5 29.4 6.5 29.4h49.7l-43-196.8zm-65.8 126.1c4.4-11.3 21.2-54.7 21.2-54.7-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.2 46.7 12.3 56.5h-44.2zm-404.6-126.1L141.6 275.6l-6-29.6c-10.4-33.4-43-69.5-79.4-87.6l47.9 172.9 56.6-.1 84.2-196.5-51.8.1z"/>
        <path d="M94.2 134.7H7.1L6.5 139c67.7 16.4 112.5 56 131.1 103.6l-18.9-91.5c-3.2-12.5-12.7-16.1-24.5-16.4z"/>
      </svg>
    ),
  },
  {
    name: "Mastercard",
    logo: (
      <svg viewBox="0 0 38 24" aria-label="Mastercard" role="img" height="28">
        <circle cx="13" cy="12" r="10" fill="currentColor" opacity="0.9" />
        <circle cx="25" cy="12" r="10" fill="currentColor" opacity="0.6" />
        <path
          d="M19 4.8a10 10 0 0 1 0 14.4A10 10 0 0 1 19 4.8z"
          fill="currentColor"
          opacity="0.75"
        />
      </svg>
    ),
  },
  {
    name: "American Express",
    logo: (
      <svg viewBox="0 0 120 40" aria-label="American Express" role="img" fill="currentColor" height="28">
        <rect x="1" y="1" width="118" height="38" rx="5" strokeWidth="2" stroke="currentColor" fill="none" />
        <text x="60" y="27" textAnchor="middle" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif" fill="currentColor">AMEX</text>
      </svg>
    ),
  },
  {
    name: "Discover",
    logo: (
      <svg viewBox="0 0 120 40" aria-label="Discover" role="img" fill="currentColor" height="28">
        <text x="14" y="27" fontSize="15" fontWeight="600" fontFamily="Arial, sans-serif" fill="currentColor">DISCOVER</text>
        <circle cx="108" cy="20" r="14" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    name: "Apple Pay",
    logo: (
      <svg viewBox="0 0 80 34" aria-label="Apple Pay" role="img" fill="currentColor" height="28">
        {/* Apple logo */}
        <path d="M16.5 8.7c1-.1 2.2-.7 2.9-1.6.7-.9 1.1-2 1-3.1-1 .1-2.2.7-2.9 1.6-.7.8-1.2 1.9-1 3.1zm1 1.6c-1.6-.1-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3-.5 7.5 1.2 10 .8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-.9-2.5-3.7 0-2.3 1.9-3.4 2-3.5-.9-1.4-2.5-1.6-3.3-1.6z"/>
        {/* Pay text */}
        <text x="26" y="23" fontSize="14" fontWeight="600" fontFamily="Arial, sans-serif" fill="currentColor">Pay</text>
      </svg>
    ),
  },
  {
    name: "Google Pay",
    logo: (
      <svg viewBox="0 0 80 34" aria-label="Google Pay" role="img" fill="currentColor" height="28">
        <text x="8" y="24" fontSize="14" fontWeight="500" fontFamily="Arial, sans-serif" fill="currentColor">G</text>
        <text x="22" y="24" fontSize="14" fontWeight="500" fontFamily="Arial, sans-serif" fill="currentColor">Pay</text>
      </svg>
    ),
  },
  {
    name: "Cash App Pay",
    logo: (
      <svg viewBox="0 0 80 34" aria-label="Cash App Pay" role="img" fill="currentColor" height="28">
        <rect x="2" y="2" width="30" height="30" rx="8" fill="currentColor" opacity="0.15" />
        <text x="17" y="23" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif" fill="currentColor">$</text>
        <text x="40" y="23" fontSize="13" fontWeight="500" fontFamily="Arial, sans-serif" fill="currentColor">Cash</text>
      </svg>
    ),
  },
  {
    name: "Afterpay",
    logo: (
      <svg viewBox="0 0 100 34" aria-label="Afterpay" role="img" fill="currentColor" height="28">
        <text x="4" y="24" fontSize="15" fontWeight="600" fontFamily="Arial, sans-serif" fill="currentColor">Afterpay</text>
      </svg>
    ),
  },
  {
    name: "Klarna",
    logo: (
      <svg viewBox="0 0 90 34" aria-label="Klarna" role="img" fill="currentColor" height="28">
        <text x="4" y="24" fontSize="16" fontWeight="600" fontFamily="Arial, sans-serif" fill="currentColor">Klarna</text>
        <circle cx="82" cy="20" r="6" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: "Affirm",
    logo: (
      <svg viewBox="0 0 80 34" aria-label="Affirm" role="img" fill="currentColor" height="28">
        <text x="4" y="24" fontSize="16" fontWeight="400" fontFamily="Arial, sans-serif" fill="currentColor">affirm</text>
      </svg>
    ),
  },
  {
    name: "Link",
    logo: (
      <svg viewBox="0 0 70 34" aria-label="Link" role="img" fill="currentColor" height="28">
        {/* Chain link icon */}
        <path d="M18 12h-4a6 6 0 0 0 0 12h4m-2-6h8m6-6h4a6 6 0 0 1 0 12h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <text x="38" y="23" fontSize="14" fontWeight="500" fontFamily="Arial, sans-serif" fill="currentColor">Link</text>
      </svg>
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
        <div className="flex animate-carousel" aria-hidden="false">
          {doubled.map((method, i) => (
            <div
              key={i}
              className="flex-none px-8 flex items-center justify-center"
              style={{ minWidth: 120 }}
            >
              <div
                role="img"
                aria-label={method.name}
                className="flex items-center justify-center text-cream opacity-60 hover:opacity-90 transition-opacity duration-300"
                style={{ height: 40 }}
              >
                {method.logo}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe badge */}
      <div className="mt-8 flex items-center justify-center gap-2">
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
          <svg viewBox="0 0 60 25" fill="currentColor" height="14" aria-hidden>
            <path d="M59.64 14.28c0-5.35-2.58-9.58-7.52-9.58-4.96 0-7.97 4.23-7.97 9.54 0 6.3 3.56 9.5 8.65 9.5 2.49 0 4.37-.56 5.79-1.36v-4.17c-1.42.71-3.05 1.15-5.12 1.15-2.03 0-3.83-.71-4.06-3.18h10.22c0-.27.01-1.36.01-1.9zm-10.3-1.98c0-2.36 1.44-3.34 2.75-3.34 1.27 0 2.63.98 2.63 3.34h-5.38zM37.97 4.7c-2.03 0-3.34.96-4.06 1.62L33.7 5.1h-4.55v24.2l5.17-1.1.01-5.86c.75.54 1.85 1.31 3.68 1.31 3.72 0 7.1-2.99 7.1-9.6-.03-6.05-3.45-9.35-7.14-9.35zm-1.25 14.37c-1.22 0-1.94-.44-2.44-1l-.02-7.87c.54-.6 1.28-1.02 2.46-1.02 1.88 0 3.18 2.11 3.18 4.93 0 2.89-1.28 4.96-3.18 4.96zM26.27 3.25L21.1 4.35V.01l5.17-1.09zM21.1 5.1h5.17v18.6H21.1zM15.25 6.72l-.33-1.62H10.7v18.6h5.17V11.6c1.22-1.6 3.29-1.31 3.93-1.08V5.1c-.67-.25-3.12-.71-4.55 1.62zM5.64 4.43L.6 5.51.59 20.7c0 3.16 2.37 5.49 5.53 5.49 1.75 0 3.03-.32 3.74-.71v-4.2c-.68.28-4.05 1.26-4.05-1.88V9.82h4.05V5.1H5.64V4.43z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
