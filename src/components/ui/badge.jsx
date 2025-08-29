import { cva } from "class-variance-authority";

import { cn } from "@/lib/shadcn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-blue text-primary-foreground hover:bg-primary-blue/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        red: "border-transparent text-red-500 bg-red-500/20",
        green: "border-transparent text-green-500 bg-green-500/20",
        outline: "text-foreground",
        "outline-primary-blue": "border border-primary-blue text-primary-blue",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
