# PacManJS Roadmap

This document outlines the development plan for PacManJS.

## Phase 1: Core Gameplay Mechanics

- [x] Implement Pac-Man entity
- [x] Implement basic Pac-Man movement controlled by arrow keys
- [x] Create the game map/maze
- [x] Implement collision detection with walls
- [x] Add pellets (dots) to the map
- [x] Implement pellet eating logic
- [x] Add power pellets
- [x] Implement score tracking

## Phase 2: Ghost AI & Interaction

- [x] Implement Ghost entities (Blinky, Pinky, Inky, Clyde)
- [x] Implement basic random Ghost movement (superseded by AI)
- [x] Implement Ghost AI (Chase, Scatter, Frightened modes)
  - [x] Unique targeting logic for each ghost
  - [x] A* pathfinding for navigation
- [x] Implement Ghost collision detection (with walls and Pac-Man)
- [x] Implement Pac-Man eating Ghosts during Frightened mode
- [x] Implement Ghosts returning to the ghost house after being eaten

## Phase 3: Game Flow & UI

- [x] Implement game states (Ready, Playing, Game Over)
- [x] Add lives system (basic implementation with display)
- [x] Display score and lives on screen
- [ ] Implement level progression
- [ ] Add fruit bonuses
- [x] Create a start screen
- [x] Create a game over screen

## Phase 4: Polish & Enhancements

- [ ] Add sound effects (eating pellets, eating ghosts, death, intro)
- [ ] Add background music
- [x] Improve graphics and animations (sprites, smooth movement)
- [x] Refine Ghost AI for more authentic behavior (Implemented A*)
- [ ] Optimize performance (A* path caching implemented)
- [x] Added multi-platform controls (Keyboard, Touch, Gamepad)
- [x] Centered canvas & basic responsiveness

## Future Ideas (Beyond MVP)

- [ ] High score table (local storage)
- [ ] Different maze layouts per level
- [x] Mobile/touch controls
- [ ] Difficulty settings
- [ ] Two-player mode?
- [ ] Online leaderboards?
- [x] Customizable Wall Generation Tool 