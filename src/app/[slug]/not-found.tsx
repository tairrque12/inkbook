import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 px-6">
      <p className="text-xs tracking-[0.2em] uppercase text-muted">404</p>
      <h1 className="text-4xl font-light text-cream">Artist not found</h1>
      <Link
        href="/miguel"
        className="h-11 px-6 border border-cream text-cream text-xs tracking-widest uppercase hover:bg-cream hover:text-black transition-colors flex items-center"
      >
        View Miguel&apos;s profile
      </Link>
    </main>
  );
}
