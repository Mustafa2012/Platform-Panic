const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

const gravity = 0.6;
const friction = 0.8;

const bgImg = new Image();
bgImg.src = 'Images/GameBackground.png';

const groundImg = new Image();
groundImg.src = 'Images/Groundplatform.png';

const robotImg = new Image();
robotImg.src = 'Images/Robot.png';

const droneImg = new Image();
droneImg.src = 'Images/Drone.png'

const spiderImg = new Image();
spiderImg.src = 'Images/Spider.png'

const spikesImg = new Image();
spikesImg.src = 'Images/Spikes.png';

const coinImg = new Image();
coinImg.src = 'Images/BatteryCoin.png';

const goalImg = new Image();
goalImg.src = 'Images/DoorGoal.png';

const platformImg = new Image();
platformImg.src = 'Images/Platform.png';


let level = 0;
let score = 0;
let transitioning = false;
let levelTimer = 20; 
let timerInterval = null;





const round1Levels = [
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
      { x: 350, y: 340, width: 30, height: 30, dir: 1, type: "spider"},
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
      { x: 600, y: 340, width: 30, height: 30, dir: -1, type: "spider" },
    ]
  },
  {
    playerStart: { x: 20, y: 300 },
    goal: { x: 750, y: 50 },
    platforms: [
      { x: 0, y: 370, width: 800, height: 30 },
      { x: 150, y: 320, width: 100, height: 20 },
      { x: 300, y: 260, width: 100, height: 20 },
      { x: 450, y: 200, width: 100, height: 20 },
      { x: 600, y: 140, width: 100, height: 20 },
      { x: 200, y: 180, width: 100, height: 20, moving: true, dx: 2, range: [200, 400] },
    ],
    coins: [
      { x: 170, y: 290, collected: false },
      { x: 470, y: 170, collected: false },
      { x: 630, y: 110, collected: false },
    ],
    enemies: [
      { x: 100, y: 340, width: 30, height: 30, dir: 1, type: "spider" },
      { x: 300, y: 240, width: 30, height: 30, dir: -1, type: "drone" },
    ]
  },
  {
    playerStart: { x: 20, y: 300 },
    goal: { x: 700, y: 80 },
    platforms: [
      { x: 0, y: 370, width: 800, height: 30 },
      { x: 120, y: 320, width: 100, height: 20 },
      { x: 270, y: 270, width: 100, height: 20 },
      { x: 420, y: 220, width: 100, height: 20 },
      { x: 570, y: 170, width: 100, height: 20 },
      { x: 300, y: 120, width: 100, height: 20, moving: true, dx: 2, range: [300, 500] },
    ],
    coins: [
      { x: 130, y: 290, collected: false },
      { x: 290, y: 240, collected: false },
      { x: 440, y: 190, collected: false },
      { x: 590, y: 140, collected: false },
    ],
    enemies: [
      { x: 150, y: 340, width: 30, height: 30, dir: 1, type: "spider" },
      { x: 350, y: 250, width: 30, height: 30, dir: -1, type: "drone" },
    ]
  },
  {
    playerStart: { x: 20, y: 300 },
    goal: { x: 750, y: 50 },
    platforms: [
      { x: 0, y: 370, width: 800, height: 30 }, 
      { x: 100, y: 320, width: 80, height: 20 },
      { x: 250, y: 280, width: 100, height: 20 },
      { x: 420, y: 240, width: 100, height: 20 },
      { x: 600, y: 200, width: 100, height: 20 },
      { x: 300, y: 160, width: 80, height: 20, moving: true, dx: 2, range: [300, 500] },
      { x: 500, y: 100, width: 100, height: 20 }
    ],
    coins: [
      { x: 120, y: 290, collected: false },
      { x: 270, y: 250, collected: false },
      { x: 440, y: 210, collected: false },
      { x: 620, y: 170, collected: false },
      { x: 310, y: 130, collected: false },
    ],
    enemies: [
      { x: 180, y: 340, width: 30, height: 30, dir: 1, type: "spider" },
      { x: 370, y: 220, width: 30, height: 30, dir: -1, type: "drone" },
      { x: 600, y: 180, width: 30, height: 30, dir: -1, type: "drone" }
    ]
  },
];

const round2Levels = [
  {
    playerStart: { x: 50, y: 300 },
    goal: { x: 700, y: 330, locked: true },
    platforms: [
      { x: 0, y: 370, width: 800, height: 30 },
      { x: 150, y: 300, width: 120, height: 20 },
      { x: 320, y: 250, width: 100, height: 20 },
      { x: 500, y: 200, width: 100, height: 20 },
    ],
    coins: [
      { x: 170, y: 270, collected: false },
      { x: 530, y: 170, collected: false }
    ],
    enemies: [
      { x: 350, y: 340, width: 30, height: 30, dir: 1, type: "spider"},
    ]
  },
  {
    playerStart: { x: 30, y: 300 },
    goal: { x: 700, y: 150, locked: true },
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
      { x: 520, y: 130, collected: false }
      
    ],
    enemies: [
      { x: 600, y: 340, width: 30, height: 30, dir: -1, type: "spider" },
      { x: 200, y: 320, width: 30, height: 30, dir: 1, type: "drone" },
    ]
  },
  {
    playerStart: { x: 20, y: 300 },
    goal: { x: 750, y: 50, locked: true },
    platforms: [
      { x: 0, y: 370, width: 800, height: 30 },
      { x: 150, y: 320, width: 100, height: 20 },
      { x: 300, y: 260, width: 100, height: 20 },
      { x: 450, y: 200, width: 100, height: 20 },
      { x: 600, y: 140, width: 100, height: 20 },
      { x: 200, y: 180, width: 100, height: 20, moving: true, dx: 2, range: [200, 400] },
    ],
    coins: [
      { x: 170, y: 290, collected: false },
      { x: 470, y: 170, collected: false },
      { x: 630, y: 110, collected: false },
      { x: 300, y: 240, collected: false },
    ],
    enemies: [
      { x: 100, y: 340, width: 30, height: 30, dir: 1, type: "spider" },
      { x: 300, y: 240, width: 30, height: 30, dir: -1, type: "drone" },
      { x: 500, y: 180, width: 30, height: 30, dir: 1, type: "drone" },
    ]
  },
  {
    playerStart: { x: 20, y: 300 },
    goal: { x: 700, y: 80, locked: true },
    platforms: [
      { x: 0, y: 370, width: 800, height: 30 },
      { x: 120, y: 320, width: 100, height: 20 },
      { x: 270, y: 270, width: 100, height: 20 },
      { x: 420, y: 220, width: 100, height: 20 },
      { x: 570, y: 170, width: 100, height: 20 },
      { x: 300, y: 120, width: 100, height: 20, moving: true, dx: 2, range: [300, 500] },
      { x: 200, y: 180, width: 60, height: 20, type: "spiky" },
    ],
    coins: [
      { x: 130, y: 290, collected: false },
      { x: 290, y: 240, collected: false },
      { x: 440, y: 190, collected: false },
      { x: 590, y: 140, collected: false },
      { x: 320, y: 90, collected: false },
    ],
    enemies: [
      { x: 150, y: 340, width: 30, height: 30, dir: 1, type: "spider" },
      { x: 350, y: 250, width: 30, height: 30, dir: -1, type: "drone" },
      { x: 550, y: 190, width: 30, height: 30, dir: 1, type: "drone" },
    ]
  },
  {
    playerStart: { x: 20, y: 300 },
    goal: { x: 750, y: 50, locked: true },
    platforms: [
      { x: 0, y: 370, width: 800, height: 30 }, 
      { x: 100, y: 320, width: 80, height: 20 },
      { x: 250, y: 280, width: 100, height: 20 },
      { x: 420, y: 240, width: 100, height: 20 },
      { x: 600, y: 200, width: 100, height: 20 },
      { x: 300, y: 160, width: 80, height: 20, moving: true, dx: 2, range: [300, 500] },
      { x: 150, y: 120, width: 60, height: 20, type: "spiky" },
      { x: 500, y: 100, width: 100, height: 20 }
    ],
    coins: [
      { x: 120, y: 290, collected: false },
      { x: 270, y: 250, collected: false },
      { x: 440, y: 210, collected: false },
      { x: 620, y: 170, collected: false },
      { x: 310, y: 130, collected: false },
      { x: 520, y: 70, collected: false },
    ],
    enemies: [
      { x: 180, y: 340, width: 30, height: 30, dir: 1, type: "spider" },
      { x: 370, y: 220, width: 30, height: 30, dir: -1, type: "drone" },
      { x: 470, y: 320, width: 30, height: 30, dir: 1, type: "drone" },
      { x: 600, y: 180, width: 30, height: 30, dir: -1, type: "drone" }
    ]
  },
];

let player, currentLevel;


function showRoundScreen() {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("roundScreen").style.display = "flex";
}

// Called when player chooses a round
function selectRound(round) {
  currentRound = round;
  level = 0;
  allLevels = currentRound === 1 ? round1Levels : round2Levels;
  document.getElementById("roundScreen").style.display = "none";
  document.getElementById("game").style.display = "block";
  loadLevel(level);
  gameLoop();
}



const jumpSound = new Audio;
jumpSound.src = 'Sound/JumpSound.wav';

const coinSound = new Audio;
coinSound.src = 'Sound/CoinSound.mp3';

const hitSound = new Audio;
hitSound.src = 'Sound/HitSound.wav';

const goalSound = new Audio;
goalSound.src = 'Sound/GoalSound.wav'

let currentRound = 1;
let allLevels = round1Levels; // Default to round 1

function loadLevel(index) {
  const levels = currentRound === 1 ? round1Levels : round2Levels; 
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

  // --- Portal rules ---
  // Round 1 → portal is always open
  // Round 2 → portal starts locked, unlocks when all coins are collected
  if (currentRound === 1) {
    portalUnlocked = true;
  } else {
    portalUnlocked = false; // wait until coins are collected
  }

  // --- Reset level timer ---
  levelTimer = 20;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    levelTimer--;
    if (levelTimer <= 0) {
      clearInterval(timerInterval);
      resetGame();
    }
  }, 1000);
}
    

  transitioning = false;
  levelTimer = 20;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    levelTimer--;
    if (levelTimer <= 0) {
      clearInterval(timerInterval);
      resetGame();
    }
  }, 1000);




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

  // --- Player horizontal movement ---
  if (keys["ArrowLeft"]) player.xSpeed = -3;
  else if (keys["ArrowRight"]) player.xSpeed = 3;
  else player.xSpeed *= friction;

  // --- Check if in booster zone ---
  let inBooster = currentLevel.boostZones?.some(bz =>
    player.x + player.width > bz.x &&
    player.x < bz.x + bz.width &&
    player.y + player.height >= bz.y &&
    player.y + player.height <= bz.y + bz.height + 5
  );

  // --- Jump ---
  if ((keys["Space"] && player.onGround) || (keys["ArrowUp"] && player.onGround)) {
    player.ySpeed = inBooster ? -20.4 : -12;
    jumpSound.play();
    player.onGround = false;
  }

  // --- Apply gravity and move player ---
  player.ySpeed += gravity;
  player.x += player.xSpeed;
  player.y += player.ySpeed;

  // --- Platform collisions ---
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

  // --- Enemy collisions ---
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

  // --- Coin collection ---
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

  // --- Unlock portal if needed ---
  if (currentLevel.goal.locked && !portalUnlocked) {
    const allCollected = currentLevel.coins.every(c => c.collected);
    if (allCollected) {
      portalUnlocked = true;
    }
  }

 if (portalUnlocked &&
    player.x < currentLevel.goal.x + 30 &&
    player.x + player.width > currentLevel.goal.x &&
    player.y < currentLevel.goal.y + 30 &&
    player.y + player.height > currentLevel.goal.y
) {
  if (!transitioning) {
    transitioning = true;
    goalSound.play();
    clearInterval(timerInterval);

    document.getElementById("levelCleared").style.display = "block";

    // ✅ Mark level complete
    if (currentRound === 1) completedLevels.round1[level] = true;
    if (currentRound === 2) completedLevels.round2[level] = true;

    level++;
    const levels = currentRound === 1 ? round1Levels : round2Levels;

    if (level >= levels.length) {
      setTimeout(() => {
        alert("🎉 You completed all levels in Round " + currentRound);
        document.getElementById("levelCleared").style.display = "none";
        // return to round screen instead of resetting
        showRoundScreen();
      }, 1500);
    } else {
      setTimeout(() => {
        document.getElementById("levelCleared").style.display = "none";
        loadLevel(level);
      }, 1500);
    }
  }
}

 
  if (player.y > canvas.height) resetPlayer();
}

function isRoundComplete(round) {
  return completedLevels[`round${round}`].every(done => done);
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

 
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  
  currentLevel.platforms.forEach(p => {
    if (p.type === "spiky") {
      ctx.drawImage(spikesImg, p.x, p.y, p.width, p.height);
    } else {
      if (p.y < 370) {
        ctx.drawImage(platformImg, p.x, p.y, p.width, p.height);
      } else {
        ctx.fillStyle = "rgba(27, 54, 54, 0.6)";
        ctx.fillRect(p.x, p.y, p.width, p.height);
      }
    }
  });

  
  ctx.drawImage(robotImg, player.x, player.y, player.width, player.height);

  
  currentLevel.coins.forEach(c => {
    if (!c.collected) {
      ctx.drawImage(coinImg, c.x, c.y, 20, 20);
    }
  });

  
  currentLevel.enemies.forEach(e => {
    const sprite = e.type === "drone" ? droneImg : spiderImg;
    ctx.drawImage(sprite, e.x, e.y, e.width, e.height);
  });

  
  if (currentLevel.boostZones) {
    currentLevel.boostZones.forEach(bz => {
      ctx.fillStyle = "rgba(0,255,255,0.6)";
      ctx.fillRect(bz.x, bz.y, bz.width, bz.height);
    });
  }

  
  if (portalUnlocked) {
    ctx.drawImage(goalImg, currentLevel.goal.x, currentLevel.goal.y, 30, 30);
  } else {
   
    ctx.globalAlpha = 0.3;
    ctx.drawImage(goalImg, currentLevel.goal.x, currentLevel.goal.y, 30, 30);
    ctx.globalAlpha = 1;
  }

 
  ctx.fillStyle = "#00f5d4";
  ctx.font = "18px Courier";
  ctx.fillText("Score: " + score, 10, 25);
  ctx.fillText("Level: " + (level + 1), 360, 25);
  ctx.fillText("Time: " + levelTimer + "s", 700, 25);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}


let completedLevels = {
  round1: [false, false, false, false, false],
  round2: [false, false, false, false, false]
};







window.onload = () => {
  document.getElementById("playButton").addEventListener("click", () => {
    showRoundScreen();
  });
};


