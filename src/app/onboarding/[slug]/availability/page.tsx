import type { Metadata } from "next";
import Link from "next/link";
import { AvailabilityPicker } from "./AvailabilityPicker";

export const metadata: Metadata = {
  title: "Set your availability — inkbook",
};

export default async function AvailabilityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="bg-black min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-border">
        <Link href="/" className="text-cream font-semibold tracking-widest text-sm uppercase hover:opacity-70 transition-opacity">
          inkbook
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <p className="text-[10px] tracking-[0.45em] uppercase text-muted mb-4">Step 6 of 6</p>
          <h1 className="text-3xl md:text-4xl font-light text-cream mb-2">
            Set your availability.
          </h1>
          <p className="text-muted text-sm font-light mb-10 leading-relaxed">
            Click dates to mark when you&apos;re open for bookings. Clients will see these highlighted on your profile. You can update this anytime.
          </p>

          <AvailabilityPicker slug={slug} />
        </div>
      </div>
    </main>
  );
}
