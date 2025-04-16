# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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