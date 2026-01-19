import { DollarSign } from "lucide-react";
import { UITypography, UITypographyProps } from "./UITypography";
import { FC } from "react";

type UIMoneyProps = {
  variant: UITypographyProps["variant"];
  money: number;
  size: number;
};

export const UIMoney: FC<UIMoneyProps> = ({ money, size, variant }) => {
  return (
    <UITypography
      variant={variant}
      className="flex items-center text-green-400"
    >
      <DollarSign size={size} /> {money}
    </UITypography>
  );
};
