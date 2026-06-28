"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "outline" | "light";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 min-h-[48px] rounded-full px-5 text-[15px] font-medium tracking-[-0.01em] " +
  "transition-[transform,background-color,border-color,color,opacity] duration-200 ease-luxe " +
  "active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-ink disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";

const variants: Record<Variant, string> = {
  primary: "bg-gold text-ink hover:bg-[#d8bd84] shadow-[0_8px_30px_-12px_rgba(200,169,106,0.7)]",
  ghost: "bg-white/8 text-white border border-white/20 backdrop-blur-md hover:bg-white/14",
  outline: "bg-transparent text-white border border-gold/60 hover:bg-gold/10",
  light: "bg-ink-text text-white hover:bg-black focus-visible:ring-offset-cream",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", block, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${block ? "w-full" : ""} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
