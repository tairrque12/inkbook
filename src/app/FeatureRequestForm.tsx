"use client";

import { useState } from "react";

const SUGGESTED_FEATURES = [
  "Online booking system",
  "Client deposit payments",
  "Flash sale drops",
  "Waitlist management",
  "Design collaboration tools",
  "Client messaging",
  "Portfolio analytics",
  "Print/merch store",
];

export function FeatureRequestForm() {
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function toggleFeature(feature: string) {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <span className="text-gold text-3xl leading-none">✓</span>
        <p className="text-cream text-xl font-light">Thanks for your input.</p>
        <p className="text-muted text-sm text-center">
          We&apos;re building inkbook for artists like you. We&apos;ll keep you
          posted at <span className="text-cream">{email}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
      <div>
        <label className="text-[10px] tracking-widest uppercase text-muted mb-3 block">
          What features do you wish you had?
        </label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_FEATURES.map((feature) => (
            <button
              key={feature}
              type="button"
              onClick={() => toggleFeature(feature)}
              className={`px-3 py-1.5 text-xs border transition-colors ${
                selectedFeatures.includes(feature)
                  ? "border-gold text-gold bg-gold/10"
                  : "border-border text-muted hover:border-cream/50 hover:text-cream"
              }`}
            >
              {feature}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] tracking-widest uppercase text-muted mb-2 block">
          Something else? Tell us
        </label>
        <input
          type="text"
          placeholder="I wish I had..."
          value={customFeature}
          onChange={(e) => setCustomFeature(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] tracking-widest uppercase text-muted mb-2 block">
            Email
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-[10px] tracking-widest uppercase text-muted mb-2 block">
            Instagram
          </label>
          <input
            type="text"
            placeholder="@handle"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        className="h-12 px-8 bg-cream text-black text-[11px] tracking-widest uppercase hover:bg-cream/90 transition-colors font-semibold"
      >
        Submit feedback
      </button>
    </form>
  );
}
