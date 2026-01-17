type SupportedVariableNames = "primary" | "destructive";

export const getCssColorValue = (name: SupportedVariableNames) => {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  const color = computedStyle.getPropertyValue(`--${name}-hex`);

  return color;
};
