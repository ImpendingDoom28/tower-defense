import { useCallback, useEffect, useState } from "react";

import {
  setShowSettingsSelector,
  showSettingsSelector,
  useGameStore,
} from "../../core/stores/useGameStore";

export const useMenuState = () => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showAlmanac, setShowAlmanac] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const showSettings = useGameStore(showSettingsSelector);
  const setShowSettings = useGameStore(setShowSettingsSelector);

  useEffect(() => {
    const onInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    };

    globalThis.addEventListener("mousedown", onInteraction, { once: true });
    globalThis.addEventListener("keydown", onInteraction, { once: true });
    globalThis.addEventListener("touchstart", onInteraction, { once: true });

    return () => {
      globalThis.removeEventListener("mousedown", onInteraction);
      globalThis.removeEventListener("keydown", onInteraction);
      globalThis.removeEventListener("touchstart", onInteraction);
    };
  }, [hasInteracted]);

  const onOpenSettings = useCallback(() => {
    setShowAlmanac(false);
    setShowLevelPicker(false);
    setShowSettings(true);
  }, [setShowSettings]);

  const onOpenAlmanac = useCallback(() => {
    setShowSettings(false);
    setShowLevelPicker(false);
    setShowAlmanac(true);
  }, [setShowSettings]);

  const onOpenLevelPicker = useCallback(() => {
    setShowSettings(false);
    setShowAlmanac(false);
    setShowLevelPicker(true);
  }, [setShowSettings]);

  const onCloseAlmanac = useCallback(() => {
    setShowAlmanac(false);
  }, []);

  const onCloseLevelPicker = useCallback(() => {
    setShowLevelPicker(false);
  }, []);

  const getActiveView = () => {
    if (showSettings) return "settings" as const;
    if (showAlmanac) return "almanac" as const;
    if (showLevelPicker) return "levelPicker" as const;
    return "menu" as const;
  };

  const activeView = getActiveView();

  return {
    hasInteracted,
    showAlmanac,
    setShowAlmanac,
    showLevelPicker,
    setShowLevelPicker,
    showSettings,
    setShowSettings,
    onOpenSettings,
    onOpenAlmanac,
    onOpenLevelPicker,
    onCloseAlmanac,
    onCloseLevelPicker,
    activeView,
  };
};
