"use client";

import { useRef, useState, ReactNode } from "react";

interface Tilt3DProps {
  children: ReactNode;
  className?: string;
}

export function Tilt3D({ children, className = "" }: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
    transition: "transform 0.1s ease-out",
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
      transition: "transform 0.1s ease-out",
    });
  }

  function handleMouseLeave() {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: "transform 0.4s ease-out",
    });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
}
