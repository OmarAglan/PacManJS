class PacMan {
    constructor(x, y, tileSize, speed) {
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
        this.speed = speed;
        this.requestedDirection = null;
        this.direction = null; // Can be 'up', 'down', 'left', 'right'
        this.radius = tileSize / 2;
        this.currentFrame = 0; // For animation later
        this.frameCount = 7; // Example frame count for animation
        this.score = 0; // Add score property to PacMan
        this.powerPelletActive = false;
        this.powerPelletTimer = 0;
        this.powerPelletDuration = 5000; // Duration in milliseconds (10 seconds)
    }

    // Placeholder draw method - assumes a canvas context 'ctx' is passed
    draw(ctx) {
        let fillColor = 'yellow'; // Default color
        const powerFlashThreshold = 3000; // Flash for the last 3 seconds

        if (this.powerPelletActive) {
             // Check if timer is low for flashing effect
             if (this.powerPelletTimer <= powerFlashThreshold && this.powerPelletTimer > 0) {
                 // Flash rapidly between yellow and green (example)
                 // Change color every 200ms (adjust timing as needed)
                 if (Math.floor(Date.now() / 200) % 2 === 0) {
                     fillColor = 'yellow';
                 } else {
                     fillColor = 'lime'; // Power pellet active color
                 }
             } else {
                 // Power pellet active, but not flashing yet
                 fillColor = 'lime'; // Use power pellet active color
             }
        }

        ctx.fillStyle = fillColor; // Set the determined fill color
        ctx.beginPath();
        // Basic animation: open/close mouth based on direction (placeholder)
        let angle1 = 0.25 * Math.PI;
        let angle2 = 1.75 * Math.PI;
        if (this.direction) {
            // Basic open/close mouth effect - needs refinement
            if (Math.floor(Date.now() / 100) % 2 === 0) { // Simple timer
                angle1 = 0;
                angle2 = 2 * Math.PI;
            }
        }

        // Rotate arc based on direction
        if (this.direction === 'up') {
             angle1 -= Math.PI / 2;
             angle2 -= Math.PI / 2;
        } else if (this.direction === 'down') {
             angle1 += Math.PI / 2;
             angle2 += Math.PI / 2;
        } else if (this.direction === 'left') {
             angle1 += Math.PI;
             angle2 += Math.PI;
        }

        ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, angle1, angle2);
        ctx.lineTo(this.x + this.radius, this.y + this.radius); // Fill center for pacman shape
        ctx.fill();
        ctx.closePath();

        // Eyes removed for simplicity with mouth animation for now
    }

    // Method to handle direction changes requested by input
    changeDirection(newDirection, map) {
         if (['up', 'down', 'left', 'right'].includes(newDirection)) {
             // Check if the new direction is immediately valid (no wall)
             if (!this.#isCollisionInDirection(newDirection, map)) {
                 this.requestedDirection = newDirection;
             } else {
                // If the requested direction hits a wall immediately,
                // still store it, but don't change current direction yet.
                // The update loop will handle trying to turn later.
                this.requestedDirection = newDirection;
             }
         }
    }

    // Update PacMan's position based on current direction and speed
    update(map) {
        // --- Power Pellet Timer --- 
        if (this.powerPelletActive) {
             this.powerPelletTimer -= 1000 / 60; // Assuming 60 FPS roughly
             if (this.powerPelletTimer <= 0) {
                 this.powerPelletActive = false;
                 // Later: Tell ghosts to stop being frightened
             }
        }

        // Try to change to the requested direction if it's valid now
        if (this.requestedDirection && !this.#isCollisionInDirection(this.requestedDirection, map)) {
             this.direction = this.requestedDirection;
             this.requestedDirection = null; // Reset request once fulfilled
        }

        // Calculate potential next position based on current direction
        let nextX = this.x;
        let nextY = this.y;

        switch (this.direction) {
            case 'up':
                nextY -= this.speed;
                break;
            case 'down':
                nextY += this.speed;
                break;
            case 'left':
                nextX -= this.speed;
                break;
            case 'right':
                nextX += this.speed;
                break;
        }

        // Check for collision at the potential next position
        if (!this.#isCollision(nextX, nextY, map)) {
            this.x = nextX;
            this.y = nextY;
        } else {
             // If moving in the current direction causes collision, stop.
             // Align to grid if partially moved into a wall space
             // This helps smooth out movement against walls
             if (this.direction === 'up' || this.direction === 'down') {
                 this.y = Math.round(this.y / this.tileSize) * this.tileSize;
             } else if (this.direction === 'left' || this.direction === 'right') {
                 this.x = Math.round(this.x / this.tileSize) * this.tileSize;
             }
             // Don't clear this.direction here, allow trying requestedDirection next frame
        }

        // --- Pellet Eating Logic --- 
        const currentGridX = Math.floor((this.x + this.radius) / this.tileSize);
        const currentGridY = Math.floor((this.y + this.radius) / this.tileSize);

        if (currentGridX >= 0 && currentGridX < map[0].length &&
            currentGridY >= 0 && currentGridY < map.length) {

            const tileValue = map[currentGridY][currentGridX];

            if (tileValue === 2) { // 2 = Pellet
                map[currentGridY][currentGridX] = 0; 
                this.score += 10; 
            } else if (tileValue === 3) { // 3 = Power Pellet
                 map[currentGridY][currentGridX] = 0; 
                 this.score += 50; 
                 this.activatePowerPellet();
                 // Later: Tell ghosts to become frightened
            }
             // Later: Add logic for eating fruit
        }

        // Handle map boundaries (wrapping or stopping)
        // Example: Simple wrapping for left/right edges
        const mapPixelWidth = map[0].length * this.tileSize;
        if (this.x < -this.tileSize) { // Went off left edge
            this.x = mapPixelWidth - this.tileSize;
        } else if (this.x >= mapPixelWidth) { // Went off right edge
             this.x = 0;
        }

        // Stop at top/bottom boundaries (can be adjusted)
         const mapPixelHeight = map.length * this.tileSize;
        if (this.y < 0) this.y = 0;
        if (this.y + this.tileSize > mapPixelHeight) this.y = mapPixelHeight - this.tileSize;
    }

    // Private helper to check collision in a specific direction from current pos
    #isCollisionInDirection(direction, map) {
        let testX = this.x;
        let testY = this.y;
        // Check one pixel ahead in the direction
        switch (direction) {
            case 'up': testY -= 1; break;
            case 'down': testY += 1; break;
            case 'left': testX -= 1; break;
            case 'right': testX += 1; break;
        }
        return this.#isCollision(testX, testY, map);
    }

    // Private helper method for collision detection
    #isCollision(x, y, map) {
        // Check all four corners of Pac-Man's bounding box
        const corners = [
            { x: x, y: y },                                  // Top-left
            { x: x + this.tileSize - 1, y: y },               // Top-right
            { x: x, y: y + this.tileSize - 1 },               // Bottom-left
            { x: x + this.tileSize - 1, y: y + this.tileSize - 1 } // Bottom-right
        ];

        for (const corner of corners) {
            // Convert corner pixel coordinates to map grid indices
            const gridX = Math.floor(corner.x / this.tileSize);
            const gridY = Math.floor(corner.y / this.tileSize);

            // Check if the grid indices are within the map bounds
            if (gridX < 0 || gridX >= map[0].length || gridY < 0 || gridY >= map.length) {
                 // Optional: Treat going out of bounds as collision, depending on desired behavior
                 // For wrapping tunnels, specific logic is needed here or in update()
                 continue; // Skip check if out of bounds (handled by wrapping/boundary logic)
            }

            // Check if the map tile at this corner is a wall (value 1)
            if (map[gridY][gridX] === 1) {
                return true; // Collision detected
            }
        }

        return false; // No collision detected
    }

    // Method to get current score
    getScore() {
        return this.score;
    }

    // Method to activate the power pellet effect
    activatePowerPellet() {
         this.powerPelletActive = true;
         this.powerPelletTimer = this.powerPelletDuration;
         // console.log("Power Pellet ACTIVE!"); // Optional log
    }

     // Method to check if power pellet is active
     isPowerPelletActive() {
         return this.powerPelletActive;
     }
}
