/* Bella: photo sprite with animated legs and tail */
/* ---------- Bella (photo sprite with animated legs & tail) ---------- */
// Source art is 360x295; working copies are scaled by S so every frame is cheap to compose (200 px wide = 1:1 at 2x DPR)
const BELLA = { ready: false, parts: null, S: 200 / 360, W: 200, H: 164, tmp: null, rim: null };
function bellaBuild(img) {
  const S = BELLA.S,
    W = (BELLA.W = Math.round(360 * S)),
    H = (BELLA.H = Math.round(295 * S)),
    q = v => Math.round(v * S);
  const small = mkc(W, H);
  small.getContext('2d').drawImage(img, 0, 0, W, H);
  const crop = (x0, y0, x1, y1) => {
    x0 = q(x0);
    y0 = q(y0);
    x1 = Math.min(W, q(x1));
    y1 = Math.min(H, q(y1));
    const c = mkc(x1 - x0, y1 - y0);
    c.getContext('2d').drawImage(small, x0, y0, x1 - x0, y1 - y0, 0, 0, x1 - x0, y1 - y0);
    return { c, x: x0, y: y0 };
  };
  const body = mkc(W, H),
    b = body.getContext('2d');
  b.save();
  b.beginPath();
  b.rect(0, q(82), W, H - q(82));
  b.rect(q(115), 0, W - q(115), q(82));
  b.clip();
  b.drawImage(small, 0, 0);
  b.restore();
  BELLA.parts = {
    body,
    tail: crop(0, 34, 84, 88),
    rleg: crop(0, 185, 104, 295),
    fleg: crop(168, 185, 264, 295)
  };
  BELLA.piv = { tail: [q(44), q(84)], rleg: [q(52), q(190)], fleg: [q(206), q(194)] };
  BELLA.tmp = mkc(W + 24, H + 24);
  BELLA.rim = mkc(W + 24, H + 24);
  BELLA.ready = true;
}
// feet-centre anchored. o: {face, phase(run), air(-1 up..1 down), t, alpha, glow:[r,g,b,a], squash, tremble, scale, rim}
function bellaDraw(c, x, y, o) {
  const s = (100 / BELLA.W) * (o.scale || 1),
    W = BELLA.W,
    H = BELLA.H,
    face = o.face || 1;
  if (!BELLA.ready) {
    c.fillStyle = '#111';
    ell(c, x, y - 24, 36, 24);
    c.fill();
    return;
  }
  const t = BELLA.tmp,
    tc = t.getContext('2d'),
    P = BELLA.parts,
    V = BELLA.piv,
    PAD = 12;
  tc.clearRect(0, 0, t.width, t.height);
  tc.save();
  tc.translate(PAD, PAD);
  const run = o.run,
    ph = o.phase || 0,
    air = o.air || 0;
  let ra = 0,
    fa = 0;
  if (air !== 0) {
    ra = -0.42;
    fa = 0.38;
    if (air > 0.3) {
      ra = -0.2;
      fa = 0.15;
    }
  } else if (run) {
    ra = Math.sin(ph) * 0.42;
    fa = -Math.sin(ph) * 0.42;
  }
  const ta = Math.sin((o.t || 0) * (run ? 12 : 7)) * (run ? 0.09 : 0.14);
  const part = (p, piv, ang) => {
    tc.save();
    tc.translate(piv[0], piv[1]);
    tc.rotate(ang);
    tc.translate(-piv[0], -piv[1]);
    tc.drawImage(p.c, p.x, p.y);
    tc.restore();
  };
  part(P.tail, V.tail, ta);
  part(P.rleg, V.rleg, ra);
  part(P.fleg, V.fleg, fa);
  tc.drawImage(P.body, 0, 0);
  tc.restore();
  const gl = o.glow || [255, 255, 255, 0.5],
    rim = BELLA.rim,
    rc = rim.getContext('2d'),
    d = (o.rim || 4) * BELLA.S * 1.9,
    rw = rim.width,
    rh = rim.height;
  rc.globalCompositeOperation = 'source-over';
  rc.clearRect(0, 0, rw, rh);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * TAU;
    rc.drawImage(t, Math.cos(a) * d, Math.sin(a) * d);
  }
  rc.globalCompositeOperation = 'source-in';
  rc.fillStyle = `rgba(${gl[0]},${gl[1]},${gl[2]},${gl[3]})`;
  rc.fillRect(0, 0, rw, rh);
  c.save();
  const bob = run && air === 0 ? -Math.abs(Math.sin(ph)) * 3.5 : 0,
    sq = o.squash || 0;
  c.translate(x + (o.tremble ? Math.sin((o.t || 0) * 40) * 1.4 : 0), y + bob);
  c.scale(face * s * (1 + sq * 0.12), s * (1 - sq * 0.12));
  c.translate(-W / 2 - PAD, -H - PAD);
  c.globalAlpha = o.alpha == null ? 1 : o.alpha;
  c.drawImage(rim, 0, 0);
  c.drawImage(t, 0, 0);
  c.restore();
}
