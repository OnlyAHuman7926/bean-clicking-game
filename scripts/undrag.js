let mousedownTagName = "";
document.addEventListener("mousedown", e => {
  mousedownTagName = e.target.tagName.toUpperCase();
}, false);
document.addEventListener("mouseup", e => {
  mousedownTagName = "";
}, false);
window.ondragstart = () => mousedownTagName != "IMG";