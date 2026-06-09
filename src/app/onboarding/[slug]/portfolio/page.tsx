import type { Metadata } from "next";
import Link from "next/link";
import { PortfolioUpload } from "./PortfolioUpload";

export const metadata: Metadata = {
  title: "Upload your portfolio — inkbook",
};

export default async function PortfolioPage({
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
          <p className="text-[10px] tracking-[0.45em] uppercase text-muted mb-4">Step 4 of 6</p>
          <h1 className="text-3xl md:text-4xl font-light text-cream mb-2">
            Add your portfolio.
          </h1>
          <p className="text-muted text-sm font-light mb-10 leading-relaxed">
            Upload up to 15 photos of your work. This is optional — you can add or update photos anytime.
          </p>

          <PortfolioUpload slug={slug} plan={plan} />
        </div>
      </div>
    </main>
  );
}
