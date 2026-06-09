import type { Metadata } from "next";
import Link from "next/link";
import { PricingForm } from "./PricingForm";

export const metadata: Metadata = {
  title: "Set your pricing — inkbook",
};

export default async function PricingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ plan?: string }>;
}) {
  const { slug } = await params;
  const { plan = "free" } = await searchParams;

  return (
    <main className="bg-black min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-border">
        <Link href="/" className="text-cream font-semibold tracking-widest text-sm uppercase hover:opacity-70 transition-opacity">
          inkbook
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <p className="text-[10px] tracking-[0.45em] uppercase text-muted mb-4">Step 5 of 6</p>
          <h1 className="text-3xl md:text-4xl font-light text-cream mb-2">
            Set your pricing.
          </h1>
          <p className="text-muted text-sm font-light mb-10 leading-relaxed">
            Give clients a sense of what to expect. Add up to 4 tiers — this is optional and you can update it anytime.
          </p>

          <PricingForm slug={slug} plan={plan} />
        </div>
      </div>
    </main>
  );
}
