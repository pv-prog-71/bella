/* Ending sequence */
/* ---------- ending ---------- */
function startEnding() {
  G.sub = 'ending';
  G.end = { t: 0, st: 0 };
  SND.music('ending', 3);
  deleteSave();
}
function endingUpdate(dt) {
  const e = G.end,
    b = G.bella,
    L = G.L;
  e.t += dt;
  if (e.st === 0) {
    b.face = 1;
    b.x += 120 * dt;
    b.vx = 120;
    b.phase += dt * 9;
    b.onGround = true;
    b.air = 0;
    const tx = clamp(b.x - 480 + 70, 0, L.w - W);
    G.cam.x += (tx - G.cam.x) * Math.min(1, dt * 3);
    if (b.x >= 4630) {
      e.st = 1;
      e.t = 0;
      b.vx = 0;
    }
  } else if (e.st === 1) {
    b.vx = 0;
    if (!e.barked && e.t > 0.5) {
      e.barked = true;
      SND.sfx('bark');
      G.say(b.x, b.y - 80, tr('bubble.woof'), 1.8);
    }
    if (e.t > 2.4) {
      e.st = 2;
      e.t = 0;
      SND.sfx('door');
    }
  } else if (e.st === 2) {
    if (!e.said && e.t > 1.2) {
      e.said = true;
      SND.sfx('good');
    }
    if (e.t > 7) {
      e.st = 3;
      e.t = 0;
      G.fadeTo = 1;
      G.fadeSpd = 0.5;
    }
  } else if (e.st === 3) {
    if (G.fadeA >= 1) {
      G.state = 'endcard';
      G.endT = 0;
      G.fadeTo = 0;
      G.fadeA = 1;
      G.fadeSpd = 0.6;
      G.sub = null;
    }
  }
  if (G.fadeA !== G.fadeTo) {
    const d = G.fadeSpd * dt;
    G.fadeA =
      G.fadeA < G.fadeTo ? Math.min(G.fadeTo, G.fadeA + d) : Math.max(G.fadeTo, G.fadeA - d);
  }
}
