const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");
const pacmanFrame = document.getElementById("animation");
const ghostFrame = document.getElementById("ghosts");

let fps = 30;
let oneBlockSize = 20;
let wallColor = "#342DCA";
let wallSpaceWidth = oneBlockSize / 1.2;
let wallOffset = (oneBlockSize - wallSpaceWidth) /2;
let wallInnerColor = 'black'

let map =
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1],
        [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
        [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2],
        [1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1],
        [1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1],
        [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1],
        [1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 1, 1],
        [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
        [1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
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

// Initialize Pac-Man - Find starting position (e.g., first '2' in the map)
let pacmanStartX, pacmanStartY;
let startTileValue = 0; // Store the value of the starting tile (2 or 3)
let startX_grid, startY_grid; // Store grid indices

for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
         // Look for 2 (pellet) or 3 (power pellet) as potential start
         // Prioritize 2 if both exist, but usually only one designated start
        if (map[i][j] === 2 || map[i][j] === 3) { 
             // Store the value before potentially clearing it
             startTileValue = map[i][j]; 
             pacmanStartX = j * oneBlockSize;
             pacmanStartY = i * oneBlockSize;
             startX_grid = j;
             startY_grid = i;
             // Explicitly clear the starting tile from the map data immediately
             map[startY_grid][startX_grid] = 0;
             break; // Found start, exit inner loop
        }
    }
}

// Default position if not found in map (fallback)
if (pacmanStartX === undefined) {
    pacmanStartX = oneBlockSize * 10; // Example fallback
    pacmanStartY = oneBlockSize * 17; // Example fallback
    // Ensure fallback start position is also cleared if it was a pellet
    // Though typically the map should define a start
    const fallbackGridX = 10;
    const fallbackGridY = 17;
    if (map[fallbackGridY] && map[fallbackGridY][fallbackGridX] !== 1) { // Check exists and not wall
        map[fallbackGridY][fallbackGridX] = 0;
    }
}


pacman = new PacMan(pacmanStartX, pacmanStartY, oneBlockSize, oneBlockSize / 5); // Example speed

// Optional: Give points for the starting pellet immediately
if (startTileValue === 2) {
    pacman.score += 10;
} else if (startTileValue === 3) {
    pacman.score += 50;
    pacman.activatePowerPellet();
}

let gameLoop = () =>{
    update()
    draw()
}

let update = () =>{
    //todo: Update Method
    pacman.update(map);
}

let draw = () =>{
        createRect('black', 0, 0, canvas.width, canvas.height)
        //todo: Draw Methods
        drawWalls()
        pacman.draw(canvasContext);
        drawPellets();
        drawScore();
        // todo: Draw food
        // todo: Draw ghosts
        // todo: Draw lives
}

let gameInterval = setInterval(gameLoop, 1000/fps);

let drawWalls = () =>{
    //todo: Draw Walls Method
        for (let i = 0; i < map.length; i++){
            for (let j = 0; j < map[0].length; j++){
                if (map[i][j] === 1){ // 1 = Wall
                    createRect(
                        wallColor,
                        j * oneBlockSize,
                        i * oneBlockSize,
                        oneBlockSize,
                        oneBlockSize
                    );
                    if (j>0 && map[i][j -1] ===1){
                            createRect(
                                wallInnerColor,
                                j * oneBlockSize,
                                i * oneBlockSize + wallOffset,
                                wallSpaceWidth +wallOffset,
                                oneBlockSize,
                                oneBlockSize
                            )
                    }
                }
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

            if (tileValue === 2) { // 2 = Pellet
                 canvasContext.fillStyle = 'white';
                 canvasContext.beginPath();
                 const pelletRadius = oneBlockSize / 6;
                 canvasContext.arc(pelletX, pelletY, pelletRadius, 0, Math.PI * 2);
                 canvasContext.fill();
                 canvasContext.closePath();
            } else if (tileValue === 3) { // 3 = Power Pellet
                 canvasContext.fillStyle = 'orange';
                 // Make power pellets flash by changing size
                 const baseRadius = oneBlockSize / 4;
                 const flashFactor = 0.1;
                 const radius = baseRadius + Math.sin(Date.now() / 150) * baseRadius * flashFactor;
                 canvasContext.beginPath();
                 canvasContext.arc(pelletX, pelletY, radius, 0, Math.PI * 2);
                 canvasContext.fill();
                 canvasContext.closePath();
            }
        }
    }
};

// Function to draw the score
let drawScore = () => {
    canvasContext.fillStyle = 'white';
    canvasContext.font = '20px Arial';
    // Get score from PacMan instance
    const currentScore = pacman ? pacman.getScore() : 0;
    canvasContext.fillText(`Score: ${currentScore}`, 10, canvas.height - 10); // Position at bottom-left
};

// Keyboard Input Listener
window.addEventListener('keydown', (event) => {
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

// Ensure pacman.js is included before game.js in index.html
// <script src="pacman.js"></script>
// <script src="game.js"></script>
