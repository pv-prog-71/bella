/* Bella movement and collision */
/* ---------- Bella physics ---------- */
function stepBella(dt) {
  const b = G.bella,
    L = G.L;
  let ax = 0;
  if (isLeft()) ax -= 1;
  if (isRight()) ax += 1;
  const sp = 235;
  b.vx += (ax * sp - b.vx) * Math.min(1, dt * (b.onGround ? 15 : 7));
  if (ax) b.face = ax > 0 ? 1 : -1;
  if (b.onGround) b.coyote = 0.1;
  else b.coyote -= dt;
  if (b.buf > 0) b.buf -= dt;
  const jumpNow = isJump() || touch.jump;
  if (jumpNow && !b.jumpHeld) b.buf = 0.12;
  if (b.buf > 0 && b.coyote > 0) {
    b.vy = G.fx.jump > 0 ? -905 : -575;
    b.onGround = false;
    b.coyote = 0;
    b.buf = 0;
    b.jumpTaken = true;
    SND.sfx('jump');
    if (Math.random() < BARK_ON_JUMP) SND.sfx('bella_bark'); // now and then Bella barks as she jumps
    if (G.fx.jump > 0) spawnSparks(b.x, b.y, '#8fe05a', 10);
  }
  if (!jumpNow && b.vy < -200 && b.jumpTaken) {
    b.vy *= 0.55;
    b.jumpTaken = false;
  }
  b.jumpHeld = jumpNow;
  touch.jump = false;
  b.vy = Math.min(900, b.vy + (b.vy > 0 ? 1750 : 1500) * dt);
  const wasAir = !b.onGround,
    pvy = b.vy;
  // X
  b.x += b.vx * dt;
  for (const s of L.solids) {
    if (s.oneway) continue;
    if (b.x + HW > s.x && b.x - HW < s.x + s.w && b.y - 0.01 > s.y && b.y - HH < s.y + s.h) {
      if (b.vx > 0) b.x = s.x - HW;
      else if (b.vx < 0) b.x = s.x + s.w + HW;
      else b.x = b.x < s.x + s.w / 2 ? s.x - HW : s.x + s.w + HW;
      b.vx = 0;
    }
  }
  b.x = clamp(b.x, HW, L.w - HW);
  // Y
  const pf = b.y;
  b.y += b.vy * dt;
  b.onGround = false;
  for (const s of L.solids) {
    if (!(b.x + HW > s.x && b.x - HW < s.x + s.w)) continue;
    if (s.oneway) {
      if (b.vy >= 0 && pf <= s.y + 1 && b.y >= s.y) {
        b.y = s.y;
        b.vy = 0;
        b.onGround = true;
      }
    } else if (b.y > s.y && b.y - HH < s.y + s.h) {
      if (b.vy >= 0 && pf <= s.y + 6) {
        b.y = s.y;
        b.vy = 0;
        b.onGround = true;
      } else if (b.vy < 0) {
        b.y = s.y + s.h + HH;
        b.vy = 0;
      }
    }
  }
  if (b.onGround && wasAir && pvy > 380) {
    b.squash = 1;
    SND.sfx('land');
  }
  b.squash = Math.max(0, b.squash - dt * 6);
  if (b.onGround && Math.abs(b.vx) > 20) b.phase += dt * (6 + Math.abs(b.vx) * 0.034);
  b.air = b.onGround ? 0 : b.vy < 0 ? -1 : 1;
  if (b.inv > 0) b.inv -= dt;
}
