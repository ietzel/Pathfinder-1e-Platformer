const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const BLOCK_SIZE = 32; // Corresponds to 1/2 a meter per block (16m x 25m)
const MAP_WIDTH = canvas.width / BLOCK_SIZE;
const MAP_HEIGHT = canvas.height / BLOCK_SIZE;
const MAP = [];
const PLAYER_SPEED = 2;

// Track the state of pressed keys
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// Player object
const player = {
    x: 10 * BLOCK_SIZE,
    y: 10 * BLOCK_SIZE,
    radius: BLOCK_SIZE / 2
};

// 1. Generate a 1D heightmap with smooth noise function
function generateHeightmap(width, height) {
    const heightmap = [];
    let currentHeight = height / 2; // Start in the middle
    let noiseFactor = 0.5;
    for (let x = 0; x < width; x++) {
        currentHeight += (Math.random() - 0.5) * 4 * noiseFactor; // Add random variation
        currentHeight = Math.max(height * 0.2, Math.min(height * 0.8, currentHeight)); // Clamp height
        heightmap.push(Math.floor(currentHeight));
    }
    return heightmap;
}

// 2. Carve tunnels through the map
function carveTunnels(map, startX, startY, length, maxTurns) {
    let x = startX;
    let y = startY;
    let direction = Math.floor(Math.random() * 4); // 0: up, 1: right, 2: down, 3: left
    let turns = 0;
    for (let i = 0; i < length && turns < maxTurns; i++) {
        if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
            map[y][x] = 0; // Clear the block
            let nextX = x;
            let nextY = y;
            switch (direction) {
                case 0:
                    nextY--;
                    break;
                case 1:
                    nextX++;
                    break;
                case 2:
                    nextY++;
                    break;
                case 3:
                    nextX--;
                    break;
            }
            // Check for new direction
            if (Math.random() < 0.1 || nextX < 0 || nextX >= MAP_WIDTH || nextY < 0 || nextY >= MAP_HEIGHT) {
                direction = Math.floor(Math.random() * 4);
                turns++;
            } else {
                x = nextX;
                y = nextY;
            }
        }
    }
}

// 3. Main generation logic
function generateEnvironment() {
    // Initialize map with solid blocks (1)
    for (let y = 0; y < MAP_HEIGHT; y++) {
        MAP[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            MAP[y][x] = 1;
        }
    }
    // Generate initial heightmap for the top layer
    const heightmap = generateHeightmap(MAP_WIDTH, MAP_HEIGHT);
    for (let x = 0; x < MAP_WIDTH; x++) {
        for (let y = 0; y < heightmap[x]; y++) {
            MAP[y][x] = 0; // Clear area above heightmap
        }
    }
    // Carve a main tunnel from a random starting point
    const startX = Math.floor(Math.random() * MAP_WIDTH);
    const startY = Math.floor(heightmap[startX] + 1);
    carveTunnels(MAP, startX, startY, 500, 50);
}

// 4. Drawing the map
function drawMap() {
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (MAP[y][x] === 1) {
                ctx.fillStyle = '#964B00'; // Brown for solid ground
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

// 5. Collision detection for a circle
function checkCollision(x, y) {
    const gridX = Math.floor(x / BLOCK_SIZE);
    const gridY = Math.floor(y / BLOCK_SIZE);

    if (gridX < 0 || gridX >= MAP_WIDTH || gridY < 0 || gridY >= MAP_HEIGHT) {
        return true; // Out of bounds is a collision
    }
    return MAP[gridY][gridX] === 1;
}

// 6. Draw the player
function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    ctx.fillStyle = checkCollision(player.x, player.y) ? '#FF0000' : '#00FF00'; // Red if colliding, green if not
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Use WASD to move the circle!', canvas.width / 2, 20);
}

// 7. Update player position based on key presses
function updatePlayer() {
    const newX = player.x;
    const newY = player.y;

    if (keys.w) newY -= PLAYER_SPEED;
    if (keys.s) newY += PLAYER_SPEED;
    if (keys.a) newX -= PLAYER_SPEED;
    if (keys.d) newX += PLAYER_SPEED;

    // Check for collisions before updating position
    if (!checkCollision(newX, newY)) {
        player.x = newX;
        player.y = newY;
    }
}

// 8. The main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update game logic
    updatePlayer();

    // Draw everything
    drawMap();
    drawPlayer();

    requestAnimationFrame(gameLoop);
}

// Event listeners for key presses
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w = true;
            break;
        case 'a':
            keys.a = true;
            break;
        case 's':
            keys.s = true;
            break;
        case 'd':
            keys.d = true;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w = false;
            break;
        case 'a':
            keys.a = false;
            break;
        case 's':
            keys.s = false;
            break;
        case 'd':
            keys.d = false;
            break;
    }
});

// Generate the initial environment and start the game loop
generateEnvironment();
gameLoop();