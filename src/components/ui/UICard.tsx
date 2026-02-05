import { ComponentProps } from "react";

import { cn } from "./lib/twUtils";

function UICard({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "ring-0 bg-card text-card-foreground gap-4 overflow-hidden rounded-none py-4 text-xs/relaxed has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-2 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-none *:[img:last-child]:rounded-none group/card flex flex-col",
        className
      )}
      {...props}
    />
  );
}

function UICardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "gap-x-1 rounded-none px-4 group-data-[size=sm]/card:px-3 [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3 group/card-header @container/card-header grid auto-rows-min items-center has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-action]:grid-rows-[1fr] min-h-[28px]",
        className
      )}
      {...props}
    />
  );
}

function UICardTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("flex items-center gap-x-1", className)}
      {...props}
    />
  );
}

function UICardDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-xs/relaxed", className)}
      {...props}
    />
  );
}

function UICardAction({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function UICardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "flex flex-col px-4 group-data-[size=sm]/card:px-3",
        className
      )}
      {...props}
    />
  );
}

function UICardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "rounded-none border-t p-4 group-data-[size=sm]/card:p-3 flex items-center",
        className
      )}
      {...props}
    />
  );
}

export {
  UICard,
  UICardHeader,
  UICardFooter,
  UICardTitle,
  UICardAction,
  UICardDescription,
  UICardContent,
};
