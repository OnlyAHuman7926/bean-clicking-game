let constructors = {
  rect(w, h) {
    return function () {
      const elem = document.createElement("div");
      elem.style.width = w + "px";
      elem.style.height = h + "px";
      return elem;
    };
  },
  image(url) {
    return function () {
      const elem = document.createElement("div");
      elem.style.backgroundImage = `url(${url})`;
      return elem;
    };
  },
};

class DangerousThing {
  // Dangerous things can have a direction between 0 to 360.
  // Direction is 0 when facing right.
  // Dangerous things rotate clockwise
  constructor(direction = Math.random() * 360, x = Math.random() * width, y = Math.random() * height, damage, elemConstructor) {
    this.damage = damage;
    this.health = damage;
    this.x = x;
    this.y = y;
    this.direction = direction;

    let elem = elemConstructor();
    elem.classList.add("dangerous-thing");
    elem.style.top = y + "px";
    elem.style.left = x + "px";
    elem.style.rotate = direction + "deg";
    gameWindow.append(elem);
    this.elem = elem;
    this.elem.parentClass = this;
      
    this.triggered = false;
    this.elem.addEventListener("mouseover", e => {
      if (this.triggered || paused) return;
      this.triggered = true;
      this.click();
    })
    
    this.blockedByGlass = true;
  }
  
  click() {
    beanCount += this.damage * (shield ? 0.1 : 1);
    if (this.elem) this.elem.style.animation = "explode 0.25s forwards";
    setTimeout(() => {
      this.destroy();
    }, 250);
  }

  destroy() {
    this.triggered = true;
    if (this.elem) {
      this.elem.remove();
      this.elem = null;
    }
  }

  checkOutOfScreen() {
    if (
      this.x < -100 ||
      this.x > width + 100 ||
      this.y < -100 ||
      this.y > height + 100
    )
      this.destroy();
  }
  update(dt) {
    this.checkOutOfScreen();
    if (this.health <= 0) this.destroy();
  }
}
class Bullet extends DangerousThing {
  static speed = 500;
  constructor(direction, x, y, sound = true) {
    super(direction, x, y, 30, constructors.rect(40, 20));
    this.elem.style.borderRadius = "50%";
    this.elem.style.background = "radial-gradient(#fff, red)";
    this.velX = this.constructor.speed * Math.cos((direction * Math.PI) / 180);
    this.velY = this.constructor.speed * Math.sin((direction * Math.PI) / 180);
    this.radius = 20;
    this.t = 0;
    
    if (sound) playAudio(audios.SHOOT);
  }
  //@Override
  update(dt) {
    this.t += dt * inGold(this.x, this.y);
    entityMove.apply(this, [dt, false]);
    super.update();
  }
  static bomb(d, x, y, n) {
    for (let i = 0; i < n; i++) new this((d + 360 / n * i) % 360, x, y, false);
    playAudio(audios.SHOOT);
  }
}
class MovingDangerousBean extends DangerousThing {
  static appear = 10000;
  constructor(direction = Math.random() * Math.PI * 2, x, y) {
    [x, y] = randPos(x, y, 55 / 2);
    let special = Math.random() < 0.03;
    let image = special ? beanURLs.RED_2 : beanURLs.RED_1;
    super(0, x, y, 60 * (special ? 4 : 1), constructors.image(image));
    this.elem.style.width = this.elem.style.height = "55px";
    let angle = direction;
    this.velX = Math.cos(angle) * 200;
    this.velY = Math.sin(angle) * 200;
    this.appearTime = 0;
    this.appear = this.constructor.appear;
    
    this.bulletTime = 1000;
    this.radius = Bean.radius;
    this.special = special;
  }
  // @Override
  update(dt) {
    super.update();
    this.bulletTime -= dt * freezeMultiplier;
    if (this.bulletTime <= 0) {
      this.bulletTime = this.special ? 50 : 4000;
      if (hardMode || bossMode || this.special) {
        let radDir = Math.atan2(mouse.y - this.y, mouse.x - this.x);
        let dir = radDir * 180 / Math.PI;
        dir = (dir + 360) % 360;
        let newX = this.x + Math.cos(radDir) * 55 / 2;
        let newY = this.y + Math.sin(radDir) * 55 / 2;
        new Bullet(dir, newX, newY);
        // Bullet.bomb(dir, this.x, this.y, 12);
      }
    }
    this.appearTime += dt * freezeMultiplier;
    entityMove.apply(this, [dt, true]);

    let t = this.appearTime;
    if (this.appear - t <= 250) this.elem.style.animation = "fade 0.25s forwards";
    if (t >= this.appear) this.destroy();
  }
  destroy() {
    if (this.special) {
      score += 7 * scoreMultiplier;
      new Explosion(this.x, this.y, 100, 200);
    }
    super.destroy();
  }
}
class Explosion extends DangerousThing {
  constructor(x, y, r = Math.sqrt(width ** 2 + height ** 2), health = 400) {  
    super(0, x, y, health, constructors.rect(0, 0));
    /*this.elem.classList.add("gradient-circle");
    this.elem.style.setProperty("--background-color", "red");*/
    this.elem.style.background = "radial-gradient(color-mix(in srgb, red, transparent 75%), red)"
    this.elem.style.zIndex = 150;
    this.maxR = r;
    this.maxT = r / 300 * 1000;
    this.t = 0;
    
    // Override because I don't want explosions to explode again
    this.triggered = true;
    this.elem.addEventListener("pointerover", e => {
      beanCount += this.damage * (shield ? 0.1 : 1);
    })
    
    this.blockedByGlass = false;
    
    playAudio(audios.EXPLODE);
  }
  update(dt) {
    this.t += dt;
    this.elem.style.width = this.elem.style.height = 2 * this.t / this.maxT * this.maxR + "px";
    this.elem.style.opacity = 1 - this.t / this.maxT;
    /*this.elem.style.top = this.elem.style.top + 0.00000001;
    this.elem.style.left = this.elem.style.left + 0.00000001;*/
    if (this.t >= this.maxT) this.destroy();
  }
}
class Grenade extends DangerousThing {
  static speed = 150;
  constructor(direction, x, y, t = 250, r = 100) {
    super(direction, x, y, 0, constructors.rect(30, 30));
    this.elem.style.borderRadius = "50%";
    this.elem.style.background = "red";
    this.velX = this.constructor.speed * Math.cos((direction * Math.PI) / 180);
    this.velY = this.constructor.speed * Math.sin((direction * Math.PI) / 180);
    this.radius = 30;
    this.t = 0;
    this.maxT = t;
    this.r = r;
    this.health = 100;
    // this.radius is for gold bean detection and this.r is the explosion radius.
    
    let circle = document.createElement("div");
    circle.classList.add("dashed-circle");
    circle.classList.add("scale-effect");
    circle.style.borderColor = "red";
    circle.style.width = circle.style.height = this.r * 2 + "px";
    circle.style.top = this.y + "px";
    circle.style.left = this.x + "px";
    gameWindow.append(circle);
    this.circle = circle;
    
    let circleTriggered = false;
    this.circle.addEventListener("mouseover", () => {
      if (circleTriggered) return;
      circleTriggered = true;
      this.t = Math.max(this.t, this.maxT - 500); 
    })
    
    this.blockedByGlass = true;
  }
  update(dt) {
    if (Math.sqrt((this.x - mouse.x) ** 2 + (this.y - mouse.y) ** 2) < this.r * scaleEffect) {
      this.t = Math.max(this.t, this.maxT - 500);
    }
    this.t += dt * freezeMultiplier;
    entityMove.apply(this, [dt, false]);
    this.circle.style.top = this.y + "px";
    this.circle.style.left = this.x + "px";
    
    let ratio = this.t / this.maxT;
    if (ratio < 1/3) this.elem.style.background = "red";
    else if (ratio < 2/3) this.elem.style.background = "radial-gradient(orange, red)";
    else this.elem.style.background = "radial-gradient(white, red)";
    
    if (this.t >= this.maxT) this.explode();

    super.update();
  }
  click() {
    // Override, no super
    this.explode();
  }
  explode() {
    new Explosion(this.x, this.y, this.r * scaleEffect, 120);
    this.destroy();
  }
  destroy() {
    if (this.circle) this.circle.remove();
    this.circle = null;
    super.destroy();
  }
  static to(x1, y1, x2, y2, r) {
    let dir = Math.atan2(y2 - y1, x2 - x1);
    dir *= 180 / Math.PI;
    dir = (dir + 360) % 360;
    
    let dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    let t = dist / this.speed * 1000;
    
    return new this(dir, x1, y1, t, r);
  }
}