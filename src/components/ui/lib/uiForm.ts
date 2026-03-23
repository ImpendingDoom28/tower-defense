import { cva } from "class-variance-authority";

export const formControlVariants = cva(
  "border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-none border px-2.5 text-xs outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      control: {
        input: "h-8 placeholder:text-muted-foreground",
        textarea: "min-h-20 py-2 placeholder:text-muted-foreground",
        select: "h-8",
      },
    },
    defaultVariants: {
      control: "input",
    },
  },
);
