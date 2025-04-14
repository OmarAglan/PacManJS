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

let map =
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
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
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1],
        [1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 1, 1],
        [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

// Initialize Pac-Man - Find starting position (e.g., first '2' in the map)
let pacmanStartX, pacmanStartY;
for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
        if (map[i][j] === 2) { // Assuming 2 is the starting point in the map array
             // Temporarily remove pacman start position from map
             // We'll handle food/dots later
             map[i][j] = 0;
             pacmanStartX = j * oneBlockSize;
             pacmanStartY = i * oneBlockSize;
             break; // Found start, exit inner loop
        }
    }
     if (pacmanStartX !== undefined) break; // Found start, exit outer loop
}

// Default position if not found in map (fallback)
if (pacmanStartX === undefined) {
    pacmanStartX = oneBlockSize * 10; // Example fallback
    pacmanStartY = oneBlockSize * 17; // Example fallback
}


pacman = new PacMan(pacmanStartX, pacmanStartY, oneBlockSize, oneBlockSize / 5); // Example speed

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
        // todo: Draw food
        // todo: Draw ghosts
        // todo: Draw score
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
