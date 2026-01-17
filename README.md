# Tower Defense Game

A 3D tower defense game built with React, Tailwind CSS, and React Three Fiber.

## Features

- **Tile-based tower placement system** - Click tiles on the grid to place towers
- **Three tower types**:
  - Basic Tower: Fast firing, single target damage
  - Slow Tower: Slows enemies on hit
  - AOE Tower: Area of effect damage
- **Enemy wave system** - 7 waves of increasing difficulty
- **Economy system** - Earn money by killing enemies, spend it on towers
- **Health system** - Lose health when enemies reach the end
- **3D graphics** - Built with React Three Fiber for immersive gameplay

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

1. **Start the game**: Click on a tower in the shop (left side) to select it
2. **Place towers**: Click on a tile in the grid to place the selected tower
3. **Defend**: Towers automatically target and shoot at enemies
4. **Survive**: Defend against 7 waves of enemies
5. **Win**: Complete all waves without losing all your health

## Controls

- **Mouse**: Click to place towers, rotate camera with drag
- **ESC**: Deselect tower or pause game
- **P**: Pause/Resume game

## Game Mechanics

- **Money**: Start with $200, earn more by killing enemies
- **Health**: Start with 20 health, lose 1 per enemy that reaches the end
- **Waves**: Each wave increases in difficulty with more and stronger enemies
- **Tower Types**: Each tower has different stats (damage, range, fire rate, cost)

Enjoy the game!
