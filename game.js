const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

const gravity = 0.6;
const friction = 0.8;

let level = 0;
let score = 0;
let transitioning = false;

const levels = [
  // Level 1
  {
    playerStart: { x: 50, y: 300 },
    goal: { x: 700, y: 330 },
    platforms: [
      { x: 0, y: 370, width: 800, height: 30 },
      { x: 150, y: 300, width: 120, height: 20 },
      { x: 320, y: 250, width: 100, height: 20 },
      { x: 500, y: 200, width: 100, height: 20 },
    ],
    coins: [
      { x: 170, y: 270, collected: false },
      { x: 530, y: 170, collected: false },
    ],
    enemies: [
      { x: 350, y: 340, width: 30, height: 30, dir: 1 },
    ]
  },
  // Level 2
  {
    playerStart: { x: 30, y: 300 },
    goal: { x: 700, y: 150 },
    platforms: [
      { x: 0, y: 370, width: 800, height: 30 },
      { x: 100, y: 320, width: 100, height: 20 },
      { x: 220, y: 260, width: 100, height: 20 },
      { x: 360, y: 210, width: 100, height: 20 },
      { x: 500, y: 160, width: 100, height: 20 },
    ],
    coins: [
      { x: 120, y: 290, collected: false },
      { x: 380, y: 180, collected: false },
      { x: 520, y: 130, collected: false },
    ],
    enemies: [
      { x: 600, y: 340, width: 30, height: 30, dir: -1 },
    ]
  },
  // Level 3
  {
    playerStart: { x: 20, y: 300 },
    goal: { x: 750, y: 50 },
    platforms: [
      { x: 0, y: 370, width: 800, height: 30 },
      { x: 150, y: 320, width: 100, height: 20 },
      { x: 300, y: 260, width: 100, height: 20 },
      { x: 450, y: 200, width: 100, height: 20 },
      { x: 600, y: 140, width: 100, height: 20 },
      { x: 400, y: 300, width: 40, height: 20, type: "spiky" },
      { x: 200, y: 180, width: 100, height: 20, moving: true, dx: 2, range: [200, 400] },
    ],
    coins: [
      { x: 170, y: 290, collected: false },
      { x: 470, y: 170, collected: false },
      { x: 630, y: 110, collected: false },
    ],
    enemies: [
      { x: 100, y: 340, width: 30, height: 30, dir: 1 },
      { x: 300, y: 240, width: 30, height: 30, dir: -1 },
      { x: 500, y: 180, width: 30, height: 30, dir: 1 },
    ]
  },
  // Level 4 (More flying & ground enemies, spikes, platforms)
  {
    playerStart: { x: 30, y: 320 },
    goal: { x: 750, y: 50 },
    platforms: [
      { x: 0, y: 370, width: 800, height: 30 },
      { x: 100, y: 320, width: 100, height: 20 },
      { x: 230, y: 270, width: 100, height: 20 },
      { x: 360, y: 220, width: 100, height: 20 },
      { x: 490, y: 170, width: 100, height: 20 },
      { x: 620, y: 120, width: 100, height: 20 },
      { x: 300, y: 350, width: 50, height: 20, type: "spiky" },
      { x: 400, y: 300, width: 50, height: 20, type: "spiky" },
      { x: 520, y: 250, width: 50, height: 20, type: "spiky" },
      { x: 200, y: 180, width: 100, height: 20, moving: true, dx: 1.5, range: [200, 400] },
      { x: 550, y: 100, width: 100, height: 20, moving: true, dx: 1.2, range: [550, 750] }
    ],
    coins: [
      { x: 130, y: 290, collected: false },
      { x: 380, y: 190, collected: false },
      { x: 650, y: 90, collected: false }
    ],
    enemies: [
      { x: 50, y: 340, width: 30, height: 30, dir: 1 },
      { x: 250, y: 340, width: 30, height: 30, dir: -1 },
      { x: 420, y: 200, width: 30, height: 30, dir: 1 }, // flying
      { x: 600, y: 90, width: 30, height: 30, dir: -1 }, // flying
      { x: 700, y: 340, width: 30, height: 30, dir: 1 }
    ]
  }
];

let player, currentLevel;

const jumpSound = new Audio("https://assets.mixkit.co/sfx/download/mixkit-arcade-game-jump-coin-216.wav");
const coinSound = new Audio("https://assets.mixkit.co/sfx/download/mixkit-game-coin-2033.wav");
const hitSound = new Audio("https://assets.mixkit.co/sfx/download/mixkit-retro-arcade-fail-1037.wav");
const goalSound = new Audio("https://assets.mixkit.co/sfx/download/mixkit-achievement-bell-600.wav");

function loadLevel(index) {
  const lvl = levels[index];
  player = {
    x: lvl.playerStart.x,
    y: lvl.playerStart.y,
    width: 30,
    height: 30,
    xSpeed: 0,
    ySpeed: 0,
    color: "#ff006e",
    onGround: false,
  };
  currentLevel = JSON.parse(JSON.stringify(lvl));
  transitioning = false;
}

function resetPlayer() {
  player.x = currentLevel.playerStart.x;
  player.y = currentLevel.playerStart.y;
  player.xSpeed = 0;
  player.ySpeed = 0;
  hitSound.play();
}

function resetGame() {
  level = 0;
  score = 0;
  loadLevel(level);
  hitSound.play();
}

function update() {
  if (transitioning) return;

  if (keys["ArrowLeft"]) player.xSpeed = -3;
  else if (keys["ArrowRight"]) player.xSpeed = 3;
  else player.xSpeed *= friction;

  if (keys["Space"] && player.onGround) {
    player.ySpeed = -12;
    jumpSound.play();
    player.onGround = false;
  }

  player.ySpeed += gravity;
  player.x += player.xSpeed;
  player.y += player.ySpeed;

  player.onGround = false;
  currentLevel.platforms.forEach(p => {
    if (p.moving) {
      p.x += p.dx;
      if (p.x < p.range[0] || p.x + p.width > p.range[1]) p.dx *= -1;
    }

    if (
      player.x < p.x + p.width &&
      player.x + player.width > p.x &&
      player.y + player.height < p.y + 10 &&
      player.y + player.height + player.ySpeed >= p.y
    ) {
      if (p.type === "spiky") {
        resetPlayer();
      } else {
        player.ySpeed = 0;
        player.y = p.y - player.height;
        player.onGround = true;
      }
    }
  });

  currentLevel.enemies.forEach(e => {
    e.x += e.dir * 2;
    if (e.x <= 0 || e.x + e.width >= canvas.width) e.dir *= -1;

    if (
      player.x < e.x + e.width &&
      player.x + player.width > e.x &&
      player.y < e.y + e.height &&
      player.y + player.height > e.y
    ) {
      resetGame();
    }
  });

  currentLevel.coins.forEach(c => {
    if (!c.collected &&
      player.x < c.x + 20 &&
      player.x + player.width > c.x &&
      player.y < c.y + 20 &&
      player.y + player.height > c.y
    ) {
      c.collected = true;
      score += 10;
      coinSound.play();
    }
  });

  const goal = currentLevel.goal;
  if (
    player.x < goal.x + 30 &&
    player.x + player.width > goal.x &&
    player.y < goal.y + 30 &&
    player.y + player.height > goal.y
  ) {
    if (!transitioning) {
      transitioning = true;
      goalSound.play();
      document.getElementById("levelCleared").style.display = "block";

      if (level + 1 >= levels.length) {
        setTimeout(() => {
          alert("🎉 You completed all levels! Final score: " + score);
          level = 0;
          score = 0;
          document.getElementById("levelCleared").style.display = "none";
          loadLevel(level);
        }, 1500);
      } else {
        setTimeout(() => {
          level++;
          document.getElementById("levelCleared").style.display = "none";
          loadLevel(level);
        }, 1500);
      }
    }
  }

  if (player.y > canvas.height) resetPlayer();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  currentLevel.platforms.forEach(p => {
    ctx.fillStyle = p.type === "spiky" ? "#ff0000" : "#0077b6";
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  ctx.fillStyle = "gold";
  currentLevel.coins.forEach(c => {
    if (!c.collected) {
      ctx.beginPath();
      ctx.arc(c.x + 10, c.y + 10, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  ctx.fillStyle = "#d00000";
  currentLevel.enemies.forEach(e =>
    ctx.fillRect(e.x, e.y, e.width, e.height)
  );

  ctx.fillStyle = "#38b000";
  ctx.fillRect(currentLevel.goal.x, currentLevel.goal.y, 30, 30);
  ctx.fillStyle = "white";
  ctx.fillText("🏁", currentLevel.goal.x + 5, currentLevel.goal.y + 22);

  ctx.fillStyle = "#03045e";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, 25);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

loadLevel(level);
gameLoop();
