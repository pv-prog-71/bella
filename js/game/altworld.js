/* Seizure transition and the trip to / from the Alternate World */
/* ---------- seizure transition (Addendum 3.2): slow, continuous, no flashing ---------- */
function startSeizure() {
  if (G.sub) return;
  G.sub = 'seizure';
  G.sz = { t: 0, bx: 130 + Math.random() * 120 };
  G.bella.vx = 0;
  G.held && (G.held.state = 'held');
  SND.music('alt', 7.5);
}
function enterAlt() {
  const L = G.L;
  G.normalL = L;
  G.normalPos = { x: G.bella.x, y: G.bella.y, face: G.bella.face };
  const A = buildAlt(G.lvl);
  G.L = A;
  G.mode = 'alt';
  G.sub = null;
  G.sz = null;
  const b = G.bella;
  b.x = A.spawn.x;
  b.y = GY;
  b.vx = b.vy = 0;
  b.inv = 1.5;
  b.face = 1;
  G.cam.x = 0;
  b.standY = null;
  G.cam.y = cameraTargetY();
  G.fx = { invis: 0, jump: 0, resist: 0 };
  G.wave = null;
  G.portalCool = 1;
  initParts('alt');
  G.fadeA = 1;
  G.fadeTo = 0;
  G.fadeSpd = 0.7;
  G.titleCard = { text: tr('alt.title'), t: 0, sub: true };
  G.hintT = 0;
}
function leaveAlt() {
  G.sub = 'returning';
  G.fadeTo = 1;
  G.fadeSpd = 0.8;
  SND.music(G.normalL.theme, 5);
  G.musicName = G.normalL.theme;
}
function finishReturn() {
  G.L = G.normalL;
  G.normalL = null;
  G.mode = 'normal';
  G.sub = null;
  const b = G.bella;
  b.x = G.normalPos.x;
  b.y = G.normalPos.y;
  b.vx = b.vy = 0;
  b.inv = 2;
  b.face = G.normalPos.face || 1;
  G.fx = { invis: 0, jump: 0, resist: 0 };
  G.wave = null;
  G.cam.x = clamp(b.x - 300, 0, G.L.w - W);
  b.standY = null;
  G.cam.y = cameraTargetY();
  initParts(G.L.biome);
  G.fadeA = 1;
  G.fadeTo = 0;
  G.fadeSpd = 0.6;
  G.sinceHurt = 0;
  if (G.L.isLast) {
    b.x = Math.max(b.x, G.L.exitX);
    b.y = GY;
    b.onGround = true;
    startEnding();
    return;
  }
  toast(tr('toast.back'), 3);
  writeSave();
}
