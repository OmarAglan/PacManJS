# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.7.0] - 2024-07-27

### Added
- **A* Pathfinding for Ghosts:**
  - Implemented A* algorithm (`#findPathToTarget`) for optimal ghost navigation in Chase, Scatter, and Eaten modes.
  - Path caching system (`cachedPath`, `cachedTarget`, `pathUpdateInterval`) added to optimize performance.
  - Debug mode now visualizes the calculated A* path for each ghost.
- Centralized tile walkability check (`#isTileWalkable`) for consistency between pathfinding and collision.

### Changed
- **Ghost Movement Logic:**
  - Replaced simple distance-based direction selection with A* path following for non-frightened ghosts.
  - Ghosts now temporarily stop if A* fails to find a path, prompting recalculation.
- **Collision Detection (`#isCollision`):**
  - Simplified logic to directly use `#isTileWalkable` for the ghost's hitbox corners.
  - Ensures closer alignment between pixel-level collision checks and grid-based A* walkability.
- Removed old fallback pathfinding code from the `update` method.
- Updated `README.md` and `ROADMAP.md` to reflect A* implementation.

## [0.6.0] - 2024-07-27

### Added
- Advanced Ghost AI implementation:
  - Implemented classic ghost behavior modes:
    - Scatter mode: Ghosts target their assigned corners of the map
    - Chase mode: Each ghost has a unique targeting strategy
    - Frightened mode: Activated by Power Pellets
  - Unique targeting algorithms for each ghost:
    - Blinky (Red): Directly targets Pac-Man's position
    - Pinky (Pink): Targets 4 tiles ahead of Pac-Man (with the original game's "up" bug)
    - Inky (Cyan): Uses Blinky's position and vector math to calculate an ambush position
    - Clyde (Orange): Targets Pac-Man when far (>8 tiles), flees to his scatter corner when close
  - Ghost house behavior:
    - Ghosts exit the house at staggered intervals
    - Eaten ghosts return to the house and become active again
  - Mode timing system:
    - Ghosts switch between scatter and chase automatically
    - Ghosts reverse direction when changing modes
  - Debug mode (toggle with F2 / D) to visualize ghost target tiles and paths.
- Ghost-Pacman collision detection:
  - Pacman loses a life when touched by a non-frightened ghost
  - Frightened ghosts can be eaten for increasing score values (200, 400, 800, 1600)
- Win condition when all pellets are eaten
- Floating text display for scores (`showFloatingText`, `drawFloatingTexts`).

### Changed
- Updated ghost rendering to support mode-specific appearances:
  - Normal mode (colored ghosts with directional sprites)
  - Frightened mode (blue sprites, flashing white near the end)
  - Eaten mode (eyes only)
- Updated `update()` function to process power pellet activation and ghost frightened state
- Improved ghost movement to be AI-driven and target-seeking (initially distance-based).
- Enhanced reset logic after life loss to properly reset ghost and Pacman positions
- Updated README with ghost AI details and control information
- Refined Ghost pathfinding to prevent getting stuck.
- Improved Ghost collision detection to prevent corner snagging.
- Enhanced Ghost House entry/exit logic.

## [0.5.0] - 2024-07-26

### Added
- Wall Generation Tool (`download_walls.html`):
    - Added UI controls to customize background color, wall/glow color, glow intensity, and wall thickness.
    - Updated drawing logic to use customized values.
    - Implemented live preview update on generation.
    - Updated corner drawing logic to handle variable thickness.

### Changed
- Updated `README.md` to document the wall generation tool and its customization options.

## [0.4.0] - YYYY-MM-DD

### Added
- Neon/Sci-Fi visual style:
    - Updated color palette (cyan, magenta, lime green, bright yellow).
    - Added glow effects to Pac-Man, pellets, and score text using canvas shadows.
- Wall rendering using spritesheet (`assets/walls.png`) and `wallTileLookup`.
- Multi-platform controls:
    - Touch swipe detection on canvas.
    - Gamepad API integration (D-Pad/Stick movement, button start/restart).
- Game States (`STATE_READY`, `STATE_PLAYING`, `STATE_GAMEOVER`):
    - `gameState` variable to track current state.
    - `gameLoop`, `update`, `draw` functions now respect game state.
    - `drawReadyScreen`, `drawGameOverScreen`, `drawLives` functions.
    - `startGame`, `loseLife`, `resetGame` state management functions.
    - `resetPosition`, `resetScore` methods added to `PacMan` class.
- HTML Updates (`index.html`):
    - Updated page title.
    - Added control guidelines display area.
    - CSS for canvas centering and basic responsiveness.
    - CSS for neon control guidelines text.
- Immediate Pac-Man movement on game start.

### Changed
- Adjusted Pac-Man speed to fixed integer value for smoother movement.
- Refactored `drawWalls` to use spritesheet and lookup table.
- Modified input handlers (Keyboard, Touch, Gamepad) to handle game states (start/restart vs movement).
- Updated `draw` function to call state-specific drawing functions.
- Updated `resetGame` to set initial Pac-Man direction.

## [0.3.0] - YYYY-MM-DD

### Added
- Defined pellets (`2`) and power pellets (`3`) in the `map` array (`game.js`).
- `drawPellets` function to render pellets (white) and power pellets (orange, flashing) (`game.js`).
- Pellet eating logic in `PacMan.update` (`pacman.js`):
    - Removes pellets/power pellets from map on collision.
    - Increases score (10 for pellet, 50 for power pellet).
- `PacMan.score` property and `getScore()` method (`pacman.js`).
- `drawScore` function to display the current score (`game.js`).
- Power Pellet effect (`pacman.js`):
    - `powerPelletActive` state and timer.
    - `activatePowerPellet()` and `isPowerPelletActive()` methods.
    - Timer countdown in `update`.
- Pac-Man color change in `PacMan.draw` (`pacman.js`):
    - Changes to lime green when power pellet is active.
    - Flashes between yellow and lime green before timer expires.
- Logic to explicitly clear the starting tile and award points at game start (`game.js`).

### Changed
- Updated `PacMan.update` to handle pellet/power pellet eating.
- Updated `PacMan.draw` to handle power pellet color changes and flashing.
- Modified starting logic in `game.js` to clear starting pellet correctly.
- Modified `drawPellets` to handle power pellet rendering and color.

## [0.2.0] - YYYY-MM-DD

### Added
- Collision detection logic (`#isCollision`, `#isCollisionInDirection`) in `PacMan` class.
- Pac-Man alignment to grid on collision for smoother movement.
- Horizontal map wrapping (tunnel effect).
- Basic Pac-Man mouth animation based on movement direction.
- Dynamic canvas sizing based on map dimensions in `game.js`.

### Changed
- Updated `PacMan.update` and `PacMan.changeDirection` to accept the `map` and use collision checks.
- Passed `map` argument to `pacman.update` and `pacman.changeDirection` in `game.js`.

## [0.1.0] - YYYY-MM-DD

### Added
- Initial project setup with HTML canvas and basic game loop (`game.js`).
- Created `README.md` and `ROADMAP.md`.
- Implemented `PacMan` class (`pacman.js`) with position, size, and speed.
- Added basic Pac-Man drawing (yellow circle).
- Implemented keyboard event listeners (Arrow Keys & WASD) for player input.
- Added basic Pac-Man movement based on keyboard input.
- Added basic map drawing (`drawWalls` in `game.js`).
- Located Pac-Man's starting position based on the map array. 