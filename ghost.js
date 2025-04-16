class Ghost {
    constructor(x, y, tileSize, speed, ghostType, initialDirection = 'left') {
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
        this.speed = speed;
        this.ghostType = ghostType; // e.g., 'blinky', 'pinky', 'inky', 'clyde'
        this.direction = initialDirection;
        this.radius = tileSize / 2; // For potential collision logic later

        // Spritesheet properties
        this.spriteSize = 16; // Assuming 16x16 sprites in ghost.png
        this.spriteSheetCol = 0; // Will depend on ghostType and direction
        this.spriteSheetRow = 0; // Will depend on ghostType
        this.animationFrame = 0;
        this.frameCount = 2; // Assuming 2 frames per direction per ghost

        // Target tile for AI movement
        this.targetX = 0;
        this.targetY = 0;

        // Path caching for A* optimization
        this.cachedPath = null;
        this.cachedTarget = null;
        this.pathUpdateTimer = 0;
        this.pathUpdateInterval = 500; // Update path every 500ms

        // State properties for AI
        this.mode = 'scatter'; // Initial mode: 'scatter', 'chase', 'frightened'
        this.previousMode = 'scatter'; // Store previous mode when entering frightened
        this.isFrightened = false;
        this.frightenedTimer = 0;
        this.frightenedDuration = 8000; // 8 seconds of frightened mode
        this.flashingThreshold = 3000; // Start flashing 3 seconds before end of frightened mode
        this.isVisible = true; // For when eaten
        this.isEaten = false; // When eaten, goes back to ghost house
        
        // Mode timers
        this.modeTimer = 0;
        this.scatterDuration = 7000; // 7 seconds in scatter
        this.chaseDuration = 20000; // 20 seconds in chase
        
        // House positioning
        this.inHouse = ghostType !== 'blinky'; // Blinky starts outside
        this.houseExitTimer = 0;
        
        // Set exit time based on ghost type
        switch(ghostType) {
            case 'blinky': this.houseExitTime = 0; break; // Starts outside
            case 'pinky': this.houseExitTime = 3000; break; // 3 seconds
            case 'inky': this.houseExitTime = 6000; break; // 6 seconds
            case 'clyde': this.houseExitTime = 9000; break; // 9 seconds
        }

        // Corner targets for scatter mode (based on map dimensions)
        this.scatterTarget = this.#getScatterTarget();
        
        // Assign initial spritesheet row based on type
        this.#setSpriteRowByType();
    }

    // Private helper to set the spritesheet row based on ghost type
    #setSpriteRowByType() {
        switch(this.ghostType) {
            case 'blinky': this.spriteSheetRow = 0; break; // Red
            case 'pinky': this.spriteSheetRow = 1; break;  // Pink
            case 'inky': this.spriteSheetRow = 2; break;   // Cyan
            case 'clyde': this.spriteSheetRow = 3; break;  // Orange
            default: this.spriteSheetRow = 0; // Default to Blinky
        }
    }

    // Private helper to get scatter target based on ghost type
    #getScatterTarget() {
        // Default map size is 21x22 tiles (as in the original game)
        const mapWidth = 21;
        const mapHeight = 22;
        
        switch(this.ghostType) {
            case 'blinky': return { x: mapWidth - 1, y: 0 }; // Top-right corner
            case 'pinky': return { x: 0, y: 0 }; // Top-left corner
            case 'inky': return { x: mapWidth - 1, y: mapHeight - 1 }; // Bottom-right corner
            case 'clyde': return { x: 0, y: mapHeight - 1 }; // Bottom-left corner
            default: return { x: mapWidth - 1, y: 0 }; // Default to top-right
        }
    }

    draw(ctx, ghostSpritesheet) {
        if (!this.isVisible || !ghostSpritesheet) return; // Don't draw if eaten or sheet not loaded

        // Calculate current animation frame (simple alternating)
        this.animationFrame = Math.floor(Date.now() / 200) % this.frameCount;

        // Determine spritesheet row and column based on mode and direction
        let spriteRow = this.spriteSheetRow;
        let frameX = this.animationFrame; // Base frame (0 or 1)
        
        if (this.isEaten) {
            // Eyes only when eaten (using shared eyes sprites)
            spriteRow = 4; // Assuming eye sprites are on row 4
            frameX += 8; // Assuming eyes start at column 8
        } else if (this.isFrightened) {
            // Frightened sprites
            spriteRow = 4; // Frightened sprites row
            if (this.frightenedTimer <= this.flashingThreshold) {
                // White flashing (alternating between blue and white)
                frameX = this.animationFrame + (Math.floor(Date.now() / 300) % 2) * 2;
            } else {
                // Blue frightened (no flashing yet)
                frameX = this.animationFrame;
            }
        } else {
            // Normal ghost sprites - determine column based on direction
            switch (this.direction) {
                case 'right': frameX += 0; break; // Sprites 0, 1
                case 'left': frameX += 2; break;  // Sprites 2, 3
                case 'up': frameX += 4; break;    // Sprites 4, 5
                case 'down': frameX += 6; break;  // Sprites 6, 7
                default: frameX += 0; // Default to right-facing
            }
        }

        const sx = frameX * this.spriteSize;
        const sy = spriteRow * this.spriteSize;

        ctx.drawImage(
            ghostSpritesheet,
            sx, sy, this.spriteSize, this.spriteSize, // Source rect
            this.x, this.y, this.tileSize, this.tileSize // Destination rect
        );
        
        // Debug: Draw target and path
        if (window.debugMode) {
            // Draw target indicator
            ctx.fillStyle = this.#getGhostColor();
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(
                this.targetX * this.tileSize + this.tileSize / 2, 
                this.targetY * this.tileSize + this.tileSize / 2, 
                this.tileSize / 4, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            
            // Draw the current path if available
            if (this.cachedPath && this.cachedPath.length > 0) {
                ctx.strokeStyle = this.#getGhostColor();
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                // Start from the ghost's current position
                ctx.moveTo(
                    this.x + this.tileSize / 2,
                    this.y + this.tileSize / 2
                );
                
                // Draw line to each waypoint
                for (const waypoint of this.cachedPath) {
                    ctx.lineTo(
                        waypoint.x * this.tileSize + this.tileSize / 2,
                        waypoint.y * this.tileSize + this.tileSize / 2
                    );
                }
                
                ctx.stroke();
            }
            
            ctx.globalAlpha = 1.0;
        }
    }

    update(map, pacman) {
        // Only move if visible
        if (!this.isVisible) return;
        
        // Update mode timers
        this.#updateModeTimers();
        
        // Handle ghost house exit timing
        if (this.inHouse) {
            this.houseExitTimer += 1000 / 60; // Increment timer (assuming ~60fps)
            if (this.houseExitTimer >= this.houseExitTime) {
                this.inHouse = false;
                // Position slightly above the ghost house door
                const door = this.#findGhostDoor(map);
                if (door) {
                    // Position ghost just above the door
                    this.x = door.x * this.tileSize;
                    this.y = (door.y - 1) * this.tileSize;
                    this.direction = 'left'; // Default exit direction
                    
                    // Make sure the position is valid and not inside a wall
                    if (this.#isCollision(this.x, this.y, map)) {
                        // Try alternative positions if the default one is blocked
                        const positions = [
                            { x: door.x * this.tileSize, y: door.y * this.tileSize, dir: 'up' },
                            { x: (door.x - 1) * this.tileSize, y: door.y * this.tileSize, dir: 'left' },
                            { x: (door.x + 1) * this.tileSize, y: door.y * this.tileSize, dir: 'right' }
                        ];
                        
                        for (const pos of positions) {
                            if (!this.#isCollision(pos.x, pos.y, map)) {
                                this.x = pos.x;
                                this.y = pos.y;
                                this.direction = pos.dir;
                                break;
                            }
                        }
                    }
                    
                    console.log(`Ghost ${this.ghostType} exiting house at (${this.x/this.tileSize}, ${this.y/this.tileSize})`);
                } else {
                    // Fallback if no door found
                    this.inHouse = false;
                    // Try to find a safe position in the middle of the map
                    this.x = Math.floor(map[0].length / 2) * this.tileSize;
                    this.y = Math.floor(map.length / 2) * this.tileSize;
                    this.direction = 'left';
                }
            } else {
                // Simple up/down movement while in house
                if (Math.floor(Date.now() / 500) % 2 === 0) {
                    this.y += 0.5; // Move slightly down
                } else {
                    this.y -= 0.5; // Move slightly up
                }
                return; // Skip normal movement while in house
            }
        }
        
        // Calculate target tile based on current mode
        this.#calculateTarget(map, pacman);
        
        // Check if ghost is at an intersection or aligned with the grid
        const isAlignedX = Math.abs(this.x % this.tileSize) < 0.1;
        const isAlignedY = Math.abs(this.y % this.tileSize) < 0.1;
        
        // If almost aligned, snap to grid precisely to avoid floating point issues
        if (isAlignedX) {
            this.x = Math.round(this.x / this.tileSize) * this.tileSize;
        }
        if (isAlignedY) {
            this.y = Math.round(this.y / this.tileSize) * this.tileSize;
        }
        
        // Only make decisions at tile intersections (when perfectly aligned)
        const needsNewDirection = !this.direction || 
                                 (this.direction && this.#isCollision(
                                    this.x + (this.direction === 'right' ? this.speed : (this.direction === 'left' ? -this.speed : 0)),
                                    this.y + (this.direction === 'down' ? this.speed : (this.direction === 'up' ? -this.speed : 0)),
                                    map));
        
        if ((isAlignedX && isAlignedY) || needsNewDirection) {
            if (this.isFrightened && !this.isEaten) {
                // In frightened mode, use random movement as before
                const availableDirections = this.#getAvailableDirections(map);
                if (availableDirections.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableDirections.length);
                    this.direction = availableDirections[randomIndex];
                }
            } else {
                // In chase/scatter/eaten mode, use A* pathfinding
                const nextDirection = this.#getNextDirectionFromPath(map);
                
                if (nextDirection) {
                    this.direction = nextDirection;
                } else {
                    // Fallback if A* fails: Stop movement temporarily, path will be recalculated
                    console.warn(`Ghost ${this.ghostType} could not find A* path to (${this.targetX},${this.targetY}). Stopping momentarily.`);
                    this.direction = null;
                }
            }
        }

        // Move in the current direction
        let nextX = this.x;
        let nextY = this.y;
        
        // Set different speeds based on mode
        let currentSpeed = this.speed;
        if (this.isFrightened && !this.isEaten) {
            currentSpeed = this.speed * 0.5; // Slower when frightened
        } else if (this.isEaten) {
            currentSpeed = this.speed * 1.5; // Faster when eaten (eyes only)
        }
        
        switch (this.direction) {
            case 'up': nextY -= currentSpeed; break;
            case 'down': nextY += currentSpeed; break;
            case 'left': nextX -= currentSpeed; break;
            case 'right': nextX += currentSpeed; break;
        }
        
        // Check for collision before moving
        if (!this.#isCollision(nextX, nextY, map)) {
            this.x = nextX;
            this.y = nextY;
        } else {
            // If colliding, align to grid and recalculate at next update
            if (isAlignedX && isAlignedY) {
                // Already aligned, but hit a wall, don't move
                // Force a direction change on the next update
                this.direction = null;
            } else {
                // Partially moved, snap back to grid alignment
                if (this.direction === 'up' || this.direction === 'down') {
                    this.y = Math.round(this.y / this.tileSize) * this.tileSize;
                } else if (this.direction === 'left' || this.direction === 'right') {
                    this.x = Math.round(this.x / this.tileSize) * this.tileSize;
                }
            }
        }
        
        // Handle map wrapping (tunnels)
        const mapPixelWidth = map[0].length * this.tileSize;
        if (this.x < -this.tileSize) { 
            this.x = mapPixelWidth - this.tileSize;
        } else if (this.x >= mapPixelWidth) {
            this.x = 0;
        }
        
        // Check if eaten ghost has reached the ghost house
        if (this.isEaten) {
            const ghostHouseEntrance = this.#findGhostHouseEntrance(map);
            if (ghostHouseEntrance) {
                const currentTileX = Math.floor((this.x + this.tileSize / 2) / this.tileSize);
                const currentTileY = Math.floor((this.y + this.tileSize / 2) / this.tileSize);
                
                // Check if ghost is close to the entrance (within 1 tile)
                const distanceToEntrance = this.#calculateDistance(
                    currentTileX, currentTileY, 
                    ghostHouseEntrance.x, ghostHouseEntrance.y
                );
                
                if (distanceToEntrance < 1.5) {
                    // Reset ghost state when reaching the house
                    this.isEaten = false;
                    this.inHouse = true;
                    this.houseExitTimer = 0;
                    
                    // Ensure ghost is positioned at the entrance
                    this.x = ghostHouseEntrance.x * this.tileSize;
                    this.y = ghostHouseEntrance.y * this.tileSize;
                    
                    // Restore previous mode
                    this.changeMode(this.previousMode);
                    console.log(`Ghost ${this.ghostType} returned to house`);
                }
            }
        }
        
        // Check for collision with PacMan
        this.checkCollision(pacman);
    }
    
    // Update mode timers and switch between scatter and chase
    #updateModeTimers() {
        // Skip if in frightened mode
        if (this.isFrightened) {
            this.frightenedTimer -= 1000 / 60; // Decrement timer
            if (this.frightenedTimer <= 0) {
                // End frightened mode
                this.isFrightened = false;
                // Restore previous mode
                this.changeMode(this.previousMode);
            }
            return;
        }
        
        // Skip if eaten
        if (this.isEaten) return;
        
        // Update mode timer
        this.modeTimer += 1000 / 60; // Increment timer (assuming ~60fps)
        
        // Toggle between scatter and chase modes
        if (this.mode === 'scatter' && this.modeTimer >= this.scatterDuration) {
            this.changeMode('chase');
            this.modeTimer = 0;
        } else if (this.mode === 'chase' && this.modeTimer >= this.chaseDuration) {
            this.changeMode('scatter');
            this.modeTimer = 0;
        }
    }
    
    // Find the ghost house door position
    #findGhostDoor(map) {
        // Look for the ghost door tile
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] === TILE_GHOST_DOOR) {
                    return { x: x, y: y };
                }
            }
        }
        return null;
    }
    
    // Find the ghost house entrance position
    #findGhostHouseEntrance(map) {
        // Find the ghost door
        const door = this.#findGhostDoor(map);
        if (!door) return null;
        
        // Return the position above the door as the entrance
        return { x: door.x, y: door.y - 1 };
    }
    
    // Calculate target tile based on current mode and ghost type
    #calculateTarget(map, pacman) {
        if (this.isEaten) {
            // When eaten, target the ghost house entrance
            const entrance = this.#findGhostHouseEntrance(map);
            if (entrance) {
                this.targetX = entrance.x;
                this.targetY = entrance.y;
            }
            return;
        }
        
        if (this.isFrightened) {
            // No specific target in frightened mode (random movement)
            return;
        }
        
        if (this.mode === 'scatter') {
            // In scatter mode, target the assigned corner
            this.targetX = this.scatterTarget.x;
            this.targetY = this.scatterTarget.y;
            return;
        }
        
        // In chase mode, calculate target based on ghost type
        if (!pacman) return; // Safety check
        
        // Convert Pac-Man's position to grid coordinates
        const pacmanGridX = Math.floor((pacman.x + pacman.radius) / this.tileSize);
        const pacmanGridY = Math.floor((pacman.y + pacman.radius) / this.tileSize);
        
        switch (this.ghostType) {
            case 'blinky': // Red - Directly targets Pac-Man
                this.targetX = pacmanGridX;
                this.targetY = pacmanGridY;
                break;
                
            case 'pinky': // Pink - Targets 4 tiles ahead of Pac-Man
                let offsetX = 0, offsetY = 0;
                
                // Calculate 4 tiles ahead based on Pac-Man's direction
                switch (pacman.direction) {
                    case 'up':
                        offsetX = -4; // Original Pac-Man game bug: "up" also shifts left by 4
                        offsetY = -4;
                        break;
                    case 'down':
                        offsetY = 4;
                        break;
                    case 'left':
                        offsetX = -4;
                        break;
                    case 'right':
                        offsetX = 4;
                        break;
                }
                
                this.targetX = pacmanGridX + offsetX;
                this.targetY = pacmanGridY + offsetY;
                break;
                
            case 'inky': // Cyan - Complex targeting using Blinky as reference
                // Find Blinky's position
                let blinkyX = this.targetX; // Default if Blinky not found
                let blinkyY = this.targetY;
                
                const blinky = this.#findGhost('blinky', map);
                if (blinky) {
                    blinkyX = Math.floor(blinky.x / this.tileSize);
                    blinkyY = Math.floor(blinky.y / this.tileSize);
                }
                
                // Get 2 tiles ahead of Pac-Man
                let pivotX = pacmanGridX;
                let pivotY = pacmanGridY;
                
                switch (pacman.direction) {
                    case 'up':
                        pivotX -= 2; // Same Pac-Man bug
                        pivotY -= 2;
                        break;
                    case 'down':
                        pivotY += 2;
                        break;
                    case 'left':
                        pivotX -= 2;
                        break;
                    case 'right':
                        pivotX += 2;
                        break;
                }
                
                // Double the vector from Blinky to the pivot point
                this.targetX = pivotX + (pivotX - blinkyX);
                this.targetY = pivotY + (pivotY - blinkyY);
                break;
                
            case 'clyde': // Orange - Targets Pac-Man when far, runs away when close
                const distanceToPacman = this.#calculateDistance(
                    Math.floor(this.x / this.tileSize),
                    Math.floor(this.y / this.tileSize),
                    pacmanGridX,
                    pacmanGridY
                );
                
                if (distanceToPacman > 8) {
                    // More than 8 tiles away: target Pac-Man directly
                    this.targetX = pacmanGridX;
                    this.targetY = pacmanGridY;
                } else {
                    // Within 8 tiles: target scatter position
                    this.targetX = this.scatterTarget.x;
                    this.targetY = this.scatterTarget.y;
                }
                break;
        }
    }
    
    // Find a specific ghost in the game
    #findGhost(ghostType, map) {
        // This would be better implemented at the game level
        // For now, a simple implementation that assumes ghosts are global
        if (window.ghosts) {
            return window.ghosts.find(ghost => ghost.ghostType === ghostType);
        }
        return null;
    }
    
    // Helper method to calculate the distance between two points
    #calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    // Get ghost color based on type
    #getGhostColor() {
        switch(this.ghostType) {
            case 'blinky': return '#FF0000'; // Red
            case 'pinky': return '#FFC0CB';  // Pink
            case 'inky': return '#00FFFF';   // Cyan
            case 'clyde': return '#FFA500';  // Orange
            default: return '#FFFFFF';       // Default white
        }
    }

    // Add this new helper method within the Ghost class
    #isTileWalkable(gridX, gridY, map) {
        const mapWidth = map[0].length;
        const mapHeight = map.length;

        // 1. Check bounds (already handled tunnel wrapping before calling this usually)
        if (gridX < 0 || gridX >= mapWidth || gridY < 0 || gridY >= mapHeight) {
            return false; 
        }

        // 2. Check map tile content
        if (!map[gridY]) return false; // Row doesn't exist
        const tile = map[gridY][gridX];
        
        if (tile === TILE_WALL) {
            return false;
        }
        
        // Impassable door condition
        if (tile === TILE_GHOST_DOOR && !this.isEaten) {
            return false;
        }
        
        // Tile is walkable
        return true;
    }

    // Refactor #findPathToTarget to use the helper
    #findPathToTarget(map) {
        // Only calculate path if we have a valid target
        if (this.targetX === undefined || this.targetY === undefined) return null;
        
        // Get current position in grid coordinates
        const startX = Math.floor(this.x / this.tileSize);
        const startY = Math.floor(this.y / this.tileSize);
        
        // If target is same as current position, no need for pathfinding
        if (startX === this.targetX && startY === this.targetY) return null;
        
        // Initialize the open and closed sets
        const openSet = [];
        const closedSet = new Set();
        
        // Add starting point to open set
        openSet.push({
            x: startX,
            y: startY,
            g: 0, // Cost from start to current node
            h: this.#calculateDistance(startX, startY, this.targetX, this.targetY), // Heuristic
            f: this.#calculateDistance(startX, startY, this.targetX, this.targetY), // f = g + h
            parent: null
        });
        
        const maxIterations = 100;
        let iterations = 0;
        const mapWidth = map[0].length;
        const mapHeight = map.length;
        
        while (openSet.length > 0 && iterations < maxIterations) {
            iterations++;
            
            // Find node with lowest f value (simplistic approach, heap is better for performance)
            let currentIndex = 0;
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < openSet[currentIndex].f) {
                    currentIndex = i;
                }
            }
            const current = openSet[currentIndex];
            
            // If we reached the target, reconstruct and return the path
            if (current.x === this.targetX && current.y === this.targetY) {
                const path = [];
                let currentNode = current;
                while (currentNode.parent) {
                    path.unshift({ x: currentNode.x, y: currentNode.y });
                    currentNode = currentNode.parent;
                }
                return path;
            }
            
            openSet.splice(currentIndex, 1);
            closedSet.add(`${current.x},${current.y}`);
            
            const neighborsToCheck = [
                { dx: 0, dy: -1, dir: 'up' },
                { dx: 1, dy: 0, dir: 'right' },
                { dx: 0, dy: 1, dir: 'down' },
                { dx: -1, dy: 0, dir: 'left' }
            ];
            
            for (const move of neighborsToCheck) {
                let neighborX = current.x + move.dx;
                let neighborY = current.y + move.dy;
                
                // Handle Tunnel Wrapping
                if (neighborX < 0) neighborX = mapWidth - 1;
                else if (neighborX >= mapWidth) neighborX = 0;
                
                // Check if already evaluated
                if (closedSet.has(`${neighborX},${neighborY}`)) {
                    continue;
                }
                
                // Use the new helper function to check walkability
                if (!this.#isTileWalkable(neighborX, neighborY, map)) {
                    continue;
                }
                
                // Process Valid Neighbor
                this.#processNeighbor(openSet, current, closedSet, neighborX, neighborY, move.dir);
            }
        }
        
        // If iterations exceeded or no path found, return the best partial path found
        if (openSet.length > 0) {
            let bestNode = openSet[0];
            for (let i = 1; i < openSet.length; i++) {
                 // Find node closest to the target (lowest heuristic)
                if (openSet[i].h < bestNode.h) {
                    bestNode = openSet[i];
                }
            }
            
            const path = [];
            let currentNode = bestNode;
            while (currentNode.parent) {
                path.unshift({ x: currentNode.x, y: currentNode.y });
                currentNode = currentNode.parent;
            }
            
            if (path.length > 0) {
                return path;
            }
        }
        
        // No path found
        return null;
    }

    // Helper method to process a neighbor in A*
    #processNeighbor(openSet, current, closedSet, neighborX, neighborY, direction) {
        // Calculate new g score
        const tentativeG = current.g + 1;
        
        // Get key for this neighbor
        const neighborKey = `${neighborX},${neighborY}`;
        
        // Skip if in closed set
        if (closedSet.has(neighborKey)) {
            return;
        }
        
        // Find if neighbor is already in open set
        let neighborNode = openSet.find(node => node.x === neighborX && node.y === neighborY);
        
        if (!neighborNode) {
            // If not in open set, add it
            neighborNode = {
                x: neighborX,
                y: neighborY,
                g: tentativeG,
                h: this.#calculateDistance(neighborX, neighborY, this.targetX, this.targetY),
                f: tentativeG + this.#calculateDistance(neighborX, neighborY, this.targetX, this.targetY),
                parent: current,
                direction: direction
            };
            openSet.push(neighborNode);
        } else if (tentativeG < neighborNode.g) {
            // If already in open set but this path is better, update it
            neighborNode.g = tentativeG;
            neighborNode.f = tentativeG + neighborNode.h;
            neighborNode.parent = current;
            neighborNode.direction = direction;
        }
    }

    // Get the next direction based on A* pathfinding
    #getNextDirectionFromPath(map) {
        // Update the path periodically or when target changes
        const targetKey = `${this.targetX},${this.targetY}`;
        const currentX = Math.floor(this.x / this.tileSize);
        const currentY = Math.floor(this.y / this.tileSize);
        const shouldUpdatePath = 
            !this.cachedPath || 
            this.cachedTarget !== targetKey || 
            this.pathUpdateTimer <= 0 ||
            this.cachedPath.length === 0;
        
        if (shouldUpdatePath) {
            // Compute new path
            this.cachedPath = this.#findPathToTarget(map);
            this.cachedTarget = targetKey;
            this.pathUpdateTimer = this.pathUpdateInterval;
            
            // Debug logging
            if (window.debugMode) {
                console.log(`Ghost ${this.ghostType} calculated new path to (${this.targetX},${this.targetY}), path length: ${this.cachedPath ? this.cachedPath.length : 'null'}`);
            }
        } else {
            // Decrement timer
            this.pathUpdateTimer -= 1000 / 60; // Assuming 60fps
            
            // Update path if the ghost has reached a waypoint
            if (this.cachedPath && this.cachedPath.length > 0) {
                const nextStep = this.cachedPath[0];
                if (currentX === nextStep.x && currentY === nextStep.y) {
                    // We've reached this step, remove it
                    this.cachedPath.shift();
                }
            }
        }
        
        // If we have a valid cached path, use it
        if (this.cachedPath && this.cachedPath.length > 0) {
            const nextStep = this.cachedPath[0];
            
            // Determine direction to next step
            if (nextStep.x > currentX) return 'right';
            if (nextStep.x < currentX) return 'left';
            if (nextStep.y > currentY) return 'down';
            if (nextStep.y < currentY) return 'up';
        }
        
        // No path found or we've reached the end of the path
        return null;
    }

    // Refactor #isCollision for simpler and more direct walkability check
    #isCollision(x, y, map) {
        // Use a smaller hitbox for collision detection
        const collisionMargin = this.tileSize * 0.3;
        const corners = [
            { dx: collisionMargin, dy: collisionMargin }, // Top-left
            { dx: this.tileSize - collisionMargin, dy: collisionMargin }, // Top-right
            { dx: collisionMargin, dy: this.tileSize - collisionMargin }, // Bottom-left
            { dx: this.tileSize - collisionMargin, dy: this.tileSize - collisionMargin } // Bottom-right
        ];

        for (const corner of corners) {
            const cornerX = x + corner.dx;
            const cornerY = y + corner.dy;
            const cornerGridX = Math.floor(cornerX / this.tileSize);
            const cornerGridY = Math.floor(cornerY / this.tileSize);

            // If any corner lands on a tile that is not walkable according to our helper,
            // it's a collision.
            if (!this.#isTileWalkable(cornerGridX, cornerGridY, map)) {
                return true; // Collision detected
            }
        }

        // Also check the center point for robustness, although corners should cover it
        const centerX = x + this.tileSize / 2;
        const centerY = y + this.tileSize / 2;
        const centerGridX = Math.floor(centerX / this.tileSize);
        const centerGridY = Math.floor(centerY / this.tileSize);
        if (!this.#isTileWalkable(centerGridX, centerGridY, map)) {
            return true; 
        }

        return false; // No collision detected
    }

    // Helper method to find available directions
    #getAvailableDirections(map) {
        const availableDirections = [];
        const directions = ['up', 'down', 'left', 'right'];
        const opposites = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' };
        
        // Keep track of the opposite direction for potential fallback
        const oppositeDirection = this.direction ? opposites[this.direction] : null;

        for (const dir of directions) {
            // Ghosts cannot reverse direction (except in frightened mode or when stuck)
            if (!this.isFrightened && dir === oppositeDirection) {
                continue;
            }

            let testX = this.x;
            let testY = this.y;

            // Check a bit further in the direction to avoid getting stuck at edges
            const checkDistance = Math.max(this.speed, 1);
            
            switch (dir) {
                case 'up':    testY -= checkDistance; break;
                case 'down':  testY += checkDistance; break;
                case 'left':  testX -= checkDistance; break;
                case 'right': testX += checkDistance; break;
            }
            
            if (!this.#isCollision(testX, testY, map)) {
                availableDirections.push(dir);
            }
        }
        
        // If no directions are available (ghost is stuck), allow reversing as a last resort
        if (availableDirections.length === 0 && oppositeDirection) {
            let testX = this.x;
            let testY = this.y;
            
            switch (oppositeDirection) {
                case 'up':    testY -= this.speed; break;
                case 'down':  testY += this.speed; break;
                case 'left':  testX -= this.speed; break;
                case 'right': testX += this.speed; break;
            }
            
            if (!this.#isCollision(testX, testY, map)) {
                availableDirections.push(oppositeDirection);
                console.log(`Ghost ${this.ghostType} was stuck, reversing direction to ${oppositeDirection}`);
            } else {
                // Last resort: try all directions again with a larger check distance
                for (const dir of directions) {
                    let farX = this.x;
                    let farY = this.y;
                    
                    switch (dir) {
                        case 'up':    farY -= this.tileSize; break;
                        case 'down':  farY += this.tileSize; break;
                        case 'left':  farX -= this.tileSize; break;
                        case 'right': farX += this.tileSize; break;
                    }
                    
                    if (!this.#isCollision(farX, farY, map) && !availableDirections.includes(dir)) {
                        availableDirections.push(dir);
                        console.log(`Ghost ${this.ghostType} using fallback direction: ${dir}`);
                    }
                }
            }
        }
        
        return availableDirections;
    }

    // Check collision with PacMan
    checkCollision(pacman) {
        if (!pacman || !this.isVisible || this.inHouse) return false;
        
        // Simple collision check based on distance between centers
        const ghostCenterX = this.x + this.tileSize / 2;
        const ghostCenterY = this.y + this.tileSize / 2;
        const pacmanCenterX = pacman.x + pacman.radius;
        const pacmanCenterY = pacman.y + pacman.radius;
        
        const distance = Math.sqrt(
            Math.pow(ghostCenterX - pacmanCenterX, 2) + 
            Math.pow(ghostCenterY - pacmanCenterY, 2)
        );
        
        // If centers are close enough, count as collision
        if (distance < (this.tileSize / 2 + pacman.radius) * 0.8) {
            // Handle collision based on ghost state
            if (this.isFrightened && !this.isEaten) {
                // Pac-Man eats ghost
                this.isEaten = true;
                this.isFrightened = false;
                // Call game's ghost eaten function if available
                if (window.ghostEaten) {
                    window.ghostEaten(this);
                }
                return true;
            } else if (!this.isEaten) {
                // Ghost eats Pac-Man
                // Call game's pacman eaten function if available
                if (window.pacmanEaten) {
                    window.pacmanEaten();
                }
                return true;
            }
        }
        
        return false;
    }

    // Change ghost mode
    changeMode(newMode) {
        // If we're in frightened mode, just store the new mode for later
        if (this.isFrightened && newMode !== 'frightened') {
            this.previousMode = newMode;
            return;
        }
        
        if (newMode === 'frightened') {
            // Store previous mode for when frightened ends
            this.previousMode = this.mode;
            this.isFrightened = true;
            
            // Reverse direction when becoming frightened
            this.reverseDirection();
            
            // Invalidate cached path
            this.cachedPath = null;
        } else {
            // When changing between scatter/chase, reverse direction
            if ((this.mode === 'scatter' && newMode === 'chase') || 
                (this.mode === 'chase' && newMode === 'scatter')) {
                this.reverseDirection();
                
                // Invalidate cached path
                this.cachedPath = null;
            }
            
            this.mode = newMode;
            this.isFrightened = false;
        }
    }
    
    // Reverse the current direction
    reverseDirection() {
        const opposites = { 
            'up': 'down', 
            'down': 'up', 
            'left': 'right', 
            'right': 'left' 
        };
        
        if (this.direction && opposites[this.direction]) {
            this.direction = opposites[this.direction];
        }
    }

    // Set frightened mode
    setFrightened(duration = 8000) {
        this.changeMode('frightened');
        this.frightenedTimer = duration;
    }
    
    // Reset ghost to initial position
    resetPosition(x, y, initialDirection = 'left') {
        this.x = x;
        this.y = y;
        this.direction = initialDirection;
        this.isEaten = false;
        this.isFrightened = false;
        this.inHouse = this.ghostType !== 'blinky';
        this.houseExitTimer = 0;
        this.mode = 'scatter';
        this.modeTimer = 0;
    }
}
