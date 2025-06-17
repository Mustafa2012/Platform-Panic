


const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true)
document.addEventListener("keyup", e => keys[e.code] = false);

const gravity = 0.6;
const friction = 0.8;

let level = 0;
let score = 0;

const levls = [
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
  }
];

let player, currentLevel;

const jumpSound = new Audio("https://assets.mixkit.co/sfx/download/mixkit-arcade-game-jump-coin-216.wav");
const coinSound = new Audio("https://assets.mixkit.co/sfx/download/mixkit-game-coin-2033.wav");
const hitSound = new Audio("https://assets.mixkit.co/sfx/download/mixkit-retro-arcade-fail-1037.wav");
const goalSound = new Audio("https://assets.mixkit.co/sfx/download/mixkit-achievement-bell-600.wav");

const levelClearedImg = document.getElementById("levelCleared");

function showLevelCleared(callback) {
  levelClearedImg.style.display = "block";
  setTimeout(() => {
    levelClearedImg.style.display = "none";
    callback();
  }, 2000);
}



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
}

function resetPlayer() {
  player.x = currentLevel.playerStart.x;
  player.y = currentLevel.playerStart.y;
  player.xSpeed = 0;
  player.ySpeed = 0;
  hitSound.play();
}

function update() {
  if (keys["ArrowLeft"]) player.xSpeed = -3;
  else if (keys["ArrowRight"]) player.xSpeed = 3;
  else player.xSpeed *= friction;}

  if (keys["Space"] && player.onGround) {
    player.ySpeed = -12;
    jumpSound.play();
    player.onGround = false;
  }

  player.yspeed += gravity;
  player.x += player.xspeed;
  player.y += player.yspeed;

  player.onground = false;
  currentLevel.platforms.forEach(p => {
    if (
      player.x < p.x + p.width &&
      player.x + player.width > p.x &&
      player.y + player.height < p.y + 10 &&
      player.y + player.height + player.ySpeed >= p.y
    ) {
      player.ySpeed = 0;
      player.y = p.y - player.height;
      player.onGround = true;
    }
  });currentLevel.enemies.forEach