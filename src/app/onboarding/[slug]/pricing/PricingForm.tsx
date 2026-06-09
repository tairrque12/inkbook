"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PricingTier {
  label: string;
  price: string;
  deposit: string;
  hours: string;
  description: string;
}

const DEFAULT_TIER: PricingTier = {
  label: "",
  price: "",
  deposit: "",
  hours: "",
  description: "",
};

const TIER_PRESETS = ["Small", "Half Day", "Full Day", "Full Sleeve"];

export function PricingForm({ slug, plan }: { slug: string; plan: string }) {
  const router = useRouter();
  const [tiers, setTiers] = useState<PricingTier[]>([{ ...DEFAULT_TIER }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addTier() {
    if (tiers.length >= 4) return;
    setTiers((prev) => [...prev, { ...DEFAULT_TIER }]);
  }

  function removeTier(i: number) {
    setTiers((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateTier(i: number, field: keyof PricingTier, value: string) {
    setTiers((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t))
    );
  }

  async function handleSave() {
    const filled = tiers.filter((t) => t.label.trim() && t.price.trim());
    if (filled.length === 0) {
      handleSkip();
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/artists/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricing: filled }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(`/onboarding/${slug}/availability?plan=${plan}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleSkip() {
    router.push(`/onboarding/${slug}/availability?plan=${plan}`);
  }

  return (
    <div className="flex flex-col gap-6">
      {tiers.map((tier, i) => (
        <div key={i} className="border border-border p-5 flex flex-col gap-4 relative">
          <div className="flex items-center justify-between gap-2">
            <p className="text-gold text-[10px] tracking-widest uppercase">Tier {i + 1}</p>
            {tiers.length > 1 && (
              <button
                type="button"
                onClick={() => removeTier(i)}
                className="text-muted text-xs hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-muted mb-1.5">
                Tier name *
              </label>
              <input
                type="text"
                placeholder={TIER_PRESETS[i] ?? "e.g. Half Day"}
                value={tier.label}
                onChange={(e) => updateTier(i, "label", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-muted mb-1.5">
                Price *
              </label>
              <input
                type="text"
                placeholder="e.g. $300–500"
                value={tier.price}
                onChange={(e) => updateTier(i, "price", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-muted mb-1.5">
                Deposit
              </label>
              <input
                type="text"
                placeholder="e.g. $100"
                value={tier.deposit}
                onChange={(e) => updateTier(i, "deposit", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-muted mb-1.5">
                Time
              </label>
              <input
                type="text"
                placeholder="e.g. 3–5 hours"
                value={tier.hours}
                onChange={(e) => updateTier(i, "hours", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-1.5">
              Description
            </label>
            <input
              type="text"
              placeholder="What's included or typical piece types"
              value={tier.description}
              onChange={(e) => updateTier(i, "description", e.target.value)}
            />
          </div>
        </div>
      ))}

      {tiers.length < 4 && (
        <button
          type="button"
          onClick={addTier}
          className="flex items-center gap-2 text-muted text-xs hover:text-cream transition-colors py-1"
        >
          <span className="text-base leading-none">+</span> Add another tier
        </button>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-12 bg-cream text-black text-[11px] tracking-widest uppercase font-semibold hover:bg-cream/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save & continue →"}
        </button>
        <button
          type="button"
          onClick={handleSkip}
          disabled={saving}
          className="h-10 text-muted text-xs tracking-wider uppercase hover:text-cream transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
