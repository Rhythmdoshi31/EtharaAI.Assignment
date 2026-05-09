import { HTMLAttributes, forwardRef } from "react";
import { cn } from "./Button";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral-dark" | "lime-keyword" | "overdue" | "status" | "priority-high" | "priority-medium" | "priority-low";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral-dark", children, ...props }, ref) => {
    const variants = {
      "neutral-dark": "bg-[#150f23] text-white rounded-[4px] px-2 py-1 text-[10px] font-semibold tracking-[0.25px] uppercase",
      "lime-keyword": "bg-[#c2ef4e] text-[#1f1633] rounded-[4px] px-3 font-bold",
      overdue: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-[4px] px-2 py-1 text-[10px] font-semibold tracking-[0.25px] uppercase",
      status: "bg-[#e5e7eb] text-[#1f1633] rounded-[4px] px-2 py-1 text-[10px] font-semibold tracking-[0.25px] uppercase",
      "priority-high": "bg-[#fa7faa]/10 text-[#fa7faa] border border-[#fa7faa]/20 rounded-[4px] px-2 py-1 text-[10px] font-semibold tracking-[0.25px] uppercase",
      "priority-medium": "bg-[#6a5fc1]/10 text-[#6a5fc1] border border-[#6a5fc1]/20 rounded-[4px] px-2 py-1 text-[10px] font-semibold tracking-[0.25px] uppercase",
      "priority-low": "bg-gray-500/10 text-gray-500 border border-gray-500/20 rounded-[4px] px-2 py-1 text-[10px] font-semibold tracking-[0.25px] uppercase",
    };

    return (
      <span ref={ref} className={cn("inline-flex items-center justify-center", variants[variant], className)} {...props}>
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";
