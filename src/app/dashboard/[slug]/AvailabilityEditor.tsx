"use client";

import { useState } from "react";

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

  const firstDow = new Date(year, month, 1).getDay();
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
          const isPast = new Date(year, month, d) < todayMidnight;
          const isOn = selected.has(dateStr);

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

export function AvailabilityEditor({
  slug,
  initialDates,
}: {
  slug: string;
  initialDates: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialDates));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function toggleDate(date: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
    setSaved(false);
  }

  const now = new Date();
  const calMonths = [0, 1, 2].map((offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch(`/api/artists/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available_dates: Array.from(selected) }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-cream text-lg font-light mb-1">Availability</h2>
        <p className="text-muted text-sm">
          Select the dates you&apos;re open for new bookings. These show on your public profile.
        </p>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-[#555]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-600 inline-block" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#1a1a1a] border border-[#333] inline-block" /> Click to select
        </span>
      </div>

      {selected.size > 0 && (
        <p className="text-cream text-sm">
          {selected.size} date{selected.size !== 1 ? "s" : ""} marked available
        </p>
      )}

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

      {error && <p className="text-red-400 text-xs">{error}</p>}
      {saved && <p className="text-green-400 text-xs">Availability saved.</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="h-12 bg-cream text-black text-[11px] tracking-widest uppercase font-semibold hover:bg-cream/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-start px-8"
      >
        {saving ? "Saving…" : "Save availability"}
      </button>
    </div>
  );
}
