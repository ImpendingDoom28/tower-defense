import { FC } from "react";
import { UITypography } from "./UITypography";

type UIBadgeProps = {
  text: string;
};

export const UIBadge: FC<UIBadgeProps> = ({ text }) => {
  return (
    <div className="flex flex-col">
      <div className="mb-2 h-0.5 w-12 bg-primary" />
      <UITypography
        variant="small"
        className="uppercase tracking-[0.5em] text-primary"
      >
        {text}
      </UITypography>
    </div>
  );
};
