"use client";

import { useState, useRef, useEffect } from "react";
import { getMonthDays, getFirstDayOfWeek } from "@/lib/mock-calendar";
import type { DayStatus, CalendarDay } from "@/lib/mock-calendar";
import { validateImageFiles, MAX_IMAGES } from "@/lib/image-utils";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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
  days,
  firstDow,
  selectedDate,
  onSelect,
}: {
  days: CalendarDay[];
  firstDow: number;
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
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

function buildRealDays(year: number, month: number, availableDates: Set<string>): CalendarDay[] {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: CalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const date = new Date(year, month, d);
    const dow = date.getDay();
    let status: DayStatus;
    if (date < todayMidnight) {
      status = "past";
    } else if (dow === 0 || dow === 1) {
      status = "unavailable";
    } else if (availableDates.has(dateStr)) {
      status = "available";
    } else {
      status = "booked";
    }
    days.push({ date: dateStr, status });
  }
  return days;
}

export function BookingSection() {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth()); // 0-indexed

  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  // null = loading, true = real calendar, false = fallback to mock
  const [calendarConnected, setCalendarConnected] = useState<boolean | null>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [manualDate, setManualDate] = useState("");

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

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/availability/miguel")
      .then((r) => r.json())
      .then((data: { connected: boolean; slots?: { startsAt: string }[] }) => {
        if (data.connected && Array.isArray(data.slots)) {
          const dates = new Set(data.slots.map((s) => s.startsAt.split("T")[0]));
          setAvailableDates(dates);
          setCalendarConnected(true);
        } else {
          setCalendarConnected(false);
        }
      })
      .catch(() => setCalendarConnected(false));
  }, []);

  function getCalendarDays(): CalendarDay[] {
    if (calendarConnected === true) {
      return buildRealDays(calYear, calMonth, availableDates);
    }
    return getMonthDays(calYear, calMonth);
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setManualDate(date);
  }

  function handleManualDate(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setManualDate(val);
    setSelectedDate(val || null);
    if (val) {
      const parts = val.split("-");
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1; // 0-indexed
      if (!isNaN(y) && !isNaN(m)) {
        setCalYear(y);
        setCalMonth(m);
      }
    }
  }

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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const combined = [...images, ...files];
    const error = validateImageFiles(combined.map((f) => ({ name: f.name, type: f.type, size: f.size })));
    if (error) {
      setImageError(error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setImageError(null);
    setImages(combined);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitState("idle");
    try {
      const imagePayloads = await Promise.all(
        images.map(async (file) => ({
          name: file.name,
          type: file.type,
          data: await fileToBase64(file),
        }))
      );
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          preferredDate: selectedDate,
          images: imagePayloads,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitState("success");
      setForm({ name: "", email: "", phone: "", idea: "", budget: "", message: "" });
      setSelectedDate(null);
      setManualDate("");
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setSubmitState("error");
    } finally {
      setSubmitting(false);
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

            {calendarConnected === null ? (
              <div className="h-48 flex items-center justify-center">
                <span className="text-muted text-sm">Loading availability…</span>
              </div>
            ) : (
              <Calendar
                days={getCalendarDays()}
                firstDow={getFirstDayOfWeek(calYear, calMonth)}
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
              />
            )}

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

            <div className="mt-6">
              <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">
                Don&apos;t see your date? Enter it here
              </label>
              <input
                type="date"
                value={manualDate}
                min={todayStr}
                onChange={handleManualDate}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="border-t border-border py-20 px-6 bg-card">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">Get in touch</p>
          <h2 className="text-3xl font-light text-cream mb-2">Book a Free Consultation Today!</h2>
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
                  Budget (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. $500, around $1,000, flexible"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
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

              <div>
                <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">
                  Reference Images{" "}
                  <span className="normal-case tracking-normal text-[#555]">
                    (optional · up to 3 · JPEG or PNG · 5MB each)
                  </span>
                </label>

                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative">
                        <img
                          src={src}
                          alt={`Reference ${i + 1}`}
                          className="w-20 h-20 object-cover rounded border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          aria-label={`Remove image ${i + 1}`}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-[#333] text-cream rounded-full flex items-center justify-center text-xs leading-none hover:bg-red-800 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < MAX_IMAGES && (
                  <label className="flex items-center justify-center gap-2 h-11 px-4 border border-dashed border-border rounded cursor-pointer text-muted text-sm hover:border-[#444] hover:text-cream transition-colors">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Add {images.length > 0 ? "another" : "a"} reference image
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      multiple
                      capture={undefined}
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                )}

                {imageError && (
                  <p className="text-red-400 text-xs mt-1.5">{imageError}</p>
                )}
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
    </div>
  );
}
