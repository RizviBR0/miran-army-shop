"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const SpotlightCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,0,.15), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};

export const GlowingButton = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
}) => {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-brand-yellow px-6 py-3 font-semibold text-brand-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,0,0.4)]",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-brand-yellow via-yellow-300 to-brand-yellow opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
};

export const FloatingElement = ({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <div
      className={cn("animate-bounce", className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: "3s",
      }}
    >
      {children}
    </div>
  );
};
