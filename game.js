const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");
const pacmanFrame = document.getElementById("animation");
const ghostFrame = document.getElementById("ghosts");

let fps = 30;
let oneBlockSize = 32;
let wallColor = "#00FFFF";
let wallSpaceWidth = oneBlockSize / 1.2;
let wallOffset = (oneBlockSize - wallSpaceWidth) /2;
let wallInnerColor = 'black'

// Define Map Tile Constants
const TILE_WALL = 1;
const TILE_PELLET = 2;
const TILE_POWER_PELLET = 3;
const TILE_EMPTY = 0;
const TILE_GHOST_HOUSE = 4;
const TILE_GHOST_DOOR = 5;
const TILE_PACMAN_START = 6; // Optional: Designate Pac-Man start tile

// Spritesheet variables
let wallSpritesheet = new Image();
let wallSpritesheetLoaded = false;
const spriteSize = 128; // Updated for 512x512 spritesheet (512 / 4)
wallSpritesheet.src = 'assets/walls.png'; // <<< IMPORTANT: Make sure this path is correct!

wallSpritesheet.onload = () => {
    wallSpritesheetLoaded = true;
    console.log("Wall spritesheet loaded.");
    // Optional: Trigger the first draw or game start here if needed
};
wallSpritesheet.onerror = () => {
    console.error("Error loading wall spritesheet at assets/walls.png");
    // Handle error, maybe draw basic walls as fallback?
};

// Lookup Table (LUT) for mapping bitmask value (0-15) to sprite grid coordinates (col, row)
// This needs to match the layout of YOUR specific walls.png
const wallTileLookup = [
    {x: 0, y: 0}, // Mask 0 (0000) - Isolated (Corrected based on visual analysis)
    {x: 0, y: 1}, // Mask 1 (0001 - U) - End Cap Up
    {x: 3, y: 0}, // Mask 2 (0010 - R) - End Cap Right
    {x: 3, y: 1}, // Mask 3 (0011 - UR) - Corner Top Right
    {x: 1, y: 3}, // Mask 4 (0100 - D) - End Cap Down
    {x: 0, y: 3}, // Mask 5 (0101 - UD) - Vertical Straight
    {x: 1, y: 1}, // Mask 6 (0110 - RD) - Corner Bottom Right
    {x: 1, y: 2}, // Mask 7 (0111 - URD) - T-NoLeft (Points Left)
    {x: 2, y: 0}, // Mask 8 (1000 - L) - End Cap Left
    {x: 2, y: 1}, // Mask 9 (1001 - UL) - Corner Bottom Left
    {x: 1, y: 0}, // Mask 10 (1010 - RL) - Horizontal Straight
    {x: 2, y: 3}, // Mask 11 (1011 - URL) - T-NoDown (Points Down)
    {x: 2, y: 2}, // Mask 12 (1100 - DL) - Corner Top Left
    {x: 0, y: 2}, // Mask 13 (1101 - UDL) - T-NoRight (Points Right)
    {x: 3, y: 3}, // Mask 14 (1110 - RDL) - T-NoUp (Points Left)
    {x: 3, y: 2}, // Mask 15 (1111 - URDL) - Cross/Full
];

// Classic Pac-Man Map Layout (Example - Can be adjusted)
let map = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
    [1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1], // 1
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1], // 2
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1], // 3
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 4
    [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1], // 5
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1], // 6
    [1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1, 1], // 7 
    [0, 0, 0, 0, 1, 2, 1, 0, 0, 4, 4, 4, 0, 0, 1, 2, 1, 0, 0, 0, 0], // 8 - Ghost House row
    [1, 1, 1, 1, 1, 2, 1, 0, 1, 4, 4, 4, 1, 0, 1, 2, 1, 1, 1, 1, 1], // 9 - Ghost House row
    [1, 0, 0, 0, 0, 2, 0, 0, 1, 4, 4, 4, 1, 0, 0, 2, 0, 0, 0, 0, 1], // 10 - Ghost start positions can be here
    [1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 5, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1], // 11 - Ghost Door row
    [0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0], // 12
    [1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1, 1], // 13
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 14
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1], // 15
    [1, 3, 2, 2, 1, 2, 2, 2, 2, 6, 2, 2, 2, 2, 2, 2, 1, 2, 2, 3, 1], // 16 - Pacman Start row (using 6)
    [1, 1, 1, 2, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 2, 1, 1, 1], // 17 
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1], // 18
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1], // 19
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1], // 20
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 21
];

// Calculate canvas size based on map
const mapRows = map.length;
const mapCols = map[0].length;
canvas.width = mapCols * oneBlockSize;
canvas.height = mapRows * oneBlockSize;

// Pac-Man instance
let pacman;

// Game variables
let score = 0;
let lives = 3; // Example starting lives

let createRect  =(Color, x, y, width, height) =>{
    canvasContext.fillStyle = Color
    canvasContext.fillRect(x,y,width,height)
}

// Initialize Pac-Man - Find starting position (using TILE_PACMAN_START)
let pacmanStartX, pacmanStartY;
let startTileValue = TILE_EMPTY; // Default to empty
let startX_grid, startY_grid;

for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
        if (map[i][j] === TILE_PACMAN_START) { 
             startTileValue = map[i][j]; 
             pacmanStartX = j * oneBlockSize;
             pacmanStartY = i * oneBlockSize;
             startX_grid = j;
             startY_grid = i;
             // Explicitly clear the starting tile from the map data immediately
             map[startY_grid][startX_grid] = TILE_EMPTY;
             break;
        }
    }
     if (pacmanStartX !== undefined) break;
}

// Default position if TILE_PACMAN_START not found in map (fallback)
if (pacmanStartX === undefined) {
    console.warn("Pac-Man start tile (6) not found in map. Using fallback.");
    pacmanStartX = oneBlockSize * 10; // Example fallback X (adjust if needed)
    pacmanStartY = oneBlockSize * 17; // Example fallback Y (adjust if needed)
    const fallbackGridX = 10;
    const fallbackGridY = 17;
    if (map[fallbackGridY] && map[fallbackGridY][fallbackGridX] !== TILE_WALL) { 
        map[fallbackGridY][fallbackGridX] = TILE_EMPTY;
    }
}

pacman = new PacMan(pacmanStartX, pacmanStartY, oneBlockSize, oneBlockSize / 5);

// Gamepad state
let gamepadConnected = false;
let previousGamepadButtons = [];
let previousGamepadAxes = [];

// Game State
const STATE_READY = 0;
const STATE_PLAYING = 1;
const STATE_GAMEOVER = 2;
let gameState = STATE_READY; // Start in Ready state

let gameLoop = () =>{
    // Only update game logic if playing
    if (gameState === STATE_PLAYING) {
        handleGamepadInput(); // Check gamepad state each frame
        update();
    } else {
        // Still handle inputs needed for starting/restarting
        handleGamepadInput(); 
    }
    // Draw always runs, but draws different things based on state
    draw();
}

let update = () =>{
    //todo: Update Method
    pacman.update(map);

    // Placeholder for losing a life (e.g., collision with ghost)
    // if (pacmanHitGhost()) { 
    //    loseLife();
    // }

     // Check for winning condition (e.g., all pellets eaten)
     // if (areAllPelletsEaten()) {
     //    winLevel(); // TODO: Implement win condition
     // }
}

let draw = () =>{
    // Draw black background
    createRect('black', 0, 0, canvas.width, canvas.height);
    
    if (gameState === STATE_READY) {
        drawReadyScreen();
    } else if (gameState === STATE_PLAYING) {
        // Draw the map using sprites
        drawWalls();
        // Draw dynamic elements
        drawPellets();
        pacman.draw(canvasContext);
        drawScore();
        drawLives(); // Add function to draw lives
        // todo: Draw ghosts
    } else if (gameState === STATE_GAMEOVER) {
        drawGameOverScreen();
    }
}

let gameInterval = setInterval(gameLoop, 1000/fps);

let drawWalls = () => {
    if (!wallSpritesheetLoaded) {
        // Basic fallback (draw cyan squares for walls)
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                if (map[i][j] === TILE_WALL) {
                    createRect(wallColor, j * oneBlockSize, i * oneBlockSize, oneBlockSize, oneBlockSize);
                }
            }
        }
        return; // Exit if spritesheet isn't ready
    }
    // When using spritesheet, the color comes from the image, 
    // but we keep wallColor defined for fallback or potential other uses.

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] === TILE_WALL) {
                // Calculate bitmask based on neighbours
                let mask = 0;
                if (i > 0 && map[i - 1][j] === TILE_WALL) mask |= 1; // Up
                if (j < map[0].length - 1 && map[i][j + 1] === TILE_WALL) mask |= 2; // Right
                if (i < map.length - 1 && map[i + 1][j] === TILE_WALL) mask |= 4; // Down
                if (j > 0 && map[i][j - 1] === TILE_WALL) mask |= 8; // Left

                // Get the correct sprite grid coordinates from the lookup table
                const spriteCoords = wallTileLookup[mask];
                if (!spriteCoords) { // Sanity check in case of unexpected mask value
                    console.warn(`Invalid wall mask ${mask} at (${j}, ${i}). Drawing fallback.`);
                    createRect(wallColor, j * oneBlockSize, i * oneBlockSize, oneBlockSize, oneBlockSize);
                    continue;
                }

                // Calculate source coordinates (sx, sy) on the spritesheet
                const sx = spriteCoords.x * spriteSize;
                const sy = spriteCoords.y * spriteSize;

                // Calculate destination coordinates (dx, dy)
                const dx = j * oneBlockSize;
                const dy = i * oneBlockSize;

                // Draw the appropriate sprite tile using the looked-up coordinates
                canvasContext.drawImage(
                    wallSpritesheet,
                    sx,             // Use sx from lookup
                    sy,             // Use sy from lookup
                    spriteSize,
                    spriteSize,
                    dx,
                    dy,
                    oneBlockSize,
                    oneBlockSize
                );
            } 
            // TODO: Add drawing for Ghost House Walls / Door using sprites if needed
            // else if (map[i][j] === TILE_GHOST_HOUSE) { ... }
            // else if (map[i][j] === TILE_GHOST_DOOR) { ... }
        }
    }
}

// Function to draw pellets
let drawPellets = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
             const tileValue = map[i][j];
             const pelletX = j * oneBlockSize + oneBlockSize / 2;
             const pelletY = i * oneBlockSize + oneBlockSize / 2;

            if (tileValue === TILE_PELLET) { // 2 = Pellet
                 const pelletColor = "#00FF00"; // Bright Lime Green
                 const pelletGlowColor = "#55FF55";
                 const pelletRadius = oneBlockSize / 8; // Slightly smaller pellets

                 // Add glow
                 canvasContext.shadowColor = pelletGlowColor;
                 canvasContext.shadowBlur = 8;

                 canvasContext.fillStyle = pelletColor;
                 canvasContext.beginPath();
                 canvasContext.arc(pelletX, pelletY, pelletRadius, 0, Math.PI * 2);
                 canvasContext.fill();
                 canvasContext.closePath();

                 // Reset glow
                 canvasContext.shadowBlur = 0;
                 canvasContext.shadowColor = 'transparent';

            } else if (tileValue === TILE_POWER_PELLET) { // 3 = Power Pellet
                 const powerPelletColor = "#FF00FF"; // Bright Magenta
                 const powerPelletGlowColor = "#FF88FF";
                 const baseRadius = oneBlockSize / 5; // Slightly larger power pellets
                 const flashFactor = 0.2;
                 const radius = baseRadius + Math.sin(Date.now() / 150) * baseRadius * flashFactor;

                 // Add intense glow
                 canvasContext.shadowColor = powerPelletGlowColor;
                 canvasContext.shadowBlur = 15;

                 canvasContext.fillStyle = powerPelletColor;
                 canvasContext.beginPath();
                 canvasContext.arc(pelletX, pelletY, radius, 0, Math.PI * 2);
                 canvasContext.fill();
                 canvasContext.closePath();

                 // Reset glow
                 canvasContext.shadowBlur = 0;
                 canvasContext.shadowColor = 'transparent';
            }
        }
    }
};

// Function to draw the score
let drawScore = () => {
    const scoreColor = "#00FFFF"; // Cyan score text
    const scoreGlowColor = "#55FFFF";

    // Add glow
    canvasContext.shadowColor = scoreGlowColor;
    canvasContext.shadowBlur = 5;

    canvasContext.fillStyle = scoreColor;
    canvasContext.font = `bold ${oneBlockSize * 0.8}px 'Courier New', Courier, monospace`; // Monospace font, scaled
    const currentScore = pacman ? pacman.getScore() : 0;
    canvasContext.textAlign = 'left'; // Ensure alignment
    canvasContext.fillText(`Score: ${currentScore}`, 10, canvas.height - 10); // Position at bottom-left

    // Reset glow
    canvasContext.shadowBlur = 0;
    canvasContext.shadowColor = 'transparent';
};

// --- Add Drawing Functions for States --- 

function drawReadyScreen() {
    canvasContext.fillStyle = '#FFFF00'; // Yellow text
    canvasContext.font = `bold ${oneBlockSize * 1.5}px 'Courier New', Courier, monospace`;
    canvasContext.textAlign = 'center';
    canvasContext.shadowColor = "#FFFF88";
    canvasContext.shadowBlur = 10;
    canvasContext.fillText("READY!", canvas.width / 2, canvas.height / 2 - oneBlockSize);

    canvasContext.fillStyle = '#00FFFF'; // Cyan text
    canvasContext.font = `bold ${oneBlockSize * 0.8}px 'Courier New', Courier, monospace`;
    canvasContext.fillText("Press ENTER / Tap Screen / Gamepad Button", canvas.width / 2, canvas.height / 2 + oneBlockSize);
    canvasContext.shadowBlur = 0;
    canvasContext.shadowColor = 'transparent';
}

function drawGameOverScreen() {
    canvasContext.fillStyle = '#FF0000'; // Red text
    canvasContext.font = `bold ${oneBlockSize * 2}px 'Courier New', Courier, monospace`;
    canvasContext.textAlign = 'center';
    canvasContext.shadowColor = "#FF5555";
    canvasContext.shadowBlur = 10;
    canvasContext.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - oneBlockSize * 1.5);

    // Display final score
    const finalScore = pacman ? pacman.getScore() : 0;
    canvasContext.fillStyle = '#00FFFF'; // Cyan text
    canvasContext.font = `bold ${oneBlockSize * 1}px 'Courier New', Courier, monospace`;
    canvasContext.fillText(`Final Score: ${finalScore}`, canvas.width / 2, canvas.height / 2 );

    canvasContext.fillStyle = '#00FF00'; // Green text
    canvasContext.font = `bold ${oneBlockSize * 0.8}px 'Courier New', Courier, monospace`;
    canvasContext.fillText("Press ENTER / Tap Screen / Gamepad Button to Restart", canvas.width / 2, canvas.height / 2 + oneBlockSize * 1.5);
    canvasContext.shadowBlur = 0;
    canvasContext.shadowColor = 'transparent';
}

function drawLives() {
    // Example: Draw Pac-Man icons for lives
    canvasContext.fillStyle = '#FFFF00';
    canvasContext.shadowColor = "#FFFF88";
    canvasContext.shadowBlur = 5;
    for (let i = 0; i < lives; i++) {
        canvasContext.beginPath();
        // Position lives display (e.g., bottom right)
        const lifeX = canvas.width - (i + 1) * (oneBlockSize * 1.2);
        const lifeY = canvas.height - oneBlockSize * 0.8;
        canvasContext.arc(
            lifeX + oneBlockSize / 2,
            lifeY + oneBlockSize / 2,
            oneBlockSize / 2.5, // Slightly smaller radius for lives icons
            0.25 * Math.PI, 
            1.75 * Math.PI
        );
        canvasContext.lineTo(lifeX + oneBlockSize / 2, lifeY + oneBlockSize / 2); 
        canvasContext.fill();
        canvasContext.closePath();
    }
    canvasContext.shadowBlur = 0;
    canvasContext.shadowColor = 'transparent';
}

// --- Game State Management ---
function startGame() {
    if (gameState === STATE_READY || gameState === STATE_GAMEOVER) {
        resetGame();
        gameState = STATE_PLAYING;
        console.log("Game Starting!");
    }
}

function loseLife() {
     if (gameState !== STATE_PLAYING) return; // Only lose life if playing

     lives--;
     console.log("Lost a life! Lives remaining:", lives);
     // TODO: Add animation/sound for losing life

     if (lives <= 0) {
         gameState = STATE_GAMEOVER;
         console.log("Game Over!");
         // TODO: Play game over sound
     } else {
         // Reset Pac-Man position for the current level (optional)
         pacman.resetPosition(pacmanStartX, pacmanStartY); 
         // Optional: Reset ghost positions here too
         // Brief pause or 'Ready?' state before continuing?
         // For simplicity now, just reset position
     }
}

function resetGame() {
    console.log("Resetting game...");
    lives = 3;
    // Reset score in PacMan instance
    if (pacman) {
        pacman.resetScore();
        pacman.resetPosition(pacmanStartX, pacmanStartY);
        // Set initial direction to start moving immediately
        pacman.direction = 'right'; // Or 'left' if preferred
        pacman.requestedDirection = 'right'; // Also set requested to avoid initial stall
    }
    // TODO: Reset the map (pellets) - More complex, requires storing original map
    // For now, pellets stay eaten on restart

    // TODO: Reset Ghosts
}

// --- Gamepad Input Handling ---
window.addEventListener("gamepadconnected", (event) => {
    console.log("Gamepad connected:", event.gamepad.id);
    gamepadConnected = true;
    // Initialize previous state arrays based on the connected gamepad
    previousGamepadButtons = Array(event.gamepad.buttons.length).fill(false);
    previousGamepadAxes = Array(event.gamepad.axes.length).fill(0);
});

window.addEventListener("gamepaddisconnected", (event) => {
    console.log("Gamepad disconnected:", event.gamepad.id);
    gamepadConnected = false;
});

function handleGamepadInput() {
    if (!gamepadConnected) return;

    // Browsers typically update gamepad state on access, not via events
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0]; // Assuming the first connected gamepad

    if (!gp) return; // No gamepad data available

    let requestedDirection = null;
    let startButtonPressed = false; // Flag for start/restart
    const deadzone = 0.5;

    // --- Check Axes/D-Pad for Movement (Only if Playing) ---
    if (gameState === STATE_PLAYING) {
        // ... (Existing axis/button checks for direction)
        if (gp.buttons[14] && gp.buttons[14].pressed) requestedDirection = 'left';
        if (gp.buttons[15] && gp.buttons[15].pressed) requestedDirection = 'right';
        if (gp.buttons[12] && gp.buttons[12].pressed) requestedDirection = 'up';
        if (gp.buttons[13] && gp.buttons[13].pressed) requestedDirection = 'down';

        if (requestedDirection) {
             if (pacman && pacman.direction !== requestedDirection) {
                 pacman.changeDirection(requestedDirection, map);
             }
        }
    }

    // --- Check Buttons for Start/Restart (Any standard button press) ---
    if (gameState === STATE_READY || gameState === STATE_GAMEOVER) {
         // Check common action buttons (A, B, X, Y - indices 0, 1, 2, 3) or Start (index 9)
         // Check against previous state to avoid multiple triggers per press
         for (let i = 0; i < gp.buttons.length; i++) {
             if (gp.buttons[i].pressed && !previousGamepadButtons[i]) {
                 startButtonPressed = true;
                 break; // Exit loop once any button press is detected
             }
         }
         if (startButtonPressed) {
             startGame();
         }
    }

    // Update previous button state AFTER checking for presses
    gp.buttons.forEach((button, index) => { previousGamepadButtons[index] = button.pressed; });
    // gp.axes.forEach((axis, index) => { previousGamepadAxes[index] = axis; });
}

// Keyboard Input Listener
window.addEventListener('keydown', (event) => {
    if (gameState === STATE_READY || gameState === STATE_GAMEOVER) {
        // Start game on Enter key
        if (event.key === 'Enter') {
            startGame();
            return; // Don't process movement keys
        }
        // Allow Esc or other keys? (Optional)
    }

    // Handle movement only if playing
    if (gameState !== STATE_PLAYING) return;

    let requestedDirection = null;
    switch (event.key) {
        case 'ArrowUp':
        case 'w': // Optional WASD support
            requestedDirection = 'up';
            break;
        case 'ArrowDown':
        case 's': // Optional WASD support
            requestedDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a': // Optional WASD support
            requestedDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd': // Optional WASD support
            requestedDirection = 'right';
            break;
    }
    if (requestedDirection) {
         pacman.changeDirection(requestedDirection, map);
    }
});

// --- Touch Input --- 
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const swipeThreshold = 50; // Minimum distance for a swipe

canvas.addEventListener('touchstart', (event) => {
    // Prevent default actions like scrolling
    event.preventDefault();
    // Store the starting touch position
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}, { passive: false });

canvas.addEventListener('touchmove', (event) => {
    // Prevent default actions
    event.preventDefault();
    // Update the ending touch position (for continuous tracking if needed)
    touchEndX = event.touches[0].clientX;
    touchEndY = event.touches[0].clientY;
}, { passive: false });

canvas.addEventListener('touchend', (event) => {
    event.preventDefault();
    // If touchEndX/Y weren't updated by touchmove (i.e., it was a tap, not drag)
    // Use changedTouches which exists on touchend
    if (touchEndX === 0 && touchEndY === 0) {
        if (event.changedTouches.length > 0) {
            touchEndX = event.changedTouches[0].clientX;
            touchEndY = event.changedTouches[0].clientY;
        }
    }

    if (gameState === STATE_READY || gameState === STATE_GAMEOVER) {
        // Start game on any tap/swipe release
        startGame();
        // Reset coords immediately after starting
        touchStartX = 0; touchStartY = 0; touchEndX = 0; touchEndY = 0;
        return;
    }
    
    // Handle movement only if playing
    if (gameState !== STATE_PLAYING) return;

    // Calculate the swipe distance and direction
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    let requestedDirection = null;

    // Check if the swipe distance is significant
    if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
        // Determine if the swipe was primarily horizontal or vertical
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0) {
                requestedDirection = 'right';
            } else {
                requestedDirection = 'left';
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                requestedDirection = 'down';
            } else {
                requestedDirection = 'up';
            }
        }
    }

    // Send direction change to PacMan if a valid swipe occurred
    if (requestedDirection) {
        pacman.changeDirection(requestedDirection, map);
    }

    // Reset touch coordinates for the next swipe
    touchStartX = 0;
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;
}, { passive: false });

// Ensure pacman.js is included before game.js in index.html
// <script src="pacman.js"></script>
// <script src="game.js"></script>
