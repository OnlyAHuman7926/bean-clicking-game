const animations = [];

function gradientCircle(x, y, r, c) {}
function explode(x, y, r = Math.sqrt(width ** 2 + height ** 2), c = "#fff", time = 2000) {
  const circle = document.createElement("div");
  circle.classList.add("gradient-circle");
  circle.style.setProperty("--background-color", c);
  circle.style.top = y + "px";
  circle.style.left = x + 'px';
  circle.style.width = circle.style.height = 0;
  gameWindow.append(circle);
  
  // const time = 2000;
  let t = 0;
  const f = dt => {
    t += dt;
    circle.style.opacity = 1 - t / time;
    circle.style.width = circle.style.height = Math.sqrt(t / time) * r * 2 + "px";
    if (t >= time) {
      circle.remove();
      animations.splice(animations.indexOf(f), 1);
    }
  }
  animations.push(f);
}
function floatText(x, y, c, t) {
  let text = document.createElement("div");
  text.style.left = x + "px";
  text.style.top = y + 'px';
  text.innerHTML = c;
  text.style.animation = `float-text ${t}ms forward ease-out`;
}

function updateAnimations(dt) {
  // Iteration is done backwards to prevent problems.
  for (let i = animations.length - 1; i >= 0; i--) {
    animations[i](dt);
  }
}