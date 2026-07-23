"use client";

import { ForwardedRef, ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline-chili";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-turmeric text-forest-dark font-semibold active:bg-turmeric-deep disabled:opacity-50",
  secondary:
    "bg-surface text-muted border border-line font-medium active:bg-line",
  danger:
    "bg-chili text-white font-semibold active:bg-chili/80",
  ghost:
    "text-white/70 hover:text-white font-medium",
  "outline-chili":
    "border border-chili/30 text-chili font-semibold active:bg-chili/5",
};

const sizeStyles = {
  sm: "px-2.5 py-1 text-[11px]",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "py-4 text-lg",
};

function Button(
  {
    variant = "primary",
    loading = false,
    disabled,
    className = "",
    children,
    ...props
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`rounded-sm transition-all duration-180 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default forwardRef(Button);
