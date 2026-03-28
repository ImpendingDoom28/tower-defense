import type { FC, ReactNode } from "react";

import { cn } from "../ui/lib/twUtils";
import { HUDWrapper } from "./HUDWrapper";

type HUDSidePanelProps = {
  children: ReactNode;
  className?: string;
  side?: "left" | "right";
};

export const HUDSidePanel: FC<HUDSidePanelProps> = ({
  children,
  className,
  side = "right",
}) => {
  return (
    <HUDWrapper className={cn(className)}>
      <div
        className={cn(
          "pointer-events-none relative z-10 flex h-full w-full",
          side === "right" ? "justify-end" : "justify-start"
        )}
      >
        <div className="flex w-full pointer-events-auto md:max-w-xl">
          {children}
        </div>
      </div>
    </HUDWrapper>
  );
};
