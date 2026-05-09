import { HTMLAttributes, forwardRef } from "react";
import { cn } from "./Button";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "featured-dark" | "feature-dark";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "light", children, ...props }, ref) => {
    const variants = {
      light: "bg-white text-[#1f1633] rounded-[12px] p-6 border border-[#e5e7eb] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]",
      "featured-dark": "bg-[#150f23] text-white rounded-[12px] p-6",
      "feature-dark": "bg-[#1f1633] text-white rounded-[18px] p-8 border border-[#362d59]",
    };

    return (
      <div ref={ref} className={cn(variants[variant], className)} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
