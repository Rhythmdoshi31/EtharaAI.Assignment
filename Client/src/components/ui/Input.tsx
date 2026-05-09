import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "./Button";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, labelClassName, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            className={cn(
              "mb-2 block text-sm font-medium text-[#1f1633]",
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "flex w-full rounded-[6px] border border-[#cfcfdb] bg-white px-3 py-2 text-base text-[#1f1633] transition-colors",
            "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[rgba(59,130,246,0.5)] focus:shadow-[inset_0_2px_10px_rgba(0,0,0,0.15)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
