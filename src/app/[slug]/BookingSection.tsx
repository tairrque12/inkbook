"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { validateImageFiles, MAX_IMAGES } from "@/lib/image-utils";

interface AvailableSlot {
  id: string;
  startsAt: string;
  endsAt: string;
  slotType: string;
}

function formatSlotDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function SlotCard({
  slot,
  onSelect,
}: {
  slot: AvailableSlot;
  onSelect: (date: string) => void;
}) {
  const dateStr = slot.startsAt.split("T")[0];
  return (
    <div className="border border-[#222] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <p className="text-cream font-medium">{formatSlotDate(slot.startsAt)}</p>
      <button
        onClick={() => onSelect(dateStr)}
        className="shrink-0 h-11 px-5 border border-cream text-cream text-xs tracking-widest uppercase hover:bg-cream hover:text-black transition-colors"
      >
        Request This Date
      </button>
    </div>
  );
}

export function BookingSection() {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);

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

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLElement>(null);

  const fetchSlots = useCallback(() => {
    fetch("/api/availability/miguel")
      .then((r) => r.json())
      .then((data: { slots?: AvailableSlot[] }) => {
        setSlots(data.slots ?? []);
        setSlotsLoaded(true);
      })
      .catch(() => setSlotsLoaded(true));
  }, []);

  useEffect(() => { fetchSlots() }, [fetchSlots]);

  function handleRequestDate(date: string) {
    setSelectedDate(date);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const combined = [...images, ...files];
    const error = validateImageFiles(
      combined.map((f) => ({ name: f.name, type: f.type, size: f.size }))
    );
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
      {/* Available Slots */}
      <section className="border-t border-border py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">Availability</p>
          <h2 className="text-3xl font-light text-cream mb-2">Open Dates</h2>
          <p className="text-muted text-sm mb-10">Tue – Sat · Austin, TX · Click a date to pre-fill the form below.</p>

          {!slotsLoaded ? (
            <div className="py-12 text-center">
              <p className="text-[#444] text-sm">Loading availability…</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="py-12 border border-[#1a1a1a] text-center px-6">
              <p className="text-[#666] text-sm leading-relaxed">
                No dates currently available — fill out the form below with your preferred date and Miguel will be in touch.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {slots.map((slot) => (
                <SlotCard key={slot.id} slot={slot} onSelect={handleRequestDate} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Form */}
      <section ref={formRef} className="border-t border-border py-20 px-6 bg-card">
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
                  <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Email *</label>
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
                  <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Phone (optional)</label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Preferred Date</label>
                  <input
                    type="date"
                    value={selectedDate ?? ""}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value || null)}
                    placeholder="Select or enter a date"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Tattoo Idea *</label>
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
                <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Budget (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. $500, around $1,000, flexible"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Additional Notes</label>
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
                    (optional · up to 3 · JPEG or PNG · 10MB each)
                  </span>
                </label>

                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
                      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
