- Make overall game style as a neobrutalism
- Add a sound pitching so the same audio sounds a little different
- Make sound distancing where it should sound like it was produced by this place, for example:
  - If it's tower shooting sound, make it so that audio sounds like it comes from the tower;
  - If it's enemy spawn, make it so that audio sound like it comes from the starting point;
  - etc.
    You should also consider the camera position so it sounds further or closer.
- Make a little page/camera shake with negative sound then we try to click on tower without the money

## Idea catalog (at least 4 behaviors; 2 implemented now)

| Idea              | What it does                       | Fit with current codebase                                                                                | Suggested phase |
| ----------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------- |
| **Rally aura**    | Radius move-speed buff             | Extend speed calc in `[Enemy.tsx](src/components/entities/Enemy.tsx)` `useFrame` with a per-frame lookup | **Ship now**    |
| **Gold siphon**   | On leak or on hit, reduces `money` | Needs hooks in `[useLevelSystem.ts](src/core/hooks/useLevelSystem.ts)` / reach-end path                  | Later           |
| **Splitter**      | On death, spawn N weaker enemies   | Wave accounting + `addEnemy` from death handler; larger churn                                            | Later           |
| **Phase / dodge** | % ignore hit or brief invuln       | Touch `[useProjectileSystem.ts](src/core/hooks/useProjectileSystem.ts)` / hit resolution                 | Later           |
| **Armored shell** | Flat or % damage reduction         | Centralize in `[useEnemySystem.ts](src/core/hooks/useEnemySystem.ts)` `damageEnemy`                      | Later           |
