import type { Metadata } from "next";
import Link from "next/link";
import { CopyButton } from "./CopyButton";

export const metadata: Metadata = {
  title: "You're in — inkbook",
};

export default async function WelcomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bookingUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://ink-book.com"}/${slug}`;

  return (
    <main className="bg-black min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-border">
        <Link href="/" className="text-cream font-semibold tracking-widest text-sm uppercase hover:opacity-70 transition-opacity">
          inkbook
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <span className="text-gold text-4xl leading-none block mb-6">✓</span>

          <h1 className="text-3xl md:text-4xl font-light text-cream mb-4">
            You&apos;re live.
          </h1>
          <p className="text-muted text-sm font-light mb-10 leading-relaxed">
            Your booking page is ready. Share your link and clients can start requesting consultations today.
          </p>

          {/* URL display */}
          <div className="border border-border p-5 mb-8">
            <p className="text-[10px] tracking-widest uppercase text-muted mb-2">
              Your booking link
            </p>
            <p className="text-cream font-light text-lg break-all">
              {bookingUrl.replace(/^https?:\/\//, "")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={`/${slug}`}
              className="inline-flex items-center justify-center h-12 bg-cream text-black text-[11px] tracking-widest uppercase font-semibold hover:bg-cream/90 transition-colors"
            >
              See my page
            </Link>
            <CopyButton url={bookingUrl} />
          </div>
        </div>
      </div>
    </main>
  );
}
