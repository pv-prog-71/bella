/* Gate and exit sign drawing (dynamic). Static scenery is baked from image files: see core/assets.js */
/* The way out is closed by an invisible wall until the puzzle is solved (a speech bubble explains why: see play.js).
 * Nothing is drawn while it is closed; when it opens, the exit sign with the next level's name appears. */
function drawGate(c, L, t) {
  const g = L.gate;
  if (!g || !L.gateOpening || (L.gateT || 0) < 1.2) return;
  drawSign(c, g.x + 10, GY, L.nextName || '');
}
function drawSign(c, x, y, text) {
  c.fillStyle = '#6a4a2a';
  c.fillRect(x - 3, y - 70, 6, 70);
  c.fillStyle = '#9a7040';
  rrect(c, x - 44, y - 92, 88, 30, 5);
  c.fill();
  c.fillStyle = '#3a2410';
  c.font = '600 15px Fredoka, sans-serif';
  c.textAlign = 'center';
  c.fillText(text + ' →', x, y - 71);
}
