# PacManJS

A simple Pac-Man game implemented in JavaScript.

## Running the Game

Open `index.html` in your web browser.

## Features (v0.5.0)

- Neon Sci-Fi visual style with glowing elements.
- Wall rendering using spritesheets with neighbor-aware tiling.
- Pac-Man entity rendering with mouth animation.
- Keyboard controls (Arrow keys / WASD) for Pac-Man movement.
- Touch swipe controls on canvas.
- Basic Gamepad support (D-Pad / Left Stick).
- Game map loaded from an array with defined tile types.
- Wall collision detection implemented.
- Horizontal map wrapping (tunnels).
- Pellets (lime green) and Power Pellets (magenta) added to the map.
- Pellet eating logic and score tracking.
- Power Pellet activation (changes Pac-Man color to magenta, flashes before expiring).
- Game States: Ready, Playing, Game Over.
- Start/Restart game logic via input.
- Score and Lives display.
- Centered canvas with basic responsiveness.

## Running the Game

Open `index.html` in your web browser.

## Wall Generation Tool

The project includes a helper tool, `download_walls.html`, to generate the `assets/walls.png` spritesheet required by the game.

### Running the Tool

Open `download_walls.html` in your web browser.

### Customization

The tool allows customization of the generated walls:
- **Background Color:** Change the background color of the spritesheet.
- **Wall/Glow Color:** Set the color used for the wall lines and their glow effect.
- **Glow Intensity:** Adjust the strength/spread of the glow effect using a slider.
- **Wall Thickness:** Control the thickness of the wall lines (as a percentage of tile size) using a slider.

After adjusting the options, click the "Generate and Download walls.png" button. The generated image will be previewed on the page and automatically downloaded. Place the downloaded `walls.png` file into the `assets/` directory, replacing the existing one if necessary. 