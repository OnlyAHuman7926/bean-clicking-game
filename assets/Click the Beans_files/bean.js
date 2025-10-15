const maxGoldCount = 2;
const maxBronzeCount = 2;
let goldLocs = [];
let bronzeLocs = [];
let bronzeLines = [];

function allBeans() {
  return Array.from(gameWindow.children)
    .map((bean) => bean.parentClass)
    .filter((x) => x instanceof Bean || x instanceof DangerousThing);
}

function inGold(x, y, dt = 16) {
  let i = 0;
  for (let gold of goldLocs) {
    if (Math.sqrt((x - gold.x) ** 2 + (y - gold.y) ** 2) <= GoldBean.goldRadius) {
      i++;
      gold.health -= dt;
    }
  }
  return i;
}
function passBronze(x1, y1, x2, y2) {
  // all kinds of things
  return false;
}
function randPos(x, y, r = 0) {
  /* A position is valid if:
   * It is not in any glass blocks
   * It is not in the area near gold beans
   * It is not on the boss
   * It is not close to the mouse
  */
  let rand = false;
  while (true) {
    if (rand || x === undefined) x = Math.random() * width;
    if (rand || y === undefined) y = Math.random() * height;
    rand = true;
    if (inGold(x, y)) continue;
    let colliding = false;
    for (let block of glassBlocks) {
      if (isColliding({x: x, y: y, radius: r * scaleEffect}, block)) {
        colliding = true;
        break;
      }
    }
    if (bossMode) {
      let dists = Math.sqrt((x - boss.x) ** 2 + (y - boss.y) ** 2);
      if (dists <= boss.radius * scaleEffect) continue;
    }
    let mouseDist = Math.sqrt((x - mouse.x) ** 2 + (y - mouse.y) ** 2);
    if (mouseDist < Math.min(Math.max(width, height) / 3, r * 2 * scaleEffect)) continue;
    if (!colliding) break;
  }
  return [x, y];
}

let glassBlocks = [];
function createGlassBlock(x, y, rotateAngle) {
    const glass = document.createElement("div");
    glass.className = "glass-block";
    glass.style.left = x + "px";
    glass.style.top = y + "px";
    let w = Math.max(width, height) / 3;
    let h = w / 10;
    glass.style.width = w + 'px';
    glass.style.height = h + 'px';
    glass.style.transform = `rotate(${rotateAngle}deg)`;
    gameWindow.appendChild(glass);

    const theta = (rotateAngle * Math.PI) / 180;
    const glassBlock = {
        element: glass,
        cx: x, // center x
        cy: y, // center y
        width: w,
        height: h,
        angle: theta, // rotate angle(rad)
        durability: 100,
    };
  glass.parentClass = glassBlock;
    glassBlocks.push(glassBlock);
    return glassBlock;
}
function isColliding(bean, block) {
  // 将豆子圆心转换到玻璃块的局部坐标系
  const dx = bean.x - block.cx;
  const dy = bean.y - block.cy;
  const localX = dx * Math.cos(block.angle) + dy * Math.sin(block.angle);
  const localY = -dx * Math.sin(block.angle) + dy * Math.cos(block.angle);

  // 计算豆子边缘到玻璃块边缘的距离
  const closestX = Math.max(-block.width / 2, Math.min(localX, block.width / 2));
  const closestY = Math.max(-block.height / 2, Math.min(localY, block.height / 2));

  // 计算豆子边缘到玻璃块边缘的实际距离
  const distanceX = localX - closestX;
  const distanceY = localY - closestY;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  // 如果距离小于豆子半径，则发生碰撞
  return distance < bean.radius * scaleEffect;
}
function handleGlassCollision(bean, block) {
  let damage;
  if (bean instanceof DangerousThing) {
    if (bean.triggered) return;
    if (bean.blockedByGlass) {
      damage = bean.damage ? bean.damage / 10 : 5;
      bean.elem.style.animation = "explode 0.25s ease-in-out forwards";
      bean.velX = bean.velY = 0;
      bean.triggered = true;
      setTimeout(() => {
        bean.destroy();
      }, 250);
    } else damage = 114514;
  } else {
    // 将豆子圆心转换到玻璃块的局部坐标系
    const dx = bean.x - block.cx;
    const dy = bean.y - block.cy;
    const localX = dx * Math.cos(block.angle) + dy * Math.sin(block.angle);
    const localY = -dx * Math.sin(block.angle) + dy * Math.cos(block.angle);

    // 找到最近的玻璃块边缘点
    const closestX = Math.max(-block.width / 2, Math.min(localX, block.width / 2));
    const closestY = Math.max(-block.height / 2, Math.min(localY, block.height / 2));

    // 计算碰撞法线
    let normalX = localX - closestX;
    let normalY = localY - closestY;
    const length = Math.max(Math.sqrt(normalX * normalX + normalY * normalY), 1e-10);    // prevents division by 0
    normalX /= length;
    normalY /= length;

    // 将法线转换回全局坐标系
    const globalNormalX = normalX * Math.cos(block.angle) - normalY * Math.sin(block.angle);
    const globalNormalY = normalX * Math.sin(block.angle) + normalY * Math.cos(block.angle);

    // 反射速度（完全弹性碰撞）
    const dot = bean.velX * globalNormalX + bean.velY * globalNormalY;
    bean.velX -= 2 * dot * globalNormalX;
    bean.velY -= 2 * dot * globalNormalY;

    damage = 1;
  }

  block.durability -= damage;
  if (block.durability <= 0) {
    block.element.style.animation = "fade 0.25s ease-in-out forwards";
    const index = glassBlocks.indexOf(block);
    if (index !== -1) glassBlocks.splice(index, 1);
    setTimeout(() => {
      block.element.remove();
    }, 250);
  }
}

function entityMove(dt, bounce, bounceHandler = () => {}) {
  // Bind this to the function to use
  let goldMultiplier = 2 ** -inGold(this.x, this.y);
  if (this instanceof DangerousThing) goldMultiplier **= (hardMode ? 4.2 : 4);
  this.x += (this.velX * dt / 1000) * freezeMultiplier * goldMultiplier;
  this.y += (this.velY * dt / 1000) * freezeMultiplier * goldMultiplier;
  if (bounce) {
    if (this.x < 0) {
      this.x = 0;
      this.velX *= -1;
      bounceHandler();
    } else if (this.x > width) {
      this.x = width;
      this.velX *= -1;
      bounceHandler();
    }
    if (this.y < 0) {
      this.y = 0;
      this.velY *= -1;
      bounceHandler();
    } else if (this.y > height) {
      this.y = height;
      this.velY *= -1;
      bounceHandler();
    }
  }
  if (bounce || this instanceof DangerousThing) {
    for (const block of glassBlocks) {
      if (!block || block.durability <= 0) continue;

      if (isColliding(this, block)) {
        this.x -= this.velX * dt / 1000;    // These 2 lines are necessary to prevent being stuck in glass blocks
        this.y -= this.velY * dt / 1000;
        handleGlassCollision(this, block);
        collisionOccurred = true;
        break; // 只处理第一个碰撞
      }
    }
  }
  if (this.elem) {
    this.elem.style.top = this.y + "px";
    this.elem.style.left = this.x + "px";
  }
}

class Bean {
  static radius = 55 / 2;
  constructor(x, y, bc, health, score, png) {
    this.radius = this.constructor.radius;
    let r = this.radius;
    
    [x, y] = randPos(x, y, r);
    
    this.health = health;
    this.x = x;
    this.y = y;
    this.beanCount = bc;
    this.score = score;
    beanCount += bc;

    const elem = document.createElement("div");
    elem.style.backgroundImage = `url(${png})`;
    elem.classList.add("bean");
    elem.style.top = y + "px";
    elem.style.left = x + "px";
    gameWindow.append(elem);
    this.elem = elem;
    this.elem.parentClass = this;
    this.elem.addEventListener("pointerdown", (e) => {
      // button == 0 if left mouse button
      if (e.button == 0 && !paused && e.pointerType == "mouse") this.click();
    });
  }
  update(dt) {}
  click() {
    this.health -= damageMultiplier;
    if (this.health <= 0) {
      beanCount -= this.beanCount;
      score += this.score * scoreMultiplier;
      playAudio(audios.SCORE);
      this.destroy();
    }
  }
  destroy() {
    // Pass a parameter to indicate whether some special effects are activated.
    if (this.elem) this.elem.remove();
    this.elem = null;
  }
}
class NormalBean extends Bean {
  constructor(x, y) {
    super(x, y, 10, 1, 1, beanURLs.GREEN_1);
  }
}
class Giant extends Bean {
  constructor(x, y) {
    super(x, y, 15, 2, 3, beanURLs.GREEN_2);
    this.elem.style.scale = "calc(var(--scale-effect) * 1.5)";
    this.radius = Bean.radius * 1.5;
    this.elem.classList.add("giant");
  }
}
class MovingBean extends Bean {
  constructor(x, y, speed = MovingBean.movingBeanSpeed) {
    super(x, y, 10, 1, 2, beanURLs.YELLOW_1);
    let angle = Math.random() * Math.PI * 2;
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;
  }
  // @Override
  update(dt) {
    entityMove.apply(this, [dt, true]);
  }
}
class OrthoMovingBean extends Bean {
  static d(n, s) {
    // Returns a velocity(x, y) vector with magnitude s.
    let angle = Math.PI / 2 * n;
    let velX = Math.round(Math.cos(angle)) * s;  // the trig functions are all integers
    let velY = Math.round(Math.sin(angle)) * s;
    return [velX, velY];
  }
  constructor(x, y, speed = MovingBean.movingBeanSpeed * 1.4514) {
    super(x, y, 10, 1, 3, beanURLs.YELLOW_1);
    let n = Math.floor(Math.random() * 4);
    this.n = n;
    [this.velX, this.velY] = OrthoMovingBean.d(n, speed);
    this.speed = speed;
    
    this.t = 0;
    this.changeDirTime = Math.random() * 1600 + 200;
  }
  // @Override
  update(dt) {
    this.t += dt * freezeMultiplier * 2 ** -inGold(this.x, this.y);
    if (this.t >= this.changeDirTime) {
      this.t = 0;
      this.changeDirTime = Math.random() * 2500 + 500;
      let newN = this.n;
      while (newN == this.n) newN = Math.floor(Math.random() * 4);
      this.n = newN;
      [this.velX, this.velY] = OrthoMovingBean.d(newN, this.speed);
    }
    entityMove.apply(this, [dt, true, () => {
      this.n = (this.n + 2) % 4;
    }]);
  }
}
class BulletBean extends Bean {
  constructor(x, y) {
    super(x, y, 10, 5, 8, beanURLs.ORANGE_1);
    this.bulletsFired = 0;
    this.nextBulletTime = 1000;
    this.bulletTime = 2500;
    this.timer = 0;
  }
  update(dt) {
    this.timer += dt * freezeMultiplier;
    if (this.timer > this.nextBulletTime) {
      this.elem.style.backgroundImage = `url("${beanURLs.ORANGE_2}")`;

      // atan2 is such an excellent thing
      let radDir = Math.atan2(mouse.y - this.y, mouse.x - this.x);
      let dir = (radDir * 180) / Math.PI;
      dir = (dir + 360) % 360;
      let newX = this.x + (Math.cos(radDir) * 55) / 2;
      let newY = this.y + (Math.sin(radDir) * 55) / 2;
      new Bullet(dir, newX, newY);

      this.timer = 0;
      this.bulletsFired++;
      if (this.bulletsFired % 5) this.nextBulletTime = 125;
      else {
        this.nextBulletTime = this.bulletTime - 500;
        this.elem.style.backgroundImage = `url("${beanURLs.ORANGE_1}")`;
      }
    }
  }
}

class HealingBean extends Bean {
  constructor(x, y) {
    super(x, y, 10, 3, 1, beanURLs.MINT_2);
    this.t = 0;
  }
  update(dt) {
    this.t += dt * freezeMultiplier;
    if (10000 - this.t <= 250) this.elem.style.animation = "fade 0.25s ease-in-out forwards";
    if (this.t >= 10000) {
      beanCount -= this.beanCount;
      super.destroy(); 
    }
  }
  destroy(effect = true) {
    if (effect) beanCount -= 50;
    super.destroy();
  }
}
class FreezeBean extends Bean {
  static moveSpeed = 50;
  constructor(x, y) {
    super(x, y, 10, 3, 1, beanURLs.BLUE_2);
    this.t = 0;
  }
  update(dt) {
    this.t += dt * freezeMultiplier;
    if (10000 - this.t <= 250) this.elem.style.animation = "fade 0.25s ease-in-out forwards";
    if (this.t >= 10000) {
      beanCount -= this.beanCount;
      super.destroy(); 
    }
  }
  destroy(effect = true) {
    if (effect) new Freeze(5000, 0.6);
    super.destroy();
  }
}
class DoubleBean extends Bean {
  static moveSpeed = 50;
  constructor(x, y) {
    super(x, y, 10, 3, 1, beanURLs.PINK_2);
    this.t = 0;
  }
  update(dt) {
    this.t += dt * freezeMultiplier;
    if (10000 - this.t <= 250) this.elem.style.animation = "fade 0.25s ease-in-out forwards";
    if (this.t >= 10000) {
      beanCount -= this.beanCount;
      super.destroy(); 
    }
  }
  destroy(effect = true) {
    if (effect) new ScoreMultiply(10000, 2);
    super.destroy();
  }
}
class GlassBean extends Bean {
  constructor(x, y, speed = GlassBean.movingBeanSpeed) {
    super(x, y, 10, 3, 1, beanURLs.COLORLESS_2);
    const angle = Math.random() * Math.PI * 2;
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;
    this.elem.classList.add("glass-bean");
    this.rotate = 0;
    this.t = 0;
  }

  update(dt) {
    entityMove.apply(this, [dt, true]);
    this.t += dt * freezeMultiplier;
    this.rotate += 360 / 5 * dt / 1000 * freezeMultiplier;
    this.elem.style.rotate = this.rotate + 'deg';
    
    if (10000 - this.t <= 250) this.elem.style.animation = "fade 0.25s ease-in-out forwards";
    if (this.t >= 10000) {
      beanCount -= this.beanCount;
      super.destroy(); 
    }
  }

  destroy(effect = true) {
    if (effect) createGlassBlock(this.x, this.y, (this.rotate) % 360 + 90);
    super.destroy();
  }
}
class LuckyBean extends Bean {
  constructor(x, y) {
    super(x, y, 10, 3, 1, beanURLs.METALLIC_GREEN_2);
    this.t = 0;
    this.elem.style.boxShadow = "0 0 10px #72d631";
  }
  update(dt) {
    this.t += dt * freezeMultiplier;
    if (10000 - this.t <= 250) this.elem.style.animation = "fade 0.25s ease-in-out forwards";
    if (this.t >= 10000) {
      beanCount -= this.beanCount;
      super.destroy(); 
    }
  }
  destroy(effect = true) {
    if (effect) new Lucky(10000, 2);
    super.destroy();
  }
}
class ShieldBean extends Bean {
  constructor(x, y) {
    super(x, y, 10, 3, 1, beanURLs.GRAY_2);
    this.t = 0;
  }
  update(dt) {
    this.t += dt * freezeMultiplier;
    if (10000 - this.t <= 250) this.elem.style.animation = "fade 0.25s ease-in-out forwards";
    if (this.t >= 10000) {
      beanCount -= this.beanCount;
      super.destroy(); 
    }
  }
  destroy(effect = true) {
    if (effect) Shield.start(15000);
    super.destroy();
  }
}

class GoldBean extends Bean {
  // The size of Goldbean effects depend on the screen size.
  // I currently plan it to be at most half the screen;
  // See script.js for details.
  static goldRadius;
  constructor(x, y) {
    super(x, y, 0, 1, 1, beanURLs.GOLD_2);

    this.elem.style.zIndex = "16";
    this.beanCountTimer = 0;
    
    goldLocs.push(this);

    const circle = document.createElement("div");
    circle.classList.add("circle");
    circle.style.background =
      "radial-gradient(rgba(255, 246, 197, 0.2), rgba(208, 177, 94, 0.4) 25%, rgba(206, 159, 79, 0.6) 50%, rgba(199, 170, 104, 0.8) 100%)";
    circle.style.width = circle.style.height =
      this.constructor.goldRadius * 2 + "px";
    circle.style.top = this.y + "px";
    circle.style.left = this.x + "px";
    this.circle = circle;
    gameWindow.append(circle);


    this.health = 160000;
    
    let speed = 100;
    let angle = Math.random() * Math.PI * 2;
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;
  }
  update(dt) {
    this.health -= dt;
    this.circle.style.opacity = this.health / 160000;
    if (this.health < 0) this.destroy();
  }
  destroy() {
    goldLocs.splice(this, 1);
    if(this.circle) this.circle.remove();
    this.circle = null;
    super.destroy();
  }
}
class SilverBean extends Bean {
  static speed = 280;
  constructor(x, y) {
    super(x, y, 0, 10, 5, beanURLs.GOLD_2);
    this.elem.style.filter = "grayscale(1)";
    
    let speed = this.constructor.speed;
    let angle = Math.random() * Math.PI * 2;
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;
    
    freezeMultiplier *= 1.1;
    this.speedup = 1.1;

    damageMultiplier *= 2;
  }
  update(dt) {
    entityMove.apply(this, [dt, true]);
    let increase = (2 ** (1/60)) ** (dt / 1000);    // speed doubles every minute
    freezeMultiplier *= increase;
    this.speedup *= increase;
  }
  destroy() {
    freezeMultiplier /= this.speedup;
    damageMultiplier /= 2;
    super.destroy();
  }
}
class BronzeBean extends Bean {
  constructor(x, y) {
    super(x, y, 0, 1, 1, beanURLs.GOLD_2);
    this.elem.style.filter = "hue-rotate(-30deg)";

    this.locObj = [this.x, this.y];
    bronzeLocs.push(this.locObj);
    this.elem.style.zIndex = "16";
    this.beanCountTimer = 0;

    this.increments = 0;
    this.addBeanCount = hardMode ? 333 : 500;
    
    for (let l of bronzeLocs) {
      if (l == this.locObj) continue;
      let line = document.createElement("div");
      line.classList.add("bronze-line");
      let dist = Math.sqrt((l[0] - this.x) ** 2 + (l[1] - this.y) ** 2);
      line.style.width = dist + "px";
      let angle = Math.atan2(l[1] - this.y, l[0] - this.x);
      line.style.rotate = angle + "rad";
      let midpoint = [(l[0] + this.x) / 2, (l[1] + this.y) / 2];
      line.style.top = midpoint[1] + "px";
      line.style.left = midpoint[0] + "px";
      gameWindow.append(line);
      
      bronzeLines.push({
        start: l,
        end: this.locObj,
        elem: line
      })
    }
  }
  update(dt) {
    if (score >= 800) {
      entityMove.apply(this, [dt, true]);
      this.circle.style.top = this.y + "px";
      this.circle.style.left = this.x + "px";
    }
    this.beanCountTimer += dt * freezeMultiplier;
    if (this.beanCountTimer >= this.addBeanCount) {
      this.beanCountTimer -= this.addBeanCount;
      let b = 1 + Math.floor(this.increments / 20);
      this.beanCount += b;
      this.increments++;
      // beanCount += b;
    }
  }
  destroy() {
    for (let i = bronzeLines.length - 1; i >= 0; i--) {
      let l = bronzeLines[i];
      if (l.start == this.locObj || l.end == this.locObj) {
        l.elem.remove();
        bronzeLines.splice(bronzeLines.indexOf(l), 1);
      }
    }
    bronzeLocs.splice(bronzeLocs.indexOf(this.locObj), 1);
    this.locObj = null;
    super.destroy();
  }
}
class TaroBean extends Bean {
  constructor(x, y, speed = TaroBean.movingBeanSpeed) {
    super(x, y, 10, 1, 1, beanURLs.TARO_2);
    let angle = Math.random() * Math.PI * 2;
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;
    this.t = 0;
    this.elem.style.boxShadow = "0 0 10px #fa8cff";
  }
  // @Override
  update(dt) {
    entityMove.apply(this, [dt, true]);
    this.t += dt;
    if (10000 - this.t <= 250) this.elem.style.animation = "fade 0.25s ease-in-out forwards";
    if (this.t >= 10000) {
      beanCount -= this.beanCount;
      super.destroy(); 
    }
  }
  destroy(effect = true) {
    if (effect) {
      let thisBeanCount = this.beanCount;
      let badChance = 0.4 * (1 - beanCount / maxBeanCount);
      let normalEffectDist = [
        [() => new Distortion(20000), badChance],
        [() => new Freeze(8000, 1 / 65536), (1 - badChance) / 3], // 1/65536 avoids rounding errors
        [() => (beanCount = (beanCount + thisBeanCount / 0.4) * 0.4), (1 - badChance) / 3],
        [() => Scale.start(30000), (1 - badChance) / 3]
      ];
      let hardEffectDist = [
        [() => new Distortion(20000), (badChance *= 0.8, badChance)],
        [() => new Freeze(5000, 1 / 65536), (1 - badChance) / 2],
        [() => (beanCount = (beanCount + thisBeanCount / 0.6) * 0.6), (1 - badChance) / 3],
        [() => Scale.start(20000), (1 - badChance) / 3]
      ];
      let weights = hardMode ? hardEffectDist : normalEffectDist;
      let total = 0;
      for (let [, m] of weights) total += m;
      let n = Math.random() * total;
      for (let [effect, m] of weights) {
        n -= m;
        if (n < 0) {
          effect();
          break;
        }
      }
    }
    super.destroy();
  }
}

class BlackBean extends Bean {
  constructor(x, y) {
    super(x, y, 25, 3, 15, beanURLs.WHITE_1);
    this.elem.style.filter = "invert(1)";
    
    this.r = Math.min(width, height) * 2 / 3;
    let circle = document.createElement("div");
    circle.classList.add("dashed-circle");
    circle.classList.add("scale-effect");
    circle.style.borderColor = "black";
    circle.style.width = circle.style.height = this.r * 2 + "px";
    circle.style.top = this.y + "px";
    circle.style.left = this.x + "px";
    circle.style.display = "none";
    gameWindow.append(circle);
    this.circle = circle;
    
    let speed = 100;
    let angle = Math.random() * Math.PI * 2;
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;
    
    this.gt = 0;
    this.gtMax = 2000;
    this.mingRadius = 55;    // Minimum grenade radius
  }
  update(dt) {
    entityMove.apply(this, [dt, true]);
    this.circle.style.top = this.y + "px";
    this.circle.style.left = this.x + "px";
    this.gt += dt * freezeMultiplier;
    if (this.gt >= this.gtMax && Math.sqrt((this.x - mouse.x) ** 2 + (this.y - mouse.y) ** 2) >= this.mingRadius) {
      this.gt = 0;
      this.elem.style.backgroundImage = `url("${beanURLs.WHITE_1}")`;
      let g = Grenade.to(this.x, this.y, mouse.x, mouse.y);
      if (g.maxT < 1000) g.maxT = 1000;
    } else if (this.gtMax - this.gt <= 500) {
      this.elem.style.backgroundImage = `url("${beanURLs.WHITE_2}")`;
    }
  }
  click() {
    super.click();
    if (this.health > 0) [this.x, this.y] = randPos(undefined, undefined, 55 / 2);
    if (this.health == 1) this.circle.style.display = null;
  }
  destroy(effect = true) {
    if (this.circle) this.circle.remove();
    this.circle = null;
    if (effect) {
      for (let bean of allBeans()) {
        let d = Math.sqrt((bean.x - this.x) ** 2 + (bean.y - this.y) ** 2);
        if (d <= this.r * scaleEffect + (bean.radius ?? 0) * scaleEffect) {
          if (bean.beanCount) beanCount -= bean.beanCount * 0.5;
          bean.destroy(false);
        }
      }
      explode(this.x, this.y, this.r * scaleEffect, "black", this.r * scaleEffect / 3);
    }
    super.destroy();
  }
}

function updateAllBeans(dt) {
  for (let bean of allBeans()) {
    if (bean instanceof Bean || bean instanceof DangerousThing) {
      bean.update(dt);
    }
  }
}

const normalWeights = [
  [NormalBean, 60],
  [MovingBean, 10],
  [OrthoMovingBean, 5],
  [Giant, 5],
  [MovingDangerousBean, 10],
  [BulletBean, 2],
  [HealingBean, 2],
  [FreezeBean, 2],
  [DoubleBean, 2],
  [LuckyBean, 0.75], 
  [GoldBean, 0.75],
  [SilverBean, 0.75],
  [TaroBean, 0.5],
  [BlackBean, 1],
  [BronzeBean, 0],
  [ShieldBean, 1]
];

const hardWeights = [
  [NormalBean, 60],
  [MovingBean, 8],
  [Giant, 5],
  [OrthoMovingBean, 8],
  [MovingDangerousBean, 15],
  [BulletBean, 4],
  [HealingBean, 1],
  [FreezeBean, 1],
  [DoubleBean, 1],
  [LuckyBean, 0.75],
  [GoldBean, 0.75],
  [SilverBean, 0.75],
  [TaroBean, 0.5],
  [BlackBean, 2],
  [BronzeBean, 0]
];

let normalBeans = [
  [NormalBean, MovingBean, OrthoMovingBean],
  [13, 3, 1]
]
let goodBeans = [
  [HealingBean, FreezeBean, DoubleBean, ShieldBean, TaroBean],
  [2, 2, 2, 2, 1, 1]
]
let metalBeans = [
  [GoldBean, SilverBean, BronzeBean],
  [1, 1, 1]
]
let badBeans = [
  [MovingDangerousBean, BulletBean, BlackBean],
  [10, 1, 1]
]

let newWeights = [
  [normalBeans, goodBeans, metalBeans, badBeans],
  [
    logistic
  ]
]

function newBean() {
  if (gameStart) {
    let weights = hardMode ? hardWeights : normalWeights;
    for (let i = 0; i < weights.length; i++) {
      if (goodBeans[0].includes(weights[i][0])) weights[i][1] *= luckyMultiplier;
    }
    if (bossMode) weights = [[WhiteBean, 1]];
    
    let total = 0;
    for (let [, m] of weights) total += m;
    
    let n = Math.random() * total;
    for (let [bean, m] of weights) {
      n -= m;
      if (n < 0) {
        /*let x = Math.random() * width,
          y = Math.random() * height;
        while (inGold(x, y)) {
          x = Math.random() * width;
          y = Math.random() * height;
        }*/
        if (bean == GoldBean && goldLocs.length >= maxGoldCount)
          bean = NormalBean;
        // new bean(x, y);
        new bean();
        break;
      }
    }
    for (let i = 0; i < weights.length; i++) {
      if (goodBeans[0].includes(weights[i][0])) weights[i][1] /= luckyMultiplier;
    }
  }
}
