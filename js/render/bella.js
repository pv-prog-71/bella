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
  const bodyFull = mkc(W, H); // body with all four legs, as in the photo: used while she stands still (crisp, no cut edges)
  bodyFull.getContext('2d').drawImage(body, 0, 0);
  // the tail is a separate part (it wags): only the tail itself (a polygon above the back line), not the rump, is cut out of the body
  const TAILPOLY = [[0, 30], [80, 30], [80, 66], [68, 86], [40, 89], [12, 89], [0, 72]];
  const polyPath = (cx, ox, oy) => { cx.beginPath(); TAILPOLY.forEach((pt, i) => cx[i ? 'lineTo' : 'moveTo'](q(pt[0]) - ox, q(pt[1]) - oy)); cx.closePath(); };
  [bodyFull.getContext('2d'), b].forEach(cx => { cx.save(); polyPath(cx, 0, 0); cx.clip(); cx.clearRect(0, 0, W, H); cx.restore(); });
  // the four legs are drawn separately so they can swing (near pair in front of the body, far pair behind it). They are taken
  // out of the body from y=212 down, so no second set of legs shows next to the swinging ones; the upper part stays, no gap opens.
  const legs = {
    rfar: crop(58, 188, 94, 258),
    rnear: crop(0, 188, 58, 295),
    ffar: crop(212, 190, 250, 252),
    fnear: crop(184, 190, 250, 295)
  };
  legs.fnear.c.getContext('2d').clearRect(q(212) - legs.fnear.x, 0, q(40), q(252) - legs.fnear.y); // the far front leg is not part of the near one
  b.clearRect(q(0), q(212), q(94), H - q(212));
  b.clearRect(q(184), q(212), q(66), H - q(212));
  const tail = crop(0, 34, 84, 88);
  const tcx = tail.c.getContext('2d');
  tcx.globalCompositeOperation = 'destination-in';
  polyPath(tcx, tail.x, tail.y);
  tcx.fill();
  tcx.globalCompositeOperation = 'source-over';
  BELLA.parts = Object.assign({ body, bodyFull, tail }, legs);
  BELLA.piv = {
    tail: [q(30), q(86)],
    rfar: [q(72), q(196)],
    rnear: [q(38), q(196)],
    ffar: [q(222), q(196)],
    fnear: [q(200), q(196)]
  };
  BELLA.tmp = mkc(W + 24, H + 24);
  BELLA.rim = mkc(W + 24, H + 24);
  BELLA.ready = true;
}
// the barking head (mouth open) is patched into a copy of the body, which bellaDraw uses while Bella barks
function bellaBuildBark(img) {
  if (!BELLA.ready) return;
  const S = BELLA.S,
    P = BELLA.parts,
    hx = Math.round(232 * S);
  const patch = src => {
    const k = mkc(BELLA.W, BELLA.H),
      kx = k.getContext('2d');
    kx.drawImage(src, 0, 0);
    kx.clearRect(hx, 0, BELLA.W - hx, Math.round(140 * S));
    kx.drawImage(img, hx, 0, Math.round(img.width * S), Math.round(img.height * S));
    return k;
  };
  BELLA.bodyBark = patch(P.body); // for the running / jumping pose (legs are separate parts)
  BELLA.bodyBarkFull = patch(P.bodyFull); // for standing
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
  // swing angles: positive = foot swings back, negative = forward. Diagonal trot: near rear + far front move together.
  let A = [0, 0, 0, 0], // rear far, rear near, front far, front near
    L = [0, 0, 0, 0]; // lift (sprite pixels)
  if (air !== 0) {
    // jump: legs reach out (front forward, rear back) going up and fold in a little coming down
    const u = o.vy != null ? clamp(o.vy / 600, -1, 1) : air;
    const fr = -0.65 + 0.25 * u,
      rr = 0.6 - 0.3 * u;
    A = [rr + 0.15, rr - 0.1, fr - 0.15, fr + 0.1];
    L = [6, 6, 6, 6];
  } else if (run) {
    const sw = Math.sin(ph) * 0.6,
      c1 = Math.max(0, Math.cos(ph)) * 8,
      c2 = Math.max(0, -Math.cos(ph)) * 8;
    const k = o.scared ? 0.6 : 1; // scared: shorter, more hesitant steps
    A = [-sw * k, sw * k, sw * k, -sw * k];
    L = [c2, c1, c1, c2];
  }
  const ta = o.scared
    ? -0.35 // scared (alternate world): tail tucked down and still
    : Math.sin((o.t || 0) * (run ? 15 : 10)) * (run ? 0.38 : 0.5) + (run ? 0.12 : 0.05); // happy and curious: lively wag // tail wags harder, and streams behind when running
  const part = (p, piv, ang, lift) => {
    tc.save();
    tc.translate(piv[0], piv[1] - (lift || 0));
    tc.rotate(ang);
    tc.translate(-piv[0], -piv[1]);
    tc.drawImage(p.c, p.x, p.y);
    tc.restore();
  };
  const open = o.bark > 0;
  if (air === 0 && !run) {
    // standing: the photo as it is (all four legs in the body), only the tail moves and the mouth opens when she barks
    tc.drawImage(open && BELLA.bodyBarkFull ? BELLA.bodyBarkFull : P.bodyFull, 0, 0);
  } else {
    part(P.rfar, V.rfar, A[0], L[0]); // far legs behind the body
    part(P.ffar, V.ffar, A[2], L[2]);
    tc.drawImage(open && BELLA.bodyBark ? BELLA.bodyBark : P.body, 0, 0); // mouth open while barking
    part(P.rnear, V.rnear, A[1], L[1]); // near legs in front
    part(P.fnear, V.fnear, A[3], L[3]);
  }
  part(P.tail, V.tail, ta); // tail on top of the rump, so no gap shows when it swings
  tc.restore();
  const gl = o.glow || [255, 255, 255, 0.5],
    rim = BELLA.rim,
    rc = rim.getContext('2d'),
    d = (o.rim || 4) * BELLA.S * 1.9,
    rw = rim.width,
    rh = rim.height;
  rc.globalCompositeOperation = 'source-over';
  rc.clearRect(0, 0, rw, rh);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * TAU;
    rc.drawImage(t, Math.cos(a) * d, Math.sin(a) * d);
  }
  rc.globalCompositeOperation = 'source-in';
  rc.fillStyle = `rgba(${gl[0]},${gl[1]},${gl[2]},${gl[3]})`;
  rc.fillRect(0, 0, rw, rh);
  c.save();
  const rn = run && air === 0,
    bob = rn ? -Math.abs(Math.sin(ph)) * (o.scared ? 3 : 6) : 0, // bounce with every stride (smaller when scared)
    sq = o.squash || 0;
  // whole-body pose: leans into the run, nose up when jumping, nose down when falling, little head-nod while trotting
  let pitch = rn ? 0.05 + Math.sin(ph * 2) * 0.035 : 0; // standing: no rotation, so the outline stays crisp
  if (o.scared) pitch += 0.09; // alternate world: head low, hunched, careful
  if (o.bark) pitch -= Math.sin(o.bark * Math.PI) * 0.16; // bark: the head jerks up and back
  if (air !== 0) pitch = o.vy != null ? clamp(o.vy / 600, -1, 1) * 0.3 : air > 0 ? 0.16 : -0.14; // follows the vertical speed smoothly
  let sx = 1 + sq * 0.12,
    sy = 1 - sq * 0.12;
  if (rn) {
    sy *= 1 + Math.cos(ph * 2) * 0.025; // stretch and squash with the stride
    sx *= 1 - Math.cos(ph * 2) * 0.02;
  } else if (air !== 0) {
    sy *= 1.06; // taller and slimmer in the air
    sx *= 0.95;
  } else {
  }
  c.translate(x + (o.tremble ? Math.sin((o.t || 0) * 40) * 1.4 : 0), y + bob + 4.5 * (o.scale || 1)); // a few pixels lower: she stands ON the ground, not above it
  c.rotate(face * pitch);
  c.scale(face * s * sx, s * sy);
  c.translate(-W / 2 - PAD, -H - PAD);
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = 'high'; // cleaner outline when the sprite is scaled down
  c.globalAlpha = o.alpha == null ? 1 : o.alpha;
  c.drawImage(rim, 0, 0);
  c.drawImage(t, 0, 0);
  c.restore();
}
