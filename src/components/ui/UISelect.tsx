import type { ComponentProps, FC } from "react";

import { formControlVariants } from "./lib/uiForm";
import { cn } from "./lib/twUtils";

type UISelectProps = ComponentProps<"select">;

export const UISelect: FC<UISelectProps> = ({ className, children, ...props }) => {
  return (
    <select
      className={cn(formControlVariants({ control: "select" }), className)}
      {...props}
    >
      {children}
    </select>
  );
};
