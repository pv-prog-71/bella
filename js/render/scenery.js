/* Trees, plants, rocks and clouds painters */
/* ---------- tree & plant painters ---------- */
function trunk(c, x, top, bot, w, c1, c2) {
  const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(x - w * 0.5, bot);
  c.quadraticCurveTo(x - w * 0.42, bot - 22, x - w * 0.36, bot - 60);
  c.lineTo(x - w * 0.3, top);
  c.lineTo(x + w * 0.3, top);
  c.lineTo(x + w * 0.36, bot - 60);
  c.quadraticCurveTo(x + w * 0.42, bot - 22, x + w * 0.5, bot);
  c.closePath();
  c.fill();
}
function leafBlob(c, x, y, r, cols, rnd, n) {
  for (let i = 0; i < n; i++) {
    c.fillStyle = cols[(rnd() * cols.length) | 0];
    const a = rnd() * TAU,
      d = rnd() * r;
    ell(
      c,
      x + Math.cos(a) * d,
      y + Math.sin(a) * d * 0.7,
      r * (0.35 + rnd() * 0.35),
      r * (0.28 + rnd() * 0.25)
    );
    c.fill();
  }
}
function pine(c, x, base, h, w, col, snow, rnd) {
  const layers = Math.max(4, (h / 26) | 0);
  c.fillStyle = '#4a3322';
  c.fillRect(x - w * 0.06, base - h * 0.12, w * 0.12, h * 0.12);
  for (let i = 0; i < layers; i++) {
    const t = i / layers,
      y = base - h * 0.1 - t * h * 0.88,
      lw = w * (1 - t * 0.85) * 0.5,
      lh = (h / layers) * 1.7;
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x, y - lh);
    c.lineTo(x + lw, y);
    c.lineTo(x - lw, y);
    c.closePath();
    c.fill();
    if (snow) {
      c.fillStyle = 'rgba(246,250,253,0.92)';
      c.beginPath();
      c.moveTo(x, y - lh);
      c.lineTo(x + lw * 0.62, y - lh * 0.38);
      c.quadraticCurveTo(x + lw * 0.2, y - lh * 0.5, x, y - lh * 0.42);
      c.quadraticCurveTo(x - lw * 0.3, y - lh * 0.55, x - lw * 0.62, y - lh * 0.38);
      c.closePath();
      c.fill();
    }
  }
}
function deadTree(c, x, base, h, w, col, rnd) {
  c.strokeStyle = col;
  c.lineCap = 'round';
  function br(x0, y0, len, ang, wd, d) {
    if (d > 5 || wd < 0.8) return;
    const x1 = x0 + Math.cos(ang) * len,
      y1 = y0 + Math.sin(ang) * len;
    c.lineWidth = wd;
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    c.stroke();
    const k = d < 2 ? 2 : rnd() < 0.6 ? 2 : 1;
    for (let i = 0; i < k; i++)
      br(
        x1,
        y1,
        len * (0.62 + rnd() * 0.2),
        ang + (rnd() - 0.5) * 1.3 - (d === 0 ? 0 : 0),
        wd * 0.68,
        d + 1
      );
  }
  br(x, base, h * 0.32, -Math.PI / 2 + (rnd() - 0.5) * 0.2, w, 0);
}
function bush(c, x, y, r, cols, rnd) {
  leafBlob(c, x, y - r * 0.4, r, cols, rnd, 9);
}
function flower(c, x, y, h, col, cen) {
  c.strokeStyle = '#3f8a34';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(x, y);
  c.quadraticCurveTo(x + 2, y - h / 2, x, y - h);
  c.stroke();
  c.fillStyle = col;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    ell(c, x + Math.cos(a) * 4, y - h + Math.sin(a) * 4, 3.2, 3.2);
    c.fill();
  }
  c.fillStyle = cen || '#ffe36a';
  ell(c, x, y - h, 2.4, 2.4);
  c.fill();
}
function rockShape(c, x, y, w, h, col, hi) {
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(x - w / 2, y);
  c.quadraticCurveTo(x - w * 0.5, y - h * 0.8, x - w * 0.15, y - h);
  c.quadraticCurveTo(x + w * 0.3, y - h * 1.05, x + w * 0.5, y - h * 0.3);
  c.quadraticCurveTo(x + w * 0.55, y - 2, x + w / 2, y);
  c.closePath();
  c.fill();
  c.fillStyle = hi;
  c.beginPath();
  c.moveTo(x - w * 0.3, y - h * 0.7);
  c.quadraticCurveTo(x - w * 0.1, y - h * 0.98, x + w * 0.15, y - h * 0.9);
  c.quadraticCurveTo(x - w * 0.05, y - h * 0.75, x - w * 0.3, y - h * 0.7);
  c.fill();
}
function cloud(c, x, y, s, a) {
  c.fillStyle = `rgba(255,255,255,${a})`;
  [
    [0, 0, 40],
    [34, -10, 34],
    [-34, 4, 28],
    [66, 6, 26],
    [-60, 10, 20]
  ].forEach(p => {
    ell(c, x + p[0] * s, y + p[1] * s, p[2] * s, p[2] * s * 0.62);
    c.fill();
  });
}
