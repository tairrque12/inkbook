"use client";

import { useState } from "react";
import { getMonthDays, getFirstDayOfWeek } from "@/lib/mock-calendar";
import type { DayStatus } from "@/lib/mock-calendar";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const BUDGET_OPTIONS = [
  "Under $300",
  "$300 – $600",
  "$600 – $1,200",
  "$1,200 – $2,500",
  "$2,500+",
];

function statusStyle(status: DayStatus, selected: boolean): string {
  if (selected) return "bg-gold text-black font-semibold cursor-pointer";
  switch (status) {
    case "available":
      return "bg-[#1A2E1A] text-green-400 hover:bg-[#223D22] cursor-pointer";
    case "booked":
      return "bg-[#2E1A1A] text-red-400 cursor-default";
    case "past":
    case "unavailable":
      return "text-[#333] cursor-default";
  }
}

function Calendar({
  year,
  month,
  selectedDate,
  onSelect,
}: {
  year: number;
  month: number;
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
  const days = getMonthDays(year, month);
  const firstDow = getFirstDayOfWeek(year, month);
  const blanks = Array(firstDow).fill(null);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs text-muted py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map(({ date, status }) => {
          const d = parseInt(date.split("-")[2]);
          const isSelected = date === selectedDate;
          const clickable = status === "available";
          return (
            <button
              key={date}
              onClick={() => clickable && onSelect(date)}
              disabled={!clickable}
              className={`aspect-square flex items-center justify-center rounded text-sm min-h-[44px] transition-colors ${statusStyle(status, isSelected)}`}
              aria-label={`${date} — ${status}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BookingSection({ artistSlug }: { artistSlug: string }) {
  const today = new Date("2026-05-30");
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1); // June
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    idea: "",
    budget: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");

  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitState("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, preferredDate: selectedDate }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitState("success");
      setForm({ name: "", email: "", phone: "", idea: "", budget: "", message: "" });
      setSelectedDate(null);
    } catch {
      setSubmitState("error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePayDeposit() {
    setPayLoading(true);
    setPayError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistSlug }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setPayError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setPayError("Unable to start checkout. Please try again.");
    } finally {
      setPayLoading(false);
    }
  }

  return (
    <div>
      {/* Availability Calendar */}
      <section className="border-t border-border py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">Availability</p>
          <h2 className="text-3xl font-light text-cream mb-2">Open Dates</h2>
          <p className="text-muted text-sm mb-10">Tue – Sat · 10am – 7pm · Austin, TX</p>

          <div className="max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="w-11 h-11 flex items-center justify-center border border-border rounded text-muted hover:text-cream hover:border-[#444] transition-colors"
                aria-label="Previous month"
              >
                ←
              </button>
              <span className="text-cream font-medium">
                {MONTH_NAMES[calMonth]} {calYear}
              </span>
              <button
                onClick={nextMonth}
                className="w-11 h-11 flex items-center justify-center border border-border rounded text-muted hover:text-cream hover:border-[#444] transition-colors"
                aria-label="Next month"
              >
                →
              </button>
            </div>

            <Calendar
              year={calYear}
              month={calMonth}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />

            <div className="flex gap-5 mt-6 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-green-400/30 inline-block" />
                Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-400/30 inline-block" />
                Booked
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#222] inline-block" />
                Closed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="border-t border-border py-20 px-6 bg-card">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">Get in touch</p>
          <h2 className="text-3xl font-light text-cream mb-2">Book a Consultation</h2>
          <p className="text-muted text-sm mb-10">
            Tell me about your idea. I&apos;ll get back to you within 24 hours.
          </p>

          {submitState === "success" ? (
            <div className="border border-green-800 bg-green-950/30 rounded p-6 text-center">
              <p className="text-green-400 text-lg font-medium mb-1">Request sent.</p>
              <p className="text-muted text-sm">Miguel will be in touch within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">
                    Preferred Date
                  </label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Select from calendar above"
                    value={selectedDate ?? ""}
                    className="cursor-default"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">
                  Tattoo Idea *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe what you have in mind — subject, style, size, placement…"
                  value={form.idea}
                  onChange={(e) => setForm({ ...form, idea: e.target.value })}
                  className="resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">
                  Budget Range
                </label>
                <select
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                >
                  <option value="">Select a range</option>
                  {BUDGET_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Anything else I should know — reference images, scheduling constraints, etc."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="resize-none"
                />
              </div>

              {submitState === "error" && (
                <p className="text-red-400 text-sm">
                  Something went wrong. Please try again or email directly.
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 h-14 bg-cream text-black font-semibold text-sm tracking-widest uppercase hover:bg-gold transition-colors disabled:opacity-50"
              >
                {submitting ? "Sending…" : "Send Request"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Stripe Deposit */}
      <section className="border-t border-border py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">Ready to commit?</p>
          <h2 className="text-3xl font-light text-cream mb-4">Secure Your Slot</h2>
          <p className="text-muted text-sm max-w-md mx-auto mb-2">
            A <span className="text-cream font-medium">$100 deposit</span> holds your appointment date and is applied in full to the final tattoo cost.
          </p>
          <p className="text-[#555] text-xs mb-10">
            Deposits are non-refundable if cancelled within 48 hours of the appointment.
          </p>

          {payError && (
            <p className="text-red-400 text-sm mb-4">{payError}</p>
          )}

          <button
            onClick={handlePayDeposit}
            disabled={payLoading}
            className="h-14 px-10 bg-gold text-black font-semibold text-sm tracking-widest uppercase hover:bg-cream transition-colors disabled:opacity-50"
          >
            {payLoading ? "Redirecting to Stripe…" : "Pay $100 Deposit"}
          </button>

          <p className="text-[#444] text-xs mt-4 flex items-center justify-center gap-1.5">
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden>
              <rect x="1" y="5" width="10" height="8" rx="1" stroke="#555" strokeWidth="1.2"/>
              <path d="M3 5V3.5a3 3 0 016 0V5" stroke="#555" strokeWidth="1.2"/>
            </svg>
            Secured by Stripe. Card details never touch this server.
          </p>
        </div>
      </section>
    </div>
  );
}
