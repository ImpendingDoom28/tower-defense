- Currently game configuration is stored inside of a .ts file as code in @gameConfig.ts. Separate configurable fields into a json file and read from it instead to initialize a game state.
- Make overall game style as a neobrutalism
- Make an almonach of all enemy types. Initially they should be hidden, only provide a siloutte of an enemy shape and a "3-question marks" name. They need to be discovered by playing and encountering them in a game. After that, they're always shown with extra info about the enemy itself
- Make an ending point of enemies as building and a starting point as a portal/teleport of some sorts
- Add a sound pitching so the same audio sounds a little different
- Make sound distancing where it should sound like it was produced by this place, for example:
  - If it's tower shooting sound, make it so that audio sounds like it comes from the tower;
  - If it's enemy spawn, make it so that audio sound like it comes from the starting point;
  - etc.
    You should also consider the camera position so it sounds further or closer.
