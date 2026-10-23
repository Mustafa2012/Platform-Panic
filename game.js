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

const robotSpriteSheet = new Image();
robotSpriteSheet.src = 'Images/RobotSprites.png';

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
const goalSize = 45;
const goalOffsetY = goalSize - 30;

const platformImg = new Image();
platformImg.src = 'Images/Platform.png';


let level = 0;
let score = 0;
let transitioning = false;
let isPaused = false;
let levelTimer = 20; 
let timerInterval = null;
const frameDuration = 1000 / 60;
let previousFrameTime = null;
let frameAccumulator = 0;
let gameLoopStarted = false;
const platformSurfaceOffset = 7;

window.addEventListener("blur", () => keys = {});




const round1Levels = [
  {
    playerStart: { x: 50, y: 300 },
    goal: { x: 700, y: 343 },
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
    goal: { x: 700, y: 140 },
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
    playerStart: { x: 40, y: 300 },
    goal: { x: 740, y: 343 },
    platforms: [
      { x: 0, y: 370, width: 800, height: 30 },
      { x: 110, y: 310, width: 100, height: 20 },
      { x: 280, y: 250, width: 90, height: 20 },
      { x: 450, y: 300, width: 110, height: 20 },
      { x: 630, y: 230, width: 95, height: 20 },
      { x: 220, y: 355, width: 50, height: 20, type: "spiky" },
    ],
    coins: [
      { x: 140, y: 275, collected: false },
      { x: 310, y: 215, collected: false },
      { x: 480, y: 265, collected: false },
      { x: 660, y: 195, collected: false }
    ],
    enemies: [
      { x: 350, y: 340, width: 30, height: 30, dir: 1, type: "spider" },
      { x: 650, y: 195, width: 30, height: 30, dir: -1, type: "drone" }
    ]
  },
  {
    playerStart: { x: 40, y: 300 },
    goal: { x: 740, y: 160 },
    platforms: [
      { x: 0, y: 370, width: 800, height: 30 },
      { x: 80, y: 315, width: 85, height: 20 },
      { x: 220, y: 260, width: 80, height: 20 },
      { x: 365, y: 205, width: 90, height: 20 },
      { x: 525, y: 255, width: 85, height: 20 },
      { x: 670, y: 205, width: 100, height: 20 },
      { x: 300, y: 355, width: 70, height: 20, type: "spiky" },
      { x: 470, y: 355, width: 70, height: 20, type: "spiky" },
    ],
    coins: [
      { x: 105, y: 280, collected: false },
      { x: 245, y: 225, collected: false },
      { x: 390, y: 170, collected: false },
      { x: 550, y: 220, collected: false },
      { x: 700, y: 170, collected: false }
    ],
    enemies: [
      { x: 180, y: 340, width: 30, height: 30, dir: -1, type: "spider" },
      { x: 550, y: 220, width: 30, height: 30, dir: 1, type: "drone" },
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
  {
    playerStart: { x: 730, y: 300 },
    goal: { x: 25, y: 343 },
    platforms: [
      { x: 0, y: 370, width: 800, height: 30 },
      { x: 620, y: 310, width: 90, height: 20 },
      { x: 455, y: 260, width: 95, height: 20, moving: true, dy: 1.5, range: [205, 300] },
      { x: 290, y: 210, width: 95, height: 20 },
      { x: 130, y: 160, width: 95, height: 20 },
      { x: 500, y: 360, width: 55, height: 20, type: "spiky" },
      { x: 300, y: 360, width: 55, height: 20, type: "spiky" }
    ],
    coins: [
      { x: 650, y: 275, collected: false },
      { x: 485, y: 225, collected: false },
      { x: 320, y: 175, collected: false },
      { x: 160, y: 125, collected: false },
      { x: 90, y: 340, collected: false }
    ],
    enemies: [
      { x: 560, y: 340, width: 30, height: 30, dir: 1, type: "spider" },
      { x: 330, y: 175, width: 30, height: 30, dir: -1, type: "drone" }
    ]
  },
];

const round2Levels = round1Levels.map(levelData => {
  const factoryLevel = JSON.parse(JSON.stringify(levelData));
  factoryLevel.goal.locked = true;
  return factoryLevel;
});

let player, currentLevel;
   

function showRoundScreen() {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("roundScreen").style.display = "flex";
  document.getElementById("gameArea").style.display = "none";
  document.getElementById("soundToggle").style.display = "none";
  document.getElementById("nextLevelButton").style.display = "none";
  document.getElementById("controls").style.display = "none";
  document.getElementById("levelCompleteScreen").style.display = "none";
  renderLevelMap();
}

function showLevelCompleteScreen() {
  const totalCoins = currentLevel.coins.length;
  const collectedCoins = currentLevel.coins.filter(coin => coin.collected).length;
  const elapsedTime = 20 - levelTimer;
  const earnedStars = [
    true,
    collectedCoins === totalCoins,
    elapsedTime < 10,
  ];
  const starsEarned = earnedStars.filter(Boolean).length;
  const stars = document.getElementById("completionStars");

  document.getElementById("completionStage").textContent = `STAGE ${level + 1}`;
  document.getElementById("completionTime").textContent = `${elapsedTime}s`;
  document.getElementById("completionScore").textContent = score;
  document.getElementById("completionCoins").textContent = `${collectedCoins}/${totalCoins}`;
  stars.replaceChildren(...earnedStars.map((_, index) => {
    const star = document.createElement("span");
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");

    star.className = index < starsEarned ? "earned" : "";
    icon.setAttribute("viewBox", "0 0 48 48");
    icon.setAttribute("aria-hidden", "true");
    icon.classList.add("completion-star-icon");
    shape.setAttribute("d", "M24 4 29.5 17.2 44 18.4 32.8 27.8 36.2 42 24 34.5 11.8 42 15.2 27.8 4 18.4 18.5 17.2Z");
    shape.setAttribute("stroke-linejoin", "round");
    shape.setAttribute("stroke-linecap", "round");
    icon.append(shape);
    star.append(icon);
    return star;
  }));
  stars.setAttribute("aria-label", `${starsEarned} out of 3 stars`);
  const completionScreen = document.getElementById("levelCompleteScreen");
  const continueButton = document.getElementById("completionContinue");
  const replayButton = document.getElementById("completionReplay");
  const nextButton = document.getElementById("completionNext");
  const levels = currentRound === 1 ? round1Levels : round2Levels;
  completionScreen.style.display = "grid";
  continueButton.disabled = true;
  replayButton.disabled = true;
  nextButton.disabled = level + 1 >= levels.length;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => {
    if (completionScreen.style.display !== "none") {
      continueButton.disabled = false;
      replayButton.disabled = false;
      if (level + 1 < levels.length) nextButton.disabled = false;
      continueButton.focus();
    }
  }, reducedMotion ? 100 : 2400);
}


function selectRound(round) {
  currentRound = round;
  renderLevelMap();
}

function renderLevelMap() {
  const levels = currentRound === 1 ? round1Levels : round2Levels;
  const completed = currentRound === 1 ? completedLevels.round1 : completedLevels.round2;
  const levelNames = Array.from({ length: levels.length }, (_, index) => `Lvl ${index + 1}`);
  const positions = [
    [8, 74], [22, 25], [36, 68], [50, 25], [64, 68], [78, 25], [92, 68]
  ];
  const levelNodes = document.getElementById("levelNodes");
  const completedCount = completed.filter(Boolean).length;

  document.querySelectorAll(".round-tab").forEach(tab => {
    const selected = Number(tab.dataset.round) === currentRound;
    tab.classList.toggle("selected", selected);
    tab.setAttribute("aria-pressed", String(selected));
  });

  levelNodes.replaceChildren();
  levels.forEach((_, index) => {
    const isCompleted = completed[index];
    const isUnlocked = index === 0 || completed[index - 1];
    const node = document.createElement("button");
    const marker = document.createElement("span");
    const title = document.createElement("span");
    const [x, y] = positions[index];

    node.type = "button";
    node.className = `level-node${isCompleted ? " completed" : ""}`;
    node.style.setProperty("--node-x", `${x}%`);
    node.style.setProperty("--node-y", `${y}%`);
    node.disabled = !isUnlocked;
    node.setAttribute("aria-label", `${levelNames[index]}${isCompleted ? ", completed" : isUnlocked ? ", unlocked" : ", locked"}`);
    node.title = isUnlocked ? `Play ${levelNames[index]}` : "Complete the previous level to unlock";
    marker.className = "node-marker";
    marker.textContent = isCompleted ? "✓" : isUnlocked ? String(index + 1) : "🔒";
    title.className = "node-title";
    title.textContent = levelNames[index];
    node.append(marker, title);
    if (isUnlocked) node.addEventListener("click", () => startLevel(index));
    levelNodes.append(node);
  });

  document.getElementById("mapProgress").textContent =
    completedCount === levels.length
      ? "All levels cleared!"
      : `${completedCount} / ${levels.length} levels cleared`;
}

function startLevel(index) {
  const completed = currentRound === 1 ? completedLevels.round1 : completedLevels.round2;
  if (index > 0 && !completed[index - 1]) return;

  level = index;
  allLevels = currentRound === 1 ? round1Levels : round2Levels;
  document.getElementById("roundScreen").style.display = "none";
  document.getElementById("levelCompleteScreen").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("game").style.display = "block";
  document.getElementById("controls").style.display = "flex";
  document.getElementById("soundToggle").style.display = "block";
  document.getElementById("nextLevelButton").style.display = "block";
  loadLevel(level);

  if (!gameLoopStarted) {
    gameLoopStarted = true;
    gameLoop();
  }
}


const jumpSound = new Audio('Sound/JumpSound.wav');
const coinSound = new Audio('Sound/CoinSound.mp3');
const hitSound = new Audio('Sound/HitSound.wav');
const goalSound = new Audio('Sound/GoalSound.wav');

const soundEffects = [jumpSound, coinSound, hitSound, goalSound];
soundEffects.forEach(sound => {
  sound.preload = "auto";
});
let isMuted = false;

function playSound(sound) {
  sound.pause();
  sound.currentTime = 0;
  sound.play().catch(error => {
    if (error.name !== "AbortError") {
      console.error(`Unable to play sound effect ${sound.src}:`, error);
    }
  });
}

let currentRound = 1;
let allLevels = round1Levels; 

function loadLevel(index) {
  const levels = currentRound === 1 ? round1Levels : round2Levels; 
  const lvl = levels[index];

  score = 0;
  player = {
    x: lvl.playerStart.x,
    y: lvl.playerStart.y,
    width: 30,
    height: 30,
    xSpeed: 0,
    ySpeed: 0,
    facingRight: true,
    color: "#ff006e",
    onGround: false,
  };

  currentLevel = JSON.parse(JSON.stringify(lvl));
  transitioning = false;
  isPaused = false;

  
  if (currentRound === 1) {
    portalUnlocked = true;
  } else {
    portalUnlocked = false; 
  }


  levelTimer = 20;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (isPaused) return;
    levelTimer--;
    if (levelTimer <= 0) {
      clearInterval(timerInterval);
      if (currentRound === 1) {
        keys = {};
        loadLevel(level);
        playSound(hitSound);
      } else {
        resetGame();
      }
    }
  }, 1000);
}

function skipToNextLevel() {
  if (!gameLoopStarted || transitioning) return;

  const levels = currentRound === 1 ? round1Levels : round2Levels;
  level = (level + 1) % levels.length;
  keys = {};
  loadLevel(level);
}


function resetPlayer() {
  keys = {};
  loadLevel(level);
  playSound(hitSound);
}

function resetGame() {
  keys = {};
  level = 0;
  score = 0;
  loadLevel(level);
  playSound(hitSound);
}

function update() {
  if (transitioning) return;


  if (keys["ArrowLeft"] || keys["KeyA"]) {
    player.xSpeed = -3;
    player.facingRight = false;
  } else if (keys["ArrowRight"] || keys["KeyD"]) {
    player.xSpeed = 3;
    player.facingRight = true;
  }
  else player.xSpeed *= friction;


  let inBooster = currentLevel.boostZones?.some(bz =>
    player.x + player.width > bz.x &&
    player.x < bz.x + bz.width &&
    player.y + player.height >= bz.y &&
    player.y + player.height <= bz.y + bz.height + 5
  );


  if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && player.onGround) {
    player.ySpeed = inBooster ? -20.4 : -12;
    playSound(jumpSound);
    player.onGround = false;
  }


  player.ySpeed += gravity;
  player.x += player.xSpeed;
  player.y += player.ySpeed;

  const hitSpikes = currentLevel.platforms.some(p =>
    p.type === "spiky" &&
    player.x < p.x + p.width &&
    player.x + player.width > p.x &&
    player.y < p.y + p.height &&
    player.y + player.height > p.y
  );
  if (hitSpikes) {
    resetPlayer();
    return;
  }

  player.onGround = false;
  currentLevel.platforms.forEach(p => {
    if (p.type === "spiky") return;

    if (p.moving) {
      if (p.dy !== undefined) {
        p.y += p.dy;
        if (p.y < p.range[0] || p.y > p.range[1]) p.dy *= -1;
      } else {
        p.x += p.dx;
        if (p.x < p.range[0] || p.x + p.width > p.range[1]) p.dx *= -1;
      }
    }

    const collisionInset = p.y < 370 ? p.width * 0.05 : 0;
    const collisionLeft = p.x + collisionInset;
    const collisionRight = p.x + p.width - collisionInset;
    const supportOverlap = Math.min(player.x + player.width, collisionRight) - Math.max(player.x, collisionLeft);
    const collidesHorizontally = supportOverlap >= player.width * 0.5;

    if (
      collidesHorizontally &&
      player.y + player.height < p.y + 10 &&
      player.y + player.height + player.ySpeed >= p.y
    ) {
      player.ySpeed = 0;
      player.y = p.y - player.height;
      player.onGround = true;
    }
  });


  const hitEnemy = currentLevel.enemies.some(e => {
    e.x += e.dir * 2;
    if (e.x <= 0 || e.x + e.width >= canvas.width) e.dir *= -1;

    return (
      player.x < e.x + e.width &&
      player.x + player.width > e.x &&
      player.y < e.y + e.height &&
      player.y + player.height > e.y
    );
  });
  if (hitEnemy) {
    if (currentRound === 1) resetPlayer();
    else resetGame();
    return;
  }


  currentLevel.coins.forEach(c => {
    if (!c.collected &&
      player.x < c.x + 20 &&
      player.x + player.width > c.x &&
      player.y < c.y + 20 &&
      player.y + player.height > c.y
    ) {
      c.collected = true;
      score += 10;
      playSound(coinSound);
    }
  });


  if (currentLevel.goal.locked && !portalUnlocked) {
    const allCollected = currentLevel.coins.every(c => c.collected);
    if (allCollected) {
      portalUnlocked = true;
    }
  }

 if (portalUnlocked &&
    player.x < currentLevel.goal.x + goalSize &&
    player.x + player.width > currentLevel.goal.x &&
    player.y < currentLevel.goal.y - goalOffsetY + goalSize &&
    player.y + player.height > currentLevel.goal.y - goalOffsetY
) {
  if (!transitioning) {
    transitioning = true;
    playSound(goalSound);
    clearInterval(timerInterval);

    if (currentRound === 1) completedLevels.round1[level] = true;
    if (currentRound === 2) completedLevels.round2[level] = true;
    showLevelCompleteScreen();
  }
}

 
  if (player.y > canvas.height) resetPlayer();
}

function isRoundComplete(round) {
  return completedLevels[`round${round}`].every(done => done);
}


function draw(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

 
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  currentLevel.platforms.forEach(p => {
    if (p.type === "spiky") {
      ctx.drawImage(spikesImg, 87, 219, 849, 716, p.x, p.y, p.width, p.height);
    } else {
      if (p.y < 370) {
        ctx.drawImage(platformImg, p.x, p.y - platformSurfaceOffset, p.width, p.height);
      } else {
        ctx.fillStyle = "rgba(27, 54, 54, 0.6)";
        ctx.fillRect(p.x, p.y, p.width, p.height);
      }
    }
  });

  
  if (robotSpriteSheet.complete && robotSpriteSheet.naturalWidth > 0) {
    const frameCount = 5;
    const frameWidth = robotSpriteSheet.naturalWidth / frameCount;
    const frameHeight = robotSpriteSheet.naturalHeight / 5;
    const isMoving = !transitioning && Math.abs(player.xSpeed) > 0.2;
    const frame = isMoving ? Math.floor(timestamp / 110) % frameCount : 0;
    const spriteSize = player.width * 2.4;
    const spriteX = player.x + (player.width - spriteSize) / 2;
    const spriteY = player.y + player.height - (105 / frameHeight) * spriteSize;

    ctx.save();
    if (player.facingRight) {
      ctx.translate(player.x + player.width / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(player.x + player.width / 2), 0);
    }
    ctx.drawImage(
      robotSpriteSheet,
      frame * frameWidth, 0, frameWidth, frameHeight,
      spriteX, spriteY, spriteSize, spriteSize
    );
    ctx.restore();
  }

  
  currentLevel.coins.forEach(c => {
    if (!c.collected) {
      ctx.drawImage(coinImg, c.x, c.y, 20, 20);
    }
  });

  
  currentLevel.enemies.forEach(e => {
    const sprite = e.type === "drone" ? droneImg : spiderImg;
    const spriteYOffset = e.type === "spider" ? 5 : 0;
    ctx.drawImage(sprite, e.x, e.y + spriteYOffset, e.width, e.height);
  });

  
  if (currentLevel.boostZones) {
    currentLevel.boostZones.forEach(bz => {
      ctx.fillStyle = "rgba(0,255,255,0.6)";
      ctx.fillRect(bz.x, bz.y, bz.width, bz.height);
    });
  }

     
  if (portalUnlocked) {
    ctx.drawImage(goalImg, currentLevel.goal.x, currentLevel.goal.y - goalOffsetY, goalSize, goalSize);
  } else {
   
    ctx.globalAlpha = 0.3;
    ctx.drawImage(goalImg, currentLevel.goal.x, currentLevel.goal.y - goalOffsetY, goalSize, goalSize);
    ctx.globalAlpha = 1;
  }


 ctx.fillStyle = "#00f5d4";  
ctx.font = "18px Courier";
ctx.fillText("Round: " + currentRound, 250, 25);
ctx.fillText("Score: " + score, 10, 25);
ctx.fillText("Level: " + (level + 1), 460, 25);
ctx.fillText("Time: " + levelTimer + "s", 620, 25);

if (isPaused) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#00f5d4";
  ctx.font = "32px Courier";
  ctx.textAlign = "center";
  ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
  ctx.textAlign = "start";
}
}                       



function gameLoop(timestamp = performance.now()) {
  if (previousFrameTime === null) previousFrameTime = timestamp - frameDuration;
  frameAccumulator += Math.min(timestamp - previousFrameTime, frameDuration * 6);
  previousFrameTime = timestamp;

  while (frameAccumulator >= frameDuration) {
    if (!isPaused) update();
    frameAccumulator -= frameDuration;
  }

  draw(timestamp);
  requestAnimationFrame(gameLoop);
}
        


let completedLevels = {
  round1: Array(round1Levels.length).fill(false),
  round2: Array(round2Levels.length).fill(false)
};

function setupMobileControls() {
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");
  const jumpBtn = document.getElementById("jumpBtn");

  if (!leftBtn || !rightBtn || !jumpBtn) return;

  function press(key) {
    keys[key] = true;
  }
  function release(key) {
    keys[key] = false;
  }

  
  leftBtn.addEventListener("mousedown", () => press("ArrowLeft"));
  leftBtn.addEventListener("mouseup", () => release("ArrowLeft"));
  leftBtn.addEventListener("mouseleave", () => release("ArrowLeft")); // stop if mouse leaves
  leftBtn.addEventListener("touchstart", e => { e.preventDefault(); press("ArrowLeft"); });
  leftBtn.addEventListener("touchend", () => release("ArrowLeft"));

  
  rightBtn.addEventListener("mousedown", () => press("ArrowRight"));
  rightBtn.addEventListener("mouseup", () => release("ArrowRight"));
  rightBtn.addEventListener("mouseleave", () => release("ArrowRight"));
  rightBtn.addEventListener("touchstart", e => { e.preventDefault(); press("ArrowRight"); });
  rightBtn.addEventListener("touchend", () => release("ArrowRight"));

  
  jumpBtn.addEventListener("mousedown", () => press("Space"));
  jumpBtn.addEventListener("mouseup", () => release("Space"));
  jumpBtn.addEventListener("mouseleave", () => release("Space"));
  jumpBtn.addEventListener("touchstart", e => { e.preventDefault(); press("Space"); });
  jumpBtn.addEventListener("touchend", () => release("Space"));
}

window.onload = () => {
  document.getElementById("playButton").addEventListener("click", () => {
    showRoundScreen();
  });

  const soundToggle = document.getElementById("soundToggle");
  const nextLevelButton = document.getElementById("nextLevelButton");
  nextLevelButton.addEventListener("click", skipToNextLevel);
  document.getElementById("completionContinue").addEventListener("click", showRoundScreen);
  document.getElementById("completionReplay").addEventListener("click", () => startLevel(level));
  document.getElementById("completionNext").addEventListener("click", () => startLevel(level + 1));

  soundToggle.addEventListener("click", () => {
    isMuted = !isMuted;
    soundEffects.forEach(sound => sound.muted = isMuted);
    soundToggle.textContent = isMuted ? "🔇" : "🔊";
    soundToggle.setAttribute("aria-label", isMuted ? "Unmute sound" : "Mute sound");
    soundToggle.title = isMuted ? "Unmute sound" : "Mute sound";
    soundToggle.setAttribute("aria-pressed", String(isMuted));
  });

  document.addEventListener("keydown", e => {
    const gameArea = document.getElementById("gameArea");
    const pauseKey = e.code === "KeyP" || e.code === "Escape";
    if (!pauseKey || e.repeat || !gameLoopStarted || transitioning || getComputedStyle(gameArea).display === "none") return;

    e.preventDefault();
    isPaused = !isPaused;
    keys = {};
  });

  setupMobileControls(); 
};

function startGame() {
  startLevel(0);
}

   w
function returnToMenu() {
  showRoundScreen();  
}
   