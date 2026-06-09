import type { Metadata } from "next";
import Link from "next/link";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = {
  title: "Set up your profile — inkbook",
};

export default async function ProfilePage({
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
          <p className="text-[10px] tracking-[0.45em] uppercase text-muted mb-4">Step 3 of 3</p>
          <h1 className="text-3xl md:text-4xl font-light text-cream mb-2">
            Set up your profile.
          </h1>
          <p className="text-muted text-sm font-light mb-10 leading-relaxed">
            This is what clients see when they visit your booking page.
          </p>

          <ProfileForm slug={slug} plan={plan} />
        </div>
      </div>
    </main>
  );
}
