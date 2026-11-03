/* Animals and people.
 * Every creature is a "clip": a horizontal strip of frames in assets/images/creatures/<clip>.png.
 * assets/data/manifest.js stores, for each clip, how many frames it has, how long one loop lasts (period, seconds)
 * and where the picture sits relative to the creature's feet (dx, dy).
 * The functions below keep the same names and options as before: they pick the right clip for the situation
 * and call drawClip(). To change how an animal looks, edit its PNG strip. To change which clip plays when, edit this file. */

// Draws one frame of a clip with its origin at x,y.
//   time      seconds (the frame is time modulo the clip's period)
//   dir       1 = as drawn (facing right), -1 = mirrored
//   scale     size multiplier
//   rotation  radians; rotateBeforeFlip says whether the rotation happens before or after the mirror
// sprite scale: the eagles were too big next to Bella and the spiders a bit big
const EAGLE_SCALE = 0.7, SPIDER_SCALE = 0.82;
function drawClip(ctx, clipName, x, y, time, options) {
  const sprite = IMG['creatures/' + clipName];
  if (!sprite) return;
  const opts = options || {},
    clip = ASSET_MANIFEST.clips[clipName],
    dir = opts.dir || 1,
    scale = opts.scale || 1;
  let frame = 0;
  if (clip.frames > 1) {
    const timeInLoop = ((time % clip.period) + clip.period) % clip.period;
    frame = Math.floor((timeInLoop / clip.period) * clip.frames) % clip.frames;
  }
  ctx.save();
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  ctx.translate(x, y);
  if (opts.rotateBeforeFlip && opts.rotation) ctx.rotate(opts.rotation);
  ctx.scale(dir * scale, scale);
  if (!opts.rotateBeforeFlip && opts.rotation) ctx.rotate(opts.rotation);
  ctx.drawImage(
    sprite,
    frame * clip.w, 0, clip.w, clip.h,   // source: this frame of the strip
    clip.dx, clip.dy, clip.w, clip.h     // destination: relative to the creature's origin
  );
  ctx.restore();
}

function drawChameleon(ctx, x, y, o) {
  drawClip(ctx, o.mood ? 'chameleon_happy' : 'chameleon_sad', x, y, o.t || 0, { dir: o.dir });
}

// o.rise: 0..1 how far the head is lifted. o.len 110 = the big purple puzzle snake, otherwise the small grass snake.
function drawSnake(ctx, x, y, o) {
  const time = o.t || 0,
    rise = o.rise == null ? 1 : o.rise;
  if (o.len === 110) {
    drawClip(ctx, rise > 0.5 ? 'snake_puzzle' : 'snake_flee', x, y, time, { dir: o.dir, alpha: o.alpha });
  } else {
    const riseLevel = clamp(Math.round(rise * 4), 1, 4) * 25;   // 25, 50, 75 or 100
    drawClip(ctx, 'snake_grass_' + riseLevel, x, y, time, { dir: o.dir, alpha: o.alpha });
  }
}

function drawFrog(ctx, x, y, o) {
  const clipName = o.hop ? 'frog_hop' : o.sad ? 'frog_sad' : 'frog_idle';
  drawClip(ctx, clipName, x, y, o.t || 0, { dir: o.dir });
}

function drawBird(ctx, x, y, o) {
  const clipName = o.fly ? 'bird_fly' : o.fat ? 'bird_perch_fat' : 'bird_perch';
  drawClip(ctx, clipName, x, y, o.t || 0, { dir: o.dir || -1, scale: o.s || 1 });
}

// y = water surface. o.up 0..0.4 (how high it rises), o.open 0..1 (jaw).
function drawCroc(ctx, x, y, o) {
  const t = o.t || 0,
    upLevel = clamp(Math.round((o.up || 0) / 0.2), 0, 2),
    openLevel = clamp(Math.round((o.open || 0) * 2), 0, 2),
    bob = Math.sin(t * 1.6 + x) * 1.5;
  drawClip(ctx, 'croc_up' + upLevel + '_open' + openLevel, x, y + bob, 0, { dir: o.dir });
}

function drawSpider(ctx, x, y, o) {
  const threadTop = o.top == null ? -20 : o.top;
  ctx.strokeStyle = 'rgba(230,230,240,0.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, threadTop);
  ctx.lineTo(x, y - 10);
  ctx.stroke();
  drawClip(ctx, 'spider', x, y, o.t || 0, { scale: SPIDER_SCALE });
}

function drawBear(ctx, x, y, o) {
  const clipName = o.hurt ? 'bear_hurt' : o.eat ? 'bear_eat' : 'bear_idle';
  drawClip(ctx, clipName, x, y, o.t || 0, { dir: o.dir || -1 });
}

function drawHive(ctx, x, y, scale) {
  drawClip(ctx, 'hive', x, y, 0, { scale: scale || 1 });
}

function drawBee(ctx, x, y, time, o) {
  drawClip(ctx, 'bee', x, y, time, { dir: (o && o.dir) || 1 });
}

function drawWasp(ctx, x, y, o) {
  drawClip(ctx, 'wasp', x, y, o.t || 0, { dir: o.dir });
}

// o.ang: tilt in radians (diving). The tilt is applied before the mirror, as the original painter did.
function drawEagle(ctx, x, y, o) {
  drawClip(ctx, o.dive ? 'eagle_dive' : 'eagle_fly', x, y, o.t || 0, {
    dir: o.dir, rotation: o.ang || 0, rotateBeforeFlip: true, scale: EAGLE_SCALE
  });
}

// o.lean tilts the body (applied after the mirror).
function drawBoar(ctx, x, y, o) {
  drawClip(ctx, o.run ? 'boar_run' : 'boar_walk', x, y, o.t || 0, {
    dir: o.dir, rotation: -(o.lean || 0) * 0.08
  });
}

function drawDog(ctx, x, y, o) {
  const clipName = o.eat ? 'dog_eat' : o.run ? 'dog_run' : 'dog_idle';
  drawClip(ctx, clipName, x, y, o.t || 0, { dir: o.dir });
  if (o.bark) {
    // sound waves in front of the mouth
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(o.dir || 1, 1);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(50, -32, 10, -0.7, 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(50, -32, 18, -0.6, 0.6);
    ctx.stroke();
    ctx.restore();
  }
}

function drawFisherman(ctx, x, y, t) {
  drawClip(ctx, 'fisherman', x, y, 0);
  // floating "z z z" of his nap
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '600 14px Fredoka, sans-serif';
  const phase = (t * 0.8) % 3;
  for (let i = 0; i < 3; i++) {
    const u = ((phase + i) % 3) / 3;
    ctx.globalAlpha = 1 - u;
    ctx.fillText('z', -10 + i * 8 + u * 10, -50 - u * 28);
  }
  ctx.restore();
}

function drawStingray(ctx, x, y, o) {
  drawClip(ctx, o.free ? 'stingray_free' : 'stingray_idle', x, y, o.t || 0, { dir: o.dir });
}

function drawBoy(ctx, x, y, t, scale) {
  drawClip(ctx, 'boy', x, y, t, { scale: scale || 1 });
}

// Shadow creature of the alternate world: a tall, thin silhouette with long limbs (drawn with code, no baked sprite).
// States: patrol (calm), detect (alert: arms rising, pale eyes), chase (alert + leaning forward, arms reaching, long strides).
function drawShadow(ctx, x, y, o) {
  const t = (o.t || 0) + (o.seed || 0) / 1.6, // every shadow moves at its own moment (the seed is fixed: x changes while it walks and would speed up the legs)
    chase = !!o.lean,
    alert = chase || !!o.alert,
    step = chase ? 30 : 12, // stride (px)
    // legs in sync with the real speed (o.speed, px/s), so the feet do not slide on the ground
    sp = o.speed > 0 ? Math.min(11, (1.57 * o.speed) / step) : alert ? 0.4 : 1.0,
    ph = t * sp,
    sw = Math.sin(ph),
    sway = Math.sin(t * 1.1) * 1.6,
    lean = chase ? 0.3 : alert ? 0.07 : 0.0;
  const line = (c, pts, w) => {
    c.lineWidth = w;
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    if (pts.length === 3) {
      // a smooth curve through the middle point (no sharp elbows or knees)
      c.quadraticCurveTo(2 * pts[1][0] - (pts[0][0] + pts[2][0]) / 2, 2 * pts[1][1] - (pts[0][1] + pts[2][1]) / 2, pts[2][0], pts[2][1]);
    } else pts.slice(1).forEach(pt => c.lineTo(pt[0], pt[1]));
    c.stroke();
  };
  // a limb that tapers (thick where it joins the body, thin at the end), so body, neck, arms and legs read as ONE shape
  const taper = (c, pts, r0, r1) => {
    c.beginPath();
    for (let k = 0; k <= 70; k++) {
      const u = k / 70, m = 1 - u,
        cx = 2 * pts[1][0] - (pts[0][0] + pts[2][0]) / 2, cy = 2 * pts[1][1] - (pts[0][1] + pts[2][1]) / 2,
        px = m * m * pts[0][0] + 2 * m * u * cx + u * u * pts[2][0],
        py = m * m * pts[0][1] + 2 * m * u * cy + u * u * pts[2][1],
        r = r0 + (r1 - r0) * Math.pow(u, 1.4); // keeps the width near the joint, then thins out smoothly
      c.moveTo(px + r, py);
      c.arc(px, py, r, 0, Math.PI * 2);
    }
    c.fill();
  };
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  ctx.translate(x, y);
  ctx.scale(o.dir || 1, 1);
  ctx.strokeStyle = ctx.fillStyle = '#06080c';
  ctx.lineCap = ctx.lineJoin = 'round';
  const HIP = -74;
  // soft hip joint: hides the corner between the leaning torso and the legs
  ctx.beginPath();
  ctx.arc(0, HIP + 1, 5, 0, Math.PI * 2);
  ctx.fill();
  // legs: long and thin, a little knee bend; the lower end fades out (no feet)
  const fade = ctx.createLinearGradient(0, -34, 0, 2);
  fade.addColorStop(0, '#06080c');
  fade.addColorStop(1, 'rgba(6,8,12,0)');
  ctx.fillStyle = fade;
  for (let k = 0; k < 2; k++) {
    const f = k ? -sw : sw,
      fx = f * step,
      lift = Math.max(0, Math.cos(ph + (k ? Math.PI : 0))) * (chase ? 8 : 4),
      kx = fx * 0.35 + 3 + (chase ? 5 : 0);
    taper(ctx, [[0, HIP + 1], [kx, HIP / 2 - lift * 0.3], [fx - 2, -lift]], 5, 2.2);
    // no feet: the legs just end, thin and inhuman
  }
  ctx.fillStyle = '#06080c';
  // upper body, leaning from the hips
  ctx.save();
  ctx.translate(0, HIP);
  ctx.rotate(lean + sway * 0.012);
  const SH = -52; // shoulder height above the hips
  // torso: a chain of circles along the spine (wide soft shoulders, slim waist, soft hips): no corners at all
  const rad = u => 3.7 + 0.9 * (1 - u) * (1 - u) + 0.7 * u * u * u, // one soft, continuous taper (u: 0 shoulders .. 1 hips)
    yAt = u => SH + 4 + u * (-SH - 2);
  ctx.beginPath();
  for (let k = 0; k <= 20; k++) ctx[k ? 'lineTo' : 'moveTo'](-rad(k / 20), yAt(k / 20));
  ctx.arc(0, yAt(1), rad(1), Math.PI, 0, true); // rounded hips
  for (let k = 20; k >= 0; k--) ctx.lineTo(rad(k / 20), yAt(k / 20));
  ctx.arc(0, yAt(0), rad(0), 0, Math.PI, true); // rounded shoulders
  ctx.closePath();
  ctx.fill();
  // neck + head (long, no hair)
  const hx = chase ? 7 : alert ? 3 : 1;
  taper(ctx, [[0, SH + 5], [hx * 0.3, SH - 2], [hx * 0.6, SH - 11]], 4.2, 2.3);
  ctx.beginPath();
  ctx.ellipse(hx + 1, SH - 17, 5.2, 8.5, 0.15, 0, Math.PI * 2);
  ctx.fill();
  if (alert) {
    ctx.fillStyle = 'rgba(210,235,255,0.85)';
    ctx.beginPath();
    ctx.arc(hx + 3.2, SH - 18, 1.3, 0, Math.PI * 2);
    ctx.arc(hx + 0.2, SH - 18, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#06080c';
  }
  // arms: very long; hanging when calm, raised when alert, reaching forward when chasing
  for (let k = 0; k < 2; k++) {
    const side = k ? -1 : 1,
      sh = [side * 3, SH + 4],
      sw2 = 0; // the arms never swing: they hang still when calm, and stay raised and reaching when it has seen Bella
    let el, hand;
    if (chase) {
      el = [17 + sw2 * 3, SH + 22 + k * 3];
      hand = [42 + sw2 * 4, SH + 40 + k * 5 - sw2 * 3];
    } else if (alert) {
      el = [10 + side * 2, SH + 28];
      hand = [24 + k * 6, SH + 52 + Math.sin(t * 2.2 + k) * 3];
    } else {
      el = [side * 7 + sw2 * 2, SH + 36];
      hand = [side * 6 + sw2 * 5, SH + 74 + k * 2];
    }
    taper(ctx, [[sh[0] * 0.6, sh[1] + 2], el, hand], 3.6, 1.5);
    // three long fingers
    const fl = 11, dx = hand[0] - el[0], dy = hand[1] - el[1], ang = Math.atan2(dy, dx);
    for (let f = -1; f <= 1; f++) {
      const a = ang + f * 0.28;
      line(ctx, [hand, [hand[0] + Math.cos(a) * fl, hand[1] + Math.sin(a) * fl]], 1.6);
    }
  }
  ctx.restore();
  ctx.restore();
}
