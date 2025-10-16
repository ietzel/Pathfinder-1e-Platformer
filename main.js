const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const BLOCK_SIZE = 32;
const MAP_WIDTH = canvas.width / BLOCK_SIZE;
const MAP_HEIGHT = canvas.height / BLOCK_SIZE;
let MAP = []; // Change const to let
const PLAYER_SPEED = 2;
const keys = { w: false, a: false, s: false, d: false };

// Player object
const player = {
  x: 10 * BLOCK_SIZE + BLOCK_SIZE / 2, // Center the player initially
  y: 10 * BLOCK_SIZE + BLOCK_SIZE / 2,
  radius: BLOCK_SIZE / 2
};

// 1. Generate a 1D heightmap with smooth noise function
function generateHeightmap(width, height) {
  const heightmap = [];
  let currentHeight = height / 2;
  let noiseFactor = 0.5;
  for (let x = 0; x < width; x++) {
    currentHeight += (Math.random() - 0.5) * 4 * noiseFactor;
    currentHeight = Math.max(height * 0.2, Math.min(height * 0.8, currentHeight));
    heightmap.push(Math.floor(currentHeight));
  }
  return heightmap;
}

// 2. Carve tunnels through the map
function carveTunnels(map, startX, startY, length, maxTurns) {
  let x = startX;
  let y = startY;
  let direction = Math.floor(Math.random() * 4);
  let turns = 0;
  for (let i = 0; i < length && turns < maxTurns; i++) {
    if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
      map[y][x] = 0;
      let nextX = x;
      let nextY = y;
      switch (direction) {
        case 0: nextY--; break;
        case 1: nextX++; break;
        case 2: nextY++; break;
        case 3: nextX--; break;
      }
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
  MAP = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    MAP[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      MAP[y][x] = 1;
    }
  }
  const heightmap = generateHeightmap(MAP_WIDTH, MAP_HEIGHT);
  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < heightmap[x]; y++) {
      MAP[y][x] = 0;
    }
  }
  const startX = Math.floor(Math.random() * MAP_WIDTH);
  const startY = Math.floor(heightmap[startX] + 1);
  carveTunnels(MAP, startX, startY, 500, 50);
}

// 4. Drawing the map
function drawMap() {
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (MAP[y][x] === 1) {
        ctx.fillStyle = '#964B00';
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

// 5. Improved collision detection for a circle
// Checks all four corners of the player's bounding box
function checkCollision(x, y) {
  const halfSize = player.radius;
  const pointsToCheck = [
    [x - halfSize, y - halfSize], // Top-left
    [x + halfSize, y - halfSize], // Top-right
    [x - halfSize, y + halfSize], // Bottom-left
    [x + halfSize, y + halfSize] // Bottom-right
  ];

  for (const [px, py] of pointsToCheck) {
    const gridX = Math.floor(px / BLOCK_SIZE);
    const gridY = Math.floor(py / BLOCK_SIZE);
    if (gridX < 0 || gridX >= MAP_WIDTH || gridY < 0 || gridY >= MAP_HEIGHT) {
      return true; // Out of bounds
    }
    if (MAP[gridY][gridX] === 1) {
      return true; // Collision detected
    }
  }
  return false; // No collision
}

// 6. Draw the player
function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
  ctx.fillStyle = checkCollision(player.x, player.y) ? '#FF0000' : '#00FF00';
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Use WASD to move the circle!', canvas.width / 2, 20);
}

// 7. Update player position based on key presses
function updatePlayer() {
  let newX = player.x;
  let newY = player.y;

  if (keys.w) newY -= PLAYER_SPEED;
  if (keys.s) newY += PLAYER_SPEED;
  if (keys.a) newX -= PLAYER_SPEED;
  if (keys.d) newX += PLAYER_SPEED;

  // Check for collisions before updating position for each axis
  if (!checkCollision(newX, player.y)) {
    player.x = newX;
  }
  if (!checkCollision(player.x, newY)) {
    player.y = newY;
  }
}

// 8. The main game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updatePlayer();
  drawMap();
  drawPlayer();
  requestAnimationFrame(gameLoop);
}

// Event listeners for key presses
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'w': keys.w = true; break;
    case 'a': keys.a = true; break;
    case 's': keys.s = true; break;
    case 'd': keys.d = true; break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w': keys.w = false; break;
    case 'a': keys.a = false; break;
    case 's': keys.s = false; break;
    case 'd': keys.d = false; break;
  }
});

generateEnvironment();
gameLoop();
