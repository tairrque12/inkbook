"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AvailabilityEditor } from "./AvailabilityEditor";
import { PricingEditor } from "./PricingEditor";
import { PortfolioEditor } from "./PortfolioEditor";

type Tab = "portfolio" | "availability" | "pricing" | "account";

interface PortfolioItem {
  id: string;
  imageUrl: string;
}

interface Props {
  slug: string;
  name: string;
  plan: string;
  initialPricing: PricingTier[];
  initialAvailableDates: string[];
  initialPortfolio: PortfolioItem[];
}

interface PricingTier {
  label: string;
  price: string;
  deposit: string;
  hours: string;
  description: string;
}

export function DashboardClient({ slug, name, plan, initialPricing, initialAvailableDates, initialPortfolio }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("portfolio");
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleLogout() {
    await fetch("/api/auth/dashboard-logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    router.push("/login");
  }

  async function handleDeleteAccount() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/artists/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error ?? "Something went wrong.");
        setDeleting(false);
        return;
      }
      router.push("/");
    } catch {
      setDeleteError("Network error. Please try again.");
      setDeleting(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "portfolio", label: "Portfolio" },
    { id: "availability", label: "Availability" },
    { id: "pricing", label: "Pricing" },
    { id: "account", label: "Account" },
  ];

  return (
    <main className="bg-black min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-border">
        <Link
          href="/"
          className="text-cream font-semibold tracking-widest text-sm uppercase hover:opacity-70 transition-opacity"
        >
          inkbook
        </Link>
        <div className="flex items-center gap-5">
          <Link
            href={`/${slug}`}
            target="_blank"
            className="text-muted text-xs tracking-wider uppercase hover:text-cream transition-colors"
          >
            View profile ↗
          </Link>
          <button
            onClick={handleLogout}
            className="text-muted text-xs tracking-wider uppercase hover:text-cream transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="px-6 pt-12 pb-8 max-w-3xl mx-auto">
        <p className="text-[10px] tracking-[0.45em] uppercase text-muted mb-2">
          {plan === "free" ? "Free plan" : plan}
        </p>
        <h1 className="text-3xl md:text-4xl font-light text-cream">{name}</h1>
        <p className="text-muted text-sm mt-1">inkbook.io/{slug}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border px-6">
        <div className="max-w-3xl mx-auto flex gap-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-xs tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "text-cream border-cream"
                  : "text-muted border-transparent hover:text-cream"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-6 py-10 max-w-3xl mx-auto">
        {tab === "portfolio" && (
          <PortfolioEditor slug={slug} initialItems={initialPortfolio} />
        )}

        {tab === "availability" && (
          <AvailabilityEditor slug={slug} initialDates={initialAvailableDates} />
        )}

        {tab === "pricing" && (
          <PricingEditor slug={slug} initialTiers={initialPricing} />
        )}

        {tab === "account" && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-cream text-lg font-light mb-1">Account settings</h2>
              <p className="text-muted text-sm">Manage your inkbook account.</p>
            </div>

            <div className="border border-border p-6 flex flex-col gap-4">
              <div>
                <p className="text-[10px] tracking-widest uppercase text-muted mb-1">Plan</p>
                <p className="text-cream capitalize">{plan === "free" ? "Free" : plan}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase text-muted mb-1">Booking URL</p>
                <p className="text-cream">inkbook.io/{slug}</p>
              </div>
            </div>

            <div className="border border-red-900/40 p-6 flex flex-col gap-4">
              <div>
                <p className="text-red-400 text-[10px] tracking-widest uppercase mb-1">Danger zone</p>
                <p className="text-cream text-sm font-light mb-1">Delete your account</p>
                <p className="text-muted text-xs leading-relaxed">
                  This will permanently delete your profile, portfolio, and all associated data.
                  Your booking page will go offline immediately. This cannot be undone.
                </p>
              </div>

              {deleteError && <p className="text-red-400 text-xs">{deleteError}</p>}

              {deleteConfirm ? (
                <div className="flex flex-col gap-3">
                  <p className="text-red-400 text-sm">
                    Are you sure? This action is permanent and cannot be reversed.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="h-10 px-6 bg-red-600 text-white text-xs tracking-widest uppercase hover:bg-red-500 transition-colors disabled:opacity-40"
                    >
                      {deleting ? "Deleting…" : "Yes, delete my account"}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      disabled={deleting}
                      className="h-10 px-6 border border-border text-muted text-xs tracking-widest uppercase hover:text-cream transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleDeleteAccount}
                  className="self-start h-10 px-6 border border-red-900/60 text-red-400 text-xs tracking-widest uppercase hover:border-red-600 hover:text-red-300 transition-colors"
                >
                  Delete account
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
