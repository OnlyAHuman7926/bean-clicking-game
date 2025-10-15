function intersect(ax, ay, bx, by, cx, cy, dx, dy) {
  // Returns true if segment AB intersects with CD.
  let mab = (by - ay) / (bx - ax), mcd = (dy - cy) / (dx - cx);
  if (!isFinite(mcd)) return cx >= Math.min(ax, bx) && cx <= Math.max(ax, bx);    // vertical lines
  if (!isFinite(mab)) return ax >= Math.min(cx, dx) && ax <= Math.max(cx, dx);
  let x = (cy - ay + mab * ax - mcd * cx) / (mab - mcd);
  let y = mab * (x - ax) + ay;
  return (
    x >= Math.min(ax, bx) && x <= Math.max(ax, bx) && 
    y >= Math.min(ay, by) && y <= Math.max(ay, by) && 
    x >= Math.min(cx, dx) && x <= Math.max(cx, dx) &&
    y >= Math.min(cy, dy) && x <= Math.max(cy, dy)
  )
}
function logistic(min, max, xmid, k) {
  return x => min + (max - min) / (1 + Math.E ** (-k * (x - xmid)))
}
function selectWithWeights(items, weights) {
  let total = weights.reduce((s, n) => s + n, 0);    // sum of all weights
  let random = Math.random() * total;
  let i = -1;
  do {
    i++;
    random -= weights[total];
  } while (random > 0 && i < items.length)
}