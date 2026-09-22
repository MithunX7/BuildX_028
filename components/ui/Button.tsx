import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 border-transparent",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-500/20 border-transparent",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 border-transparent",
    outline: "bg-transparent hover:bg-slate-800 text-slate-300 border-slate-700",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white border-transparent",
  };

  const sizeStyles = {
    sm: "px-2.5 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-5 py-2.5 text-base rounded-xl font-semibold",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-medium border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}
