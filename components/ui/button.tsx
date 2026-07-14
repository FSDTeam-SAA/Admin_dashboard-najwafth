import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-2xl text-sm font-medium transition disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f5bea]/40",
  {
    variants: {
      variant: {
        default: "bg-[#103670] text-white hover:bg-[#0d2e5d]",
        secondary: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
        outline: "border border-[#6d98c0] bg-white text-[#6d98c0] hover:bg-[#edf4fb]",
        destructive: "bg-[#d92d20] text-white hover:bg-[#b42318]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);

Button.displayName = "Button";

export { Button };
