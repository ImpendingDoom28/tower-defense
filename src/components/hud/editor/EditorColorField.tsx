import type { ChangeEvent, FC } from "react";

import { UIInput } from "../../ui/UIInput";
import type { ColorToken } from "../../ui/lib/cssUtils";
import { getCssColorValue } from "../../ui/lib/cssUtils";

type EditorColorFieldProps = {
  value: string | undefined;
  defaultToken: ColorToken;
  onChange: (value: string) => void;
};

export const EditorColorField: FC<EditorColorFieldProps> = ({
  value,
  defaultToken,
  onChange,
}) => {
  const resolved = value ?? getCssColorValue(defaultToken);

  const onColorWellChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const onHexInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="flex gap-1.5">
      <input
        type="color"
        value={resolved}
        onChange={onColorWellChange}
        className="h-8 w-8 shrink-0 cursor-pointer border border-input bg-transparent p-0.5"
      />
      <UIInput value={resolved} onChange={onHexInputChange} />
    </div>
  );
};
