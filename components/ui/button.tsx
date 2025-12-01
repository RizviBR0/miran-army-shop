import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-brand-yellow text-brand-black hover:bg-yellow-400 shadow-md hover:shadow-lg",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        link: "text-brand-black underline-offset-4 hover:underline",
        pink: "bg-accent-pink text-white hover:bg-pink-500 shadow-md",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
