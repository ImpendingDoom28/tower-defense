import type { ComponentProps, FC } from "react";

import { formControlVariants } from "./lib/uiForm";
import { cn } from "./lib/twUtils";

type UIInputProps = ComponentProps<"input">;

export const UIInput: FC<UIInputProps> = ({ className, ...props }) => {
  return (
    <input
      className={cn(formControlVariants({ control: "input" }), className)}
      {...props}
    />
  );
};
