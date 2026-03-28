import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useMemo,
} from "react";

import { useNextId } from "../hooks/utils/useNextId";

export type EntityIdContextValue = {
  getNextTowerId: (reset?: boolean) => number;
  getNextEnemyId: (reset?: boolean) => number;
  getNextProjectileId: (reset?: boolean) => number;
  getNextEffectId: (reset?: boolean) => number;
};

const EntityIdContext = createContext<EntityIdContextValue | null>(null);

type EntityIdProviderProps = {
  children: ReactNode;
};

export const EntityIdProvider: FC<EntityIdProviderProps> = ({ children }) => {
  const getNextTowerId = useNextId();
  const getNextEnemyId = useNextId();
  const getNextProjectileId = useNextId();
  const getNextEffectId = useNextId();

  const value = useMemo(
    (): EntityIdContextValue => ({
      getNextTowerId,
      getNextEnemyId,
      getNextProjectileId,
      getNextEffectId,
    }),
    [getNextTowerId, getNextEnemyId, getNextProjectileId, getNextEffectId]
  );

  return (
    <EntityIdContext.Provider value={value}>{children}</EntityIdContext.Provider>
  );
};

export const useEntityIds = (): EntityIdContextValue => {
  const ctx = useContext(EntityIdContext);
  if (!ctx) {
    throw new Error("useEntityIds must be used within EntityIdProvider");
  }
  return ctx;
};
