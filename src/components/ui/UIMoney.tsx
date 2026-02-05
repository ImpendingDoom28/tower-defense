import type { FC } from "react";

import { DollarSign } from "lucide-react";

import { UITypography, type UITypographyProps } from "./UITypography";
import { cn } from "./lib/twUtils";

type UIMoneyProps = {
  money: number;
  variant?: UITypographyProps["variant"];
  /**
   * @deprecated Use iconSize instead.
   */
  size?: number;
  iconSize?: number;
  className?: string;
};

export const UIMoney: FC<UIMoneyProps> = ({
  money,
  variant = "medium",
  size,
  iconSize,
  className,
}) => {
  const resolvedIconSize = iconSize ?? size ?? 16;

  return (
    <UITypography
      variant={variant}
      className={cn("flex items-center text-green-400", className)}
    >
      <DollarSign size={resolvedIconSize} className="mr-1" /> {money}
    </UITypography>
  );
};
