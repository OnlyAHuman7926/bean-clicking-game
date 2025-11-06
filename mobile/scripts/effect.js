class Effect {
  constructor(img, time, initiator, revoker) {
    this.img = img;
    this.initiator = initiator;
    this.revoker = revoker;
    this.time = time;
    this.finished = false;
    const elem = document.createElement("div");
    elem.classList.add("effect-disps");
    elem.style.backgroundImage = 'url("' + img + '")';
    elem.textContent = Math.ceil(time / 1000);
    effectBar.append(elem);
    this.elem = elem;
    this.elem.parentClass = this;

    this.t = 0;
    this.initiate();
  }
  initiate() {
    this.initiator();
  }
  revoke() {
    this.revoker();
    this.elem.remove();
    this.elem = null;
    this.finished = true;
  }
  update(dt) {
    this.t += dt;
    //console.log(this.t, this.time, (this.time - this.t) / 1000);
    this.elem.textContent = Math.ceil(
      (this.time - this.t) / 1000
    );
    if (this.t >= this.time) this.revoke();
  }
}
class SingleEffect {
  static effect;    // I don't understand why this effect ins independent for each single effect;
  static start(img, time, initiator, revoker) {
    if (!this.effect || this.effect.finished) this.effect = new Effect(img, time, initiator, revoker);
    else this.effect.time += time;
  }
}
class Freeze extends Effect {
  constructor(t, n) {
    const initiator = () => {
      freezeMultiplier *= n;
      document.documentElement.style.setProperty("--freeze-opacity", +document.documentElement.style.getPropertyValue("--freeze-opacity") + 0.6);
    };
    const revoker = () => {
      freezeMultiplier /= n;
      document.documentElement.style.setProperty("--freeze-opacity", +document.documentElement.style.getPropertyValue("--freeze-opacity") - 0.6);
    };
    super(effectImgs.FREEZE, t, initiator, revoker);
  }
}
class SpeedUp extends Effect {
  constructor(t) {
    const initiator = () => {
      freezeMultiplier *= 2;
      document.documentElement.style.setProperty("--freeze-opacity", 1);
    };
    const revoker = () => {
      freezeMultiplier /= 2;
      document.documentElement.style.setProperty("--freeze-opacity", 0);
    };
    super(effectImgs.FREEZE, t, initiator, revoker);
  }
}
class ScoreMultiply extends Effect {
  constructor(t, n) {
    const initiator = () => (scoreMultiplier *= n);
    const revoker = () => (scoreMultiplier /= n);
    super(effectImgs.DOUBLE, t, initiator, revoker);
  }
}
class Distortion extends Effect {
  constructor(t) {
    const initiator = () => {
      gameWindow.style.animation = "distort 5s infinite alternate";
      document.body.style.animation = "distort-html 5s infinite alternate";
      document.getElementById("top").style.zIndex = "99";
    }
    const revoker = () => document.getElementById("top").style.zIndex = document.body.style.animation = gameWindow.style.animation = "";
    super(effectImgs.DOUBLE, t, initiator, revoker);
  }
}
class Lucky extends Effect {
  constructor(t, n) {
    const initiator = () => (luckyMultiplier *= n);
    const revoker = () => (luckyMultiplier /= n);
    super(effectImgs.CLOVER, t, initiator, revoker);
  }
}
/*class Shield extends Effect {
  constructor(t) {
    const initiator = () => {
      shield++;
      document.body.style.filter = "drop-shadow(0 0 1px white)";
    }
    const revoker = () => {
      shield--;
      if (shield == 0) document.body.style.filter = null;
    }
    super(beanURLs.OLD, t, initiator, revoker);
  }
}*/
class Shield extends SingleEffect {
  static start(t) {
    const initiator = () => {
      shield = true;
      document.body.style.filter = "drop-shadow(0 0 1px white)";
    }
    const revoker = () => {
      shield = false;
      document.body.style.filter = null;
    }
    super.start(effectImgs.SHIELD, t, initiator, revoker);
  }
}
class Scale extends SingleEffect {
  static start(t) {
    const initiator = () => {
      scaleEffect = 2;
      document.querySelector(":root").style.setProperty("--scale-effect", 2);
    }
    const revoker = () => {
      scaleEffect = 1;
      document.querySelector(":root").style.setProperty("--scale-effect", 1);
    }
    super.start(beanURLs.OLD, t, initiator, revoker);
  }
}


function updateAllEffects(dt) {
  for (let e of effectBar.children) e.parentClass.update(dt);
}
