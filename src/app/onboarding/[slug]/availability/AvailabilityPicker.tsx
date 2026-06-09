"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getPendingPortfolioFiles, clearPendingPortfolioFiles } from "@/lib/onboarding-store";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function CalendarMonth({
  year,
  month,
  selected,
  onToggle,
}: {
  year: number;
  month: number;
  selected: Set<string>;
  onToggle: (date: string) => void;
}) {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div>
      <p className="text-cream text-sm font-medium mb-4 tracking-wide">
        {MONTH_NAMES[month]} {year}
      </p>

      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] text-[#3a3a3a] py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isPast  = new Date(year, month, d) < todayMidnight;
          const isOn    = selected.has(dateStr);

          let cls = "text-[#555] cursor-default";
          if (!isPast) {
            cls = isOn
              ? "bg-green-600 text-white cursor-pointer ring-1 ring-green-400"
              : "text-[#888] hover:bg-[#1a1a1a] cursor-pointer";
          }

          return (
            <button
              key={d}
              type="button"
              onClick={() => !isPast && onToggle(dateStr)}
              disabled={isPast}
              aria-label={dateStr}
              aria-pressed={isOn}
              className={`aspect-square flex items-center justify-center rounded text-xs min-h-[36px] transition-all select-none ${cls}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AvailabilityPicker({ slug }: { slug: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  function toggleDate(date: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  const now = new Date();
  const calMonths = [0, 1, 2].map((offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  async function handleCreateAccount() {
    setSaving(true);
    setError("");

    // 1. Read all pending data from sessionStorage
    const signupRaw = sessionStorage.getItem("inkbook_signup");
    const profileRaw = sessionStorage.getItem("inkbook_profile");
    const pricingRaw = sessionStorage.getItem("inkbook_pricing");

    if (!signupRaw) {
      setError("Session expired. Please start over from the signup page.");
      setSaving(false);
      router.push("/signup");
      return;
    }

    let signupData: { name: string; slug: string; email: string; password: string };
    let profileData: { location: string; bio: string; instagram: string; styles: string[]; plan: string } | null = null;
    let pricingData: { tiers: unknown[] } | null = null;

    try {
      signupData = JSON.parse(signupRaw);
      if (profileRaw) profileData = JSON.parse(profileRaw);
      if (pricingRaw) pricingData = JSON.parse(pricingRaw);
    } catch {
      setError("Something went wrong reading your setup data. Please start over.");
      setSaving(false);
      return;
    }

    // 2. Create the account
    setStatusMsg("Creating your account…");
    const signupRes = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupData),
    });

    const signupJson = await signupRes.json();

    if (!signupRes.ok) {
      setError(signupJson.error ?? "Failed to create account. Please try again.");
      setSaving(false);
      setStatusMsg("");
      return;
    }

    const artistSlug = signupJson.slug as string;

    // 3. Save profile + availability in one PATCH
    setStatusMsg("Saving your profile…");
    const profilePatch: Record<string, unknown> = {
      onboarding_complete: true,
      available_dates: Array.from(selected),
    };
    if (profileData) {
      profilePatch.location = profileData.location;
      profilePatch.bio = profileData.bio;
      profilePatch.instagram = profileData.instagram;
      profilePatch.styles = profileData.styles;
      profilePatch.plan = profileData.plan;
    }
    await fetch(`/api/artists/${artistSlug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilePatch),
    });

    // 4. Save pricing if present
    if (pricingData?.tiers?.length) {
      await fetch(`/api/artists/${artistSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricing: pricingData.tiers }),
      });
    }

    // 5. Upload portfolio files if any
    const portfolioFiles = getPendingPortfolioFiles();
    if (portfolioFiles.length > 0) {
      setStatusMsg(`Uploading ${portfolioFiles.length} portfolio photo${portfolioFiles.length !== 1 ? "s" : ""}…`);
      const uploadedUrls: string[] = [];
      for (const file of portfolioFiles) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          const res = await fetch(`/api/artists/${artistSlug}/portfolio`, {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            uploadedUrls.push(data.url);
          }
        } catch {
          // Best-effort — skip failed uploads
        }
      }

      if (uploadedUrls.length > 0) {
        const portfolio = uploadedUrls.map((imageUrl, idx) => ({
          id: `p${Date.now()}-${idx}`,
          imageUrl,
        }));
        await fetch(`/api/artists/${artistSlug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portfolio }),
        });
      }
    }

    // 6. Clear all pending data
    sessionStorage.removeItem("inkbook_signup");
    sessionStorage.removeItem("inkbook_profile");
    sessionStorage.removeItem("inkbook_pricing");
    clearPendingPortfolioFiles();

    router.push(`/dashboard/${artistSlug}`);
  }

  async function handleSkip() {
    // Still need to create the account even if they skip availability
    await handleCreateAccount();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-[#555]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-600 inline-block" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#1a1a1a] border border-[#333] inline-block" /> Click to select
        </span>
      </div>

      {/* Selected count */}
      {selected.size > 0 && (
        <p className="text-cream text-sm">
          {selected.size} date{selected.size !== 1 ? "s" : ""} selected
        </p>
      )}

      {/* 3-month calendar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {calMonths.map(({ year, month }) => (
          <CalendarMonth
            key={`${year}-${month}`}
            year={year}
            month={month}
            selected={selected}
            onToggle={toggleDate}
          />
        ))}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {statusMsg && !error && (
        <p className="text-muted text-sm">{statusMsg}</p>
      )}

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={handleCreateAccount}
          disabled={saving}
          className="h-12 bg-cream text-black text-[11px] tracking-widest uppercase font-semibold hover:bg-cream/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? statusMsg || "Creating your account…" : "Create my account →"}
        </button>
        <button
          type="button"
          onClick={handleSkip}
          disabled={saving}
          className="h-10 text-muted text-xs tracking-wider uppercase hover:text-cream transition-colors"
        >
          Skip availability for now
        </button>
      </div>
    </div>
  );
}
