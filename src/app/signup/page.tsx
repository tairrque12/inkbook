import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create your account — inkbook",
  description: "Set up your booking page in minutes.",
};

export default function SignupPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-border">
        <Link href="/" className="text-cream font-semibold tracking-widest text-sm uppercase hover:opacity-70 transition-opacity">
          inkbook
        </Link>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p className="text-[10px] tracking-[0.45em] uppercase text-muted mb-4">
            Step 1 of 6
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-cream mb-2">
            Create your account.
          </h1>
          <p className="text-muted text-sm font-light mb-10 leading-relaxed">
            Your booking page will be live at ink-book.com/you — takes about 60 seconds.
          </p>

          <SignupForm />

          <p className="text-muted text-xs mt-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-cream hover:opacity-70 transition-opacity">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
