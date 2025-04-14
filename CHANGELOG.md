# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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