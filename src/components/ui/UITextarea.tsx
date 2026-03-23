import type { ComponentProps, FC } from "react";

import { formControlVariants } from "./lib/uiForm";
import { cn } from "./lib/twUtils";

type UITextareaProps = ComponentProps<"textarea">;

export const UITextarea: FC<UITextareaProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <textarea
      className={cn(formControlVariants({ control: "textarea" }), className)}
      {...props}
    >
      {children}
    </textarea>
  );
};
