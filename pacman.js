class PacMan {
    constructor(x, y, tileSize, speed) {
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
        this.speed = speed;
        this.requestedDirection = null;
        this.direction = null; // Can be 'up', 'down', 'left', 'right' or null
        this.radius = tileSize / 2; // Example size
    }

    // Placeholder draw method - assumes a canvas context 'ctx' is passed
    draw(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        // Optional: Draw direction indicator
        ctx.fillStyle = 'black';
        let eyeX = this.x + this.radius;
        let eyeY = this.y + this.radius * 0.6;
         if (this.direction === 'left') eyeX -= this.radius * 0.4;
         if (this.direction === 'right') eyeX += this.radius * 0.4;
         if (this.direction === 'up') eyeY -= this.radius * 0.4;
         if (this.direction === 'down') eyeY += this.radius * 0.4;

        ctx.beginPath();
        ctx.arc(eyeX, eyeY, this.radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    // Method to handle direction changes requested by input
    changeDirection(direction) {
         // Basic validation: only accept valid directions
         if (['up', 'down', 'left', 'right'].includes(direction)) {
            // Store the requested direction. We might not change immediately
            // if moving into a wall (collision detection needed later).
            this.requestedDirection = direction;
            // For now, change direction immediately for simplicity
            this.direction = direction;
         }
    }

    // Update PacMan's position based on current direction and speed
    update() {
        // Later: Add collision detection before moving

        switch (this.direction) {
            case 'up':
                this.y -= this.speed;
                break;
            case 'down':
                this.y += this.speed;
                break;
            case 'left':
                this.x -= this.speed;
                break;
            case 'right':
                this.x += this.speed;
                break;
        }

        // Basic boundary check (replace with proper map collision later)
        // Assuming a canvas size needs to be defined somewhere (e.g., 448x496 typical)
        // These values are placeholders
        const mapWidth = 448;
        const mapHeight = 496;
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x + this.tileSize > mapWidth) this.x = mapWidth - this.tileSize;
        if (this.y + this.tileSize > mapHeight) this.y = mapHeight - this.tileSize;
    }
}
