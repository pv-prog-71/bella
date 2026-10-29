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

// Shadow creature of the alternate world. States: patrol (calm), detect (alert), chase (alert + leaning).
function drawShadow(ctx, x, y, o) {
  const clipName = o.lean ? 'shadow_chase' : o.alert ? 'shadow_alert' : 'shadow_calm',
    sway = x / 1.6;   // every shadow sways at its own moment
  drawClip(ctx, clipName, x, y, (o.t || 0) + sway, { dir: o.dir, alpha: o.alpha });
}
