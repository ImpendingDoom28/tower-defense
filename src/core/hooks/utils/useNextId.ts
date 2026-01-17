import { useCallback, useRef } from "react";

export const useNextId = () => {
  const nextId = useRef(1);
  return useCallback((reset?: boolean) => {
    if (reset) nextId.current = 1;
    return nextId.current++;
  }, []);
};
