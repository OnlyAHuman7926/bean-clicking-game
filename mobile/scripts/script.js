const gameWindow = document.getElementById("game-window");
const scoreDisp = document.getElementById("score-disp");
const highestScoreDisp = document.getElementById("highest-score-disp");
const beanCountDisp = document.getElementById("progress-num");
const beanCountBar = document.getElementById("progress");
const beanSpeedDisp = document.getElementById("bean-speed");
const frameRateDisp = document.getElementById("framerate-disp");
const effectBar = document.getElementById("effect-bar");
const ctrlBar = document.getElementById("ctrl-bar")
const highestScore = localStorage.getItem('highest-score');

const [width, height] = [
  parseInt(getComputedStyle(gameWindow).width),
  parseInt(getComputedStyle(gameWindow).height),
];
GoldBean.goldRadius = Math.sqrt(width * height / maxGoldCount / Math.PI);

let mouse = {
  x: 0,
  y: 0,
};

const gameWindowClientRect = gameWindow.getBoundingClientRect();
document.addEventListener("pointermove", (e) => {
  mouse.x = event.clientX - gameWindowClientRect.left; // X坐标
  mouse.y = event.clientY - gameWindowClientRect.top; // Y坐标
});

let cleanMode = false;

let score;
let beanCount, maxBeanCount;
let gameStart, paused, blurred;
let newBeanInterval;
let startBeanSpeed, minBeanSpeed, beanSpeed;
let currentHighestScore;

let hardMode;
let bossMode;
let boss;

let freezeMultiplier;
let scoreMultiplier;
let luckyMultiplier;
let damageMultiplier;

let globalTime;

let shield = false;
let scaleEffect = 1;

highestScoreDisp.textContent = currentHighestScore = highestScore;

function changeGameStatus() {
  paused = !paused;
  for (let child of ctrlBar.children) child.classList.toggle("inactive");
}

document.addEventListener("mouseover", function a() {
  if (bgm.paused) {
    bgm.play();
    removeEventListener("mouseover", a);
  }
});

function updateScore() {
  if (bossMode) {
    scoreDisp.textContent = (boss ? boss.health : 30) + "/ 30";
  } else {
    scoreDisp.textContent = score;
  }
  beanSpeed = (startBeanSpeed - minBeanSpeed) * 0.999 ** score + minBeanSpeed;
  MovingBean.movingBeanSpeed = 200 + (hardMode ? 40 : 0) + (hardMode ? 4 : 2) * score ** 0.5;
  SilverBean.speed = 280 + (hardMode ? 40 : 0) + (hardMode ? 6 : 3) * score ** 0.5;
  GlassBean.movingBeanSpeed = 100 + (hardMode ? 100 : 0) + (hardMode ? 2 : 1) * score ** 0.5;
  TaroBean.movingBeanSpeed = 100 + (hardMode ? 100 : 0) + (hardMode ? 2 : 1) * score ** 0.5;
  MovingDangerousBean.movingBeanSpeed = 200 + (hardMode ? 20 : 0) + (hardMode ? 6 : 3) * score ** 0.5;
  // beanSpeedDisp.textContent = ((1 / beanSpeed) * 1000).toFixed(2) + ", " +Math.floor(MovingBean.movingBeanSpeed);
}

function updateBeanCount() {
  if (beanCount < 0) beanCount = 0;
  if (beanCount >= maxBeanCount && !shield) lose();
  
  /*let beanCountContent = beanCount.toFixed(2).split(".");
  if (beanCountContent[1] == '00') beanCountContent[1] = '';
  else if (beanCountContent[1] && beanCountContent[1][1] == '0') beanCountContent[1] = beanCountContent[1][0];
  
  beanCountDisp.textContent = `${beanCountContent[0] + (beanCountContent[1] ? '.' + beanCountContent[1] : '')} / ${maxBeanCount}`;*/
  beanCountDisp.textContent = Math.round(beanCount) + " / " + maxBeanCount;
  beanCountBar.style.width = (beanCount / maxBeanCount) * 100 + "%";
}

let beanTimer = 0;
function updateNewBean(dt) {
  beanTimer += dt * freezeMultiplier;
  if (beanTimer > beanSpeed) {
    newBean();
    beanTimer = 0;
  }
}

let frameTime = globalTime;
let frames = 0;

function globalUpdate() {
  let now = Date.now();
  let dt = now - globalTime;
  globalTime = now;
  frames += 1;
  if (globalTime - frameTime > 250) {
    frameRateDisp.textContent = "FPS: " + Math.round(1000 / dt);
    frameTime = globalTime;
    frames = 0;
  }
  if (!(paused || blurred)) {
    updateScore();
    updateBeanCount();
    updateAllBeans(dt);
    updateNewBean(dt);
    updateAllEffects(dt);
    updateAnimations(dt);
  }
  if (blurred) blurred = false;
  if (gameStart) requestAnimationFrame(globalUpdate);
}

function start(hard) {
  hardMode = hard;
  score = 0;
  beanCount = 0;
  updateBeanCount();
  updateScore();
  gameStart = true;
  paused = blurred = false;
  freezeMultiplier = 1;
  scoreMultiplier = 1;
  luckyMultiplier = 1;
  damageMultiplier = 1;
  frameTime = globalTime = Date.now();
  bossMode = false;
  
  maxBeanCount = hardMode ? 450 : 500;
  startBeanSpeed = 400 / 2;
  minBeanSpeed = (hardMode ? 150 : 200) / 2;
  Bullet.speed = hardMode ? 750 : 500;
  
  if (hard) scoreDisp.style.color = "red";
  else scoreDisp.style.color = "#fff";
  
  glassBlocks = [];
  
  updateScore();
  updateBeanCount();
  
  requestAnimationFrame(globalUpdate);

  document.getElementById("lose").style.opacity = "0";
  document.getElementById("lose").style.pointerEvents = "none";
  setTimeout(() => {
    document.getElementsByClassName("game-title")[0].style.display = "none";
    [...document.getElementsByClassName("lose-text")].forEach(
      (element) => (element.style.display = "block")
    );
    document.getElementById("final-score").textContent = score;
  }, 500);
}
function startBoss() {
  score = 0;
  beanCount = 0;
  gameStart = true;
  paused = blurred = false;
  freezeMultiplier = 1;
  scoreMultiplier = 1
  frameTime = globalTime = Date.now();
  bossMode = true;
  
  maxBeanCount = 500;
  startBeanSpeed = minBeanSpeed = 6000;
  Bullet.speed = 500;
  
  scoreDisp.style.color = "red";
  updateBeanCount();
  
  
  updateBeanCount();
  updateScore();
  boss = new Boss();
  requestAnimationFrame(globalUpdate);

  document.getElementById("lose").style.opacity = "0";
  document.getElementById("lose").style.pointerEvents = "none";
  setTimeout(() => {
    document.getElementsByClassName("game-title")[0].style.display = "none";
    [...document.getElementsByClassName("lose-text")].forEach(
      (element) => (element.style.display = "block")
    );
    document.getElementById("final-score").textContent = score;
  }, 500);
}

function lose() {
  if (!highestScore || score > parseInt(currentHighestScore)) {
      localStorage.setItem('highest-score', score);
      highestScoreDisp.textContent = currentHighestScore = score;
  }
  document.getElementById("highest-score").textContent = currentHighestScore;
  document.getElementById("final-score").textContent = score;

  clearInterval(newBeanInterval);
  for (let bean of allBeans()) bean.destroy();
  for (let i = effectBar.children.length - 1; i >= 0; i--) {
    let e = effectBar.children[i];
    e.parentClass.revoke();
  }
  for (let block of glassBlocks) block.element.remove();
  let loseStyle = document.getElementById("lose").style;
  loseStyle.display = loseStyle.pointerEvents = loseStyle.opacity = "";
  document.documentElement.style.setProperty("--freeze-opacity", 0);
  paused = true;
  gameStart = false;
}

document.getElementById("start-normal").onclick = () => start(false);
document.getElementById("start-hard").onclick = () => start(true);
document.getElementById("start-boss").onclick = e => {
  if (e.ctrlKey || e.metaKey) startBoss();
  else alert("Boss coming soon!")
}

window.addEventListener("blur", () => {
  blurred = true;
  // When focused again, skips the current update (very large dt) and set blurred to false.
})

window.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key == 'y' && !e.repeat) {
    cleanMode = true;
    bgm.muted = true;
    document.body.style.backgroundImage = "none";
    let styles = document.createElement("style");
    styles.innerHTML = "body::after { background-image: none; }"
    document.body.append(styles);
  }
})