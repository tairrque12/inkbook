"use client";

import { useEffect } from "react";

export function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = parseInt(el.dataset.revealDelay ?? "0", 10);
          if (delay > 0) {
            setTimeout(() => el.classList.add("reveal-visible"), delay);
          } else {
            el.classList.add("reveal-visible");
          }
          io.unobserve(el);
        });
      },
      { threshold: 0.07, rootMargin: "0px 0px -50px 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
