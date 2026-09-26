import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green/40 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-green text-white shadow-sm shadow-green/20 hover:bg-green-dark",
        secondary: "bg-navy text-white hover:bg-navy-800",
        outline: "border border-gray-200 bg-white text-navy hover:border-navy/30 hover:bg-gray-50",
        ghost: "text-navy hover:bg-gray-100",
        subtle: "bg-green-light text-green-dark hover:bg-green-light/70",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-13 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
}

export function Button({ className, variant, size, href, ...props }: ButtonProps) {
  if (href) {
    return (
      <Link href={href} className={cn(buttonVariants({ variant, size }), className)}>
        {props.children}
      </Link>
    );
  }
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
