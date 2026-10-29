/* Effects drawn by code (they pulse, glow or change shape every frame): fishing net, portal, orbs */
function drawNet(c, x, y, w, h, cut, t) {
  c.save();
  c.translate(x, y);
  c.strokeStyle = cut ? 'rgba(210,200,160,0.5)' : 'rgba(225,215,170,0.9)';
  c.lineWidth = 1.4;
  const gx = 12,
    gy = 12;
  for (let i = 0; i <= w / gx; i++) {
    c.beginPath();
    for (let j = 0; j <= h / gy; j++) {
      const sw = cut ? Math.sin(t * 2 + j) * 4 + i * 1.5 : 0;
      c.lineTo(i * gx - w / 2 + sw, j * gy - h / 2 + (cut ? j * 3 : 0));
    }
    c.stroke();
  }
  for (let j = 0; j <= h / gy; j++) {
    c.beginPath();
    for (let i = 0; i <= w / gx; i++) {
      const sw = cut ? Math.sin(t * 2 + i) * 4 : 0;
      c.lineTo(i * gx - w / 2, j * gy - h / 2 + sw + (cut ? j * 3 : 0));
    }
    c.stroke();
  }
  c.restore();
}

function drawPortal(c, x, y, o) {
  // y = base; ring ~90 tall
  const t = o.t || 0,
    hint = o.hint == null ? 0 : o.hint,
    h = 96;
  c.save();
  c.translate(x, y - h / 2);
  const warm = hint > 0;
  const gl = c.createRadialGradient(0, 0, 8, 0, 0, 90);
  gl.addColorStop(0, warm ? `rgba(255,214,140,${0.3 + hint * 0.3})` : 'rgba(150,120,255,0.28)');
  gl.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = gl;
  c.fillRect(-100, -100, 200, 200);
  c.lineWidth = 5;
  c.strokeStyle = warm ? `rgba(255,224,160,${0.5 + hint * 0.4})` : 'rgba(170,150,255,0.8)';
  ell(c, 0, 0, 30, 46);
  c.stroke();
  c.save();
  ell(c, 0, 0, 27, 43);
  c.clip();
  const ig = c.createRadialGradient(0, 0, 2, 0, 0, 46);
  ig.addColorStop(0, warm ? 'rgba(255,240,200,0.9)' : 'rgba(200,190,255,0.85)');
  ig.addColorStop(1, warm ? 'rgba(255,170,90,0.25)' : 'rgba(80,60,200,0.25)');
  c.fillStyle = ig;
  c.fillRect(-40, -50, 80, 100);
  c.strokeStyle = 'rgba(255,255,255,0.45)';
  c.lineWidth = 2;
  for (let k = 0; k < 3; k++) {
    c.beginPath();
    for (let a = 0; a < 12; a += 0.3) {
      const r = a * 3.6;
      const px = Math.cos(a + t * 0.9 + k * 2.1) * r * 0.7,
        py = Math.sin(a + t * 0.9 + k * 2.1) * r;
      a === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
    c.stroke();
  }
  c.restore();
  c.restore();
}

function drawOrb(c, x, y, t, ph) {
  const b = Math.sin(t * 2.4 + ph) * 3;
  y += b;
  const g = c.createRadialGradient(x, y, 2, x, y, 20);
  g.addColorStop(0, 'rgba(160,200,255,0.55)');
  g.addColorStop(1, 'rgba(120,140,255,0)');
  c.fillStyle = g;
  c.fillRect(x - 22, y - 22, 44, 44);
  const s = c.createRadialGradient(x - 3, y - 4, 1, x, y, 10);
  s.addColorStop(0, '#f2f8ff');
  s.addColorStop(0.35, '#7fa8ff');
  s.addColorStop(1, '#2a2f8a');
  c.fillStyle = s;
  ell(c, x, y, 9, 9);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.85)';
  ell(c, x - 3, y - 4, 2.6, 1.8, -0.6);
  c.fill();
}
