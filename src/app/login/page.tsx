import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — inkbook",
};

export default function LoginPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-border">
        <Link href="/" className="text-cream font-semibold tracking-widest text-sm uppercase hover:opacity-70 transition-opacity">
          inkbook
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p className="text-[10px] tracking-[0.45em] uppercase text-muted mb-4">
            Welcome back
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-cream mb-2">
            Sign in to your account.
          </h1>
          <p className="text-muted text-sm font-light mb-10 leading-relaxed">
            You&apos;ll be taken straight to your booking page.
          </p>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
