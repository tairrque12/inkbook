export function PaymentGrid() {
  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2.5 text-muted text-sm">
        <svg width="14" height="16" viewBox="0 0 12 14" fill="none" aria-hidden className="text-gold">
          <rect x="1" y="5" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3 5V3.5a3 3 0 016 0V5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span>
          Deposits accepted via Stripe — all major cards, Apple Pay, Google Pay, and Cash App Pay.
        </span>
      </div>
      <p
        className="text-xs text-center italic text-[#555]"
      >
        After your consultation is approved, Miguel will send you a secure Stripe link to submit your deposit.
      </p>
    </div>
  );
}
