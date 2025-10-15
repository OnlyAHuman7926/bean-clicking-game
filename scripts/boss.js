class WhiteBean extends Bean {
  constructor() {
    super(Math.random() * width, Math.random() * height, 0, 1, 0, beanURLs.WHITE_2);
    this.teleports = 5;
    this.elem.addEventListener("pointerover", e => {
      if (this.teleports <= 0) return;
      this.teleports--;
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.elem.style.top = this.y + "px";
      this.elem.style.left = this.x + "px";
    })
    startBeanSpeed = minBeanSpeed = beanSpeed = 1e100;
  }
  click() {
    if (this.teleports > 0) return;
    else {
      if (boss) boss.health--;
      explode(this.x, this.y, 100);
      startBeanSpeed = minBeanSpeed = beanSpeed = 8000;
      beanTimer = 0;
      beanCount -= 75;
      super.click();
      
      if (boss.health % 1 == 0) {
        boss.upgrade();
      }
    }
  }
}
class ExplodingBean extends Bean {
  constructor(x, y) {
    super(x, y, 0, 1, 0, beanURLs.BROWN_1);
    
    const circle = document.createElement("div");
    circle.classList.add("gradient-circle");
    circle.style.width = circle.style.height = 0;
    circle.style.left = this.x + "px";
    circle.style.top = this.y + "px";
    circle.style.zIndex = 15;
    gameWindow.append(circle);
    this.circle = circle;
    
    this.time = 1500;
    this.t = 0;
    this.maxCircleSize = 150;
  }
  update(dt) {
    this.t += dt;
    this.circle.style.width = this.circle.style.height = this.maxCircleSize * (1 - this.t / this.time) + "px";
    if (this.t >= this.time) {
      this.destroy();
      new Explosion(this.x, this.y, undefined, 200);
    }
  }
  destroy() {
    this.circle.remove();
    this.circle = null;
    super.destroy();
  }
}
class Boss extends DangerousThing {
  constructor() {
    super(0, width / 2, height / 2, 2000, constructors.image(beanURLs.OLD));
    this.radius = 100;
    this.elem.style.width = this.elem.style.height = "200px";
    // this.elem.style.animation = "rotate 1.14514s infinite linear";
    this.health = 6;
    this.actionEnd = 2000;
    this.globalTime = 0;
    this.actionTime = 0;
    this.action = null;
    this.actionTriggers = 0;
    this.level = 0;
    this.direction = Math.random() * 2 * Math.PI;
    this.moving = false;
    this.speed = 600;
    this.trackSpeed = 1200;
    [this.velX, this.velY] = this.toLoc();
    
    this.turretCount = 4;
    
    const circle = document.createElement("div");
    circle.classList.add("gradient-circle");
    circle.style.width = circle.style.height = 0;
    circle.style.top = this.x + "px";
    circle.style.left = this.y + "px";
    circle.style.zIndex = 15;
    gameWindow.append(circle);
    this.circle = circle;
    this.maxCircleDiam = 350;
    this.zIndex = 40;
    
    this.bounceHandler = null;
    
    this.actionsList = [
      [
        [this.fire, 3, 6000],
        [this.track, 7, 4000],
      ], [
        [this.fire, 3, 6000],
        [this.track, 6, 4000],
        [this.brown, 1, 3750]
      ], [
        [this.fire, 3.5, 6000],
        [this.track, 6, 4000],
        [this.turret, 0.5, 0]
      ], [
        [this.fire, 3, 8000],
        [this.track, 5, 6000],
        [this.turret, 0.5, 0],
        [this.brown, 1.5, 7500]
      ], [
        [this.fire, 3, 8000],
        [this.track, 5, 6000],
        [this.turret, 0.5, 0],
        [this.brown, 1.5, 7500]
      ], [
        [this.fire, 4, 12000],
        [this.track, 4, 12000],
        [this.turret, 0.25, 0],
        [this.brown, 1.75, 7500]
      ]
    ]
  }
  update(dt) {
    if (this.moving) {
      if (this.bounceHandler) entityMove.apply(this, [dt, true, this.bounceHandler]);
      else entityMove.apply(this, [dt, true]);
    }
    
    this.globalTime += dt;
    this.actionTime += dt;
    if (this.globalTime >= this.actionEnd) {
      this.globalTime = 0;
      this.updateCircle(0);
      if (this.action) {
        this.action = null;
        this.actionEnd = 2000;
        this.bounceHandler = null;
        this.moving = false;
      } else {
        this.actionTime = 0;
        this.actionTriggers = 0;
        [this.action, this.actionEnd] = this.randomAction();
      }
    }
    if (this.action) this.action();
    
    this.circle.style.left = this.x + "px";
    this.circle.style.top = this.y + "px";
  }
  updateCircle(r) {
    // r is a value between 0 and 1;
    this.circle.style.width = this.circle.style.height = this.maxCircleDiam * r + "px";
  }
  updateSpeed(s) {
    // Changes velX and velY according to the speed s.
    this.velX = this.velX / this.speed * s;
    this.velY = this.velY / this.speed * s;
    this.speed = s;
  }
  
  upgrade() {
    this.level++;
    if (this.level >= 6) {
      this.die();
      return;
    }
    explode(this.x, this.y);
    this.actionEnd = 0;
    switch (this.level) {
      case 1:
        this.trackSpeed = 1250;
        break;
      case 2:
        this.trackSpeed = 1300;
        Bullet.speed = 550;
        break;
      case 3:
        this.trackSpeed = 1350;
        Bullet.speed = 600;
        this.turretCount = 5;
        break;
      case 4:
        this.trackSpeed = 1500;
        Bullet.speed = 800;
        break;
      case 5:
        for (let i = 0; i < 3; i++) {
          let theBean = new MovingDangerousBean();
          theBean.appear = Infinity;
          theBean.damage = 2000;
        }
        break;
      case 6:
        break;
      default:
        alert("An error occurred! The boss somehow reached level " + level);
    }
  }
  die() {
    new Explosion(this.x, this.y, undefined, 114514);
  }
  
  fire() {
    if (!this.actionTriggers) {
      this.fireTime = 0;
      this.fireAngle = 0;
      if (this.level >= 4) this.moving = true;
    }
    if (this.actionTime >= this.fireTime) {
      this.actionTriggers++;
      this.actionTime = 0;
      this.fireTime = 125;
      Bullet.bomb(this.fireAngle, this.x, this.y, 12);
      this.fireAngle = (this.fireAngle + 360 / 12 * 0.618) % 360;
    }
  }
  track() {
    if (!this.actionTriggers) {
      this.trackTime = 1000;
      this.bounceHandler = () => Bullet.bomb(Math.random() * 360, this.x, this.y, 12);
    } else {
      this.moving = true;
    }
    this.updateCircle(1 - this.actionTime / this.trackTime);
    if (this.trackTime && this.actionTime < this.trackTime) {
      this.updateSpeed(this.trackSpeed * Math.max(1 - this.actionTime / this.trackTime, 0));
    }
    if (this.actionTime >= this.trackTime) {
      this.actionTime = 0;
      this.trackTime = 1000;
      [this.velX, this.velY] = this.toLoc(mouse.x, mouse.y);
      this.actionTriggers++;
    }
  }
  toLoc(x, y) {
    // Returns velX, velY so that the boss moves to the location.
    if (!x && !y) return [Math.cos(this.direction) * this.speed, Math.sin(this.direction) * this.speed];
    let dx = x - this.x;
    let dy = y - this.y;
    let r = Math.sqrt(dx ** 2 + dy ** 2);
    return [dx / r * this.speed, dy / r * this.speed];
  }
  turret() {
    explode(this.x, this.y, undefined, "orange");
    for (let i = 0; i < this.turretCount; i++) {
      let bean = new BulletBean();
      // bean.health = 10;
    }
  }
  brown() {
    if (!this.actionTriggers) {
      this.brownTime = 0;
      this.moving = true;
    }
    if (this.actionTime >= this.brownTime) {
      this.actionTriggers++;
      this.actionTime = 0;
      this.brownTime = 750;
      new ExplodingBean();
    }
  }
  
  randomAction() {
    let actions = this.actionsList[this.level];
    let total = 0;
    for (let [,m] of actions) total += m;
    let n = Math.random() * total;
    for (let [a, m, t] of actions) {
      n -= m;
      if (n < 0) return [a, t];
    }
  }
  
  destroy() {
    this.circle.remove();
    this.circle = null;
    super.destroy();
    
    // If player successfully defeated boss, do things
  }
}