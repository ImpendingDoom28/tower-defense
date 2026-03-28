export const getIsDocumentVisible = (): boolean =>
  typeof document === "undefined" ? true : document.visibilityState === "visible";
