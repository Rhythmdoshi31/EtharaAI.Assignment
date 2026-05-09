import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "inverted" | "ghost-dark" | "violet";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-[0.2px] transition-colors focus:outline-none focus:ring-2 focus:ring-ring-focus focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-[#150f23] text-white hover:bg-[#efefef] hover:text-[#1a1a1a] rounded-md px-4 py-3 text-sm",
      inverted: "bg-white text-[#1f1633] hover:bg-[#f0f0f0] hover:text-[#1a1a1a] rounded-md px-4 py-3 text-sm",
      "ghost-dark": "bg-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.25)] rounded-xl px-4 py-2 text-sm",
      violet: "bg-[#79628c] text-white hover:bg-[#6a5fc1] rounded-xl px-4 py-2 text-[14px] font-medium tracking-[0.2px] border border-[#362d59]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
