# Tower Defense Game

A 3D tower defense game built with React, Tailwind CSS, and React Three Fiber.

## Features

- **Tile-based tower placement system** - Click tiles on the grid to place towers
- **Four tower types**:
  - Basic Tower: Fast firing, single target damage (targets nearest enemy)
  - Slow Tower: Slows enemies on hit with debuff effects
  - AOE Tower: Area of effect damage that hits multiple enemies
  - Laser Tower: Piercing beam that hits multiple enemies in a line (targets furthest enemy)
- **Three enemy types**:
  - Troop: Standard enemy with balanced stats
  - Fastero: Fast-moving enemy with lower health
  - Tankee: Slow but heavily armored enemy that causes more health loss
- **Enemy wave system** - 7 waves of increasing difficulty with configurable enemy compositions
- **Economy system** - Earn money by killing enemies, spend it on towers
- **Tower management** - Click on placed towers to view info and sell them (50% refund)
- **Health system** - Lose health when enemies reach the end (varies by enemy type)
- **Audio system** - Sound effects with adjustable volume controls (master, SFX, music, ambient)
- **Main menu** - Start screen with game menu (pause, restart, audio settings)
- **Enemy Almanac** - Bestiary that tracks discovered enemy types with stats and descriptions (persists to localStorage)
- **Wave controls** - Start waves early or wait for automatic wave progression
- **3D graphics** - Built with React Three Fiber for immersive gameplay
- **JSON-based configuration** - Game settings, tower stats, and level data stored in JSON files

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The game will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## How to Play

1. **Start the game**: Click "Play" on the main menu to begin
2. **View the almanac**: Click "Enemy Almanac" to see discovered enemies (undiscovered show as silhouettes)
3. **Select a tower**: Click on a tower in the shop (left side) to select it
3. **Place towers**: Click on a tile in the grid to place the selected tower (cannot place on paths or occupied tiles)
4. **Manage towers**: Click on a placed tower to view its stats and sell it if needed
5. **Defend**: Towers automatically target and shoot at enemies based on their targeting mode
6. **Start waves**: Waves start automatically after a delay, or click "Start Wave Early" to begin immediately
7. **Survive**: Defend against 7 waves of enemies without losing all your health
8. **Win**: Complete all waves to win the game

## Controls

- **Mouse**: 
  - Click tiles to place selected towers
  - Click placed towers to select/view info
  - Drag to rotate camera
- **ESC**: Deselect tower or open game menu
- **P**: Pause/Resume game

## Game Mechanics

- **Money**: Start with $10,000, earn more by killing enemies (rewards vary by enemy type)
- **Health**: Start with 20 health, lose health when enemies reach the end (amount varies by enemy type)
- **Waves**: 7 waves with increasing difficulty, each containing multiple enemy types
  - Waves start automatically after a 15-second delay (configurable)
  - You can start waves early if all enemies from the previous wave are defeated
- **Tower Types**: Each tower has unique stats:
  - **Basic Tower**: $50, 20 damage, 3.5 range, 1s fire rate
  - **Slow Tower**: $80, 10 damage, 3 range, 0.8s fire rate, slows enemies by 60% for 2s
  - **AOE Tower**: $150, 30 damage, 3 range, 3s fire rate, 1.25 radius area damage
  - **Laser Tower**: $200, 15 damage, 4 range, 2s fire rate, pierces up to 5 enemies
- **Tower Selling**: Sell towers for 50% of their purchase price
- **Targeting**: Towers target either the nearest or furthest enemy based on their type
- **Projectile Types**: Single-target, area-of-effect, and piercing beam projectiles
- **Audio**: Adjustable volume controls for master, SFX, music, and ambient sounds
- **Enemy Almanac**: 
  - Accessed from the main menu
  - Undiscovered enemies appear as silhouettes with "???" names
  - Enemies are revealed when you encounter them in battle
  - Discovery progress persists across browser sessions via localStorage

Enjoy the game!
