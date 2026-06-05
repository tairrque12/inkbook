"use client";

import { useState, useEffect } from "react";

export function StickyHeader({ artistName }: { artistName: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;

    const io = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  function handleBookNow(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-1 pointer-events-none"
      }`}
      style={{
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        backgroundColor: "rgba(4, 4, 4, 0.80)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="text-cream text-sm font-medium tracking-wide">
          {artistName}
        </span>
        <a
          href="#book"
          onClick={handleBookNow}
          className="h-8 px-4 border border-cream/40 text-cream text-[11px] tracking-widest uppercase hover:bg-cream hover:text-black transition-colors flex items-center"
        >
          Book Now
        </a>
      </div>
    </div>
  );
}
