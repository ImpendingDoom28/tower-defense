import { useMemo } from "react";

import { enemyTypesSelector, useGameStore } from "../stores/useGameStore";
import { getEnemyTypeOptions } from "../../utils/editorEnemyTypes";

export const useEnemyTypeOptions = () => {
  const enemyTypes = useGameStore(enemyTypesSelector);
  return useMemo(() => getEnemyTypeOptions(enemyTypes), [enemyTypes]);
};
