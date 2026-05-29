import Link from 'next/link'

export default function ArtistNotFound() {
  return (
    <div className="bg-black text-[#F5F0E8] min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#F5F0E8]/40 mb-4">inkbook</p>
        <h1 className="text-[32px] font-light mb-3">Artist not found</h1>
        <p className="text-[13px] text-[#F5F0E8]/50 font-light">
          This artist profile doesn&rsquo;t exist or has moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 text-[12px] tracking-[0.1em] uppercase text-[#F5F0E8]/60 hover:text-[#F5F0E8] transition-colors min-h-[44px]"
        >
          ← Back to inkbook
        </Link>
      </div>
    </div>
  )
}
