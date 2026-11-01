/* Toasts, speech bubbles, dialogs, rewards, sparks */
/* ---------- small helpers ---------- */
const maxMana = () => ORB_MAX[Math.min(3, G.lvl)];
// Vertical camera: 0 on the ground; it climbs when Bella stands on a high ledge but does not follow ordinary jumps.
// The result is always between -L.top and 0.
// True when this world point is inside the screen (used so a character only speaks when the player can see it)
function onScreen(x, y) {
  const sx = x - G.cam.x,
    sy = y - G.cam.y;
  return sx > 40 && sx < W - 40 && sy > 60 && sy < 470;
}
function cameraTargetY() {
  const L = G.L,
    b = G.bella;
  if (!L.top) return 0;
  if (L.lookDown) return 0; // a level asks for the ground-level view (e.g. the snake fleeing below Bella)
  if (b.onGround || b.standY == null) b.standY = b.y;
  let target = Math.min(0, b.standY - 330);
  target = Math.min(target, b.y - 140); // a high jump upwards: keep her on screen
  target = Math.max(target, b.y - 470); // falling down
  return clamp(target, -L.top, 0);
}
function toast(text, dur) {
  if (G.toasts.some(t => t.text === text)) return; // never stack the same message twice
  G.toasts.push({ text, t: 0, dur: dur || 2.8 });
  if (G.toasts.length > 3) G.toasts.shift();
}
G.say = function (x, y, text, secs) {
  G.bubbles.push({ x, y, text, t: 0, dur: secs || 2 });
};
G.openDialog = function (who, text, cb) {
  G.dialog = { who, text, cb, t: 0 };
  SND.sfx('ui');
};
function closeDialog() {
  const d = G.dialog;
  if (!d) return;
  G.dialog = null;
  G.hintT = 0;
  SND.sfx('ui');
  if (d.cb) d.cb();
}
G.reward = function (i, who, text) {
  const L = G.L;
  G.openDialog(who, text, () => {
    G.spells[i] = true;
    G.puz[L.idx] = true;
    G.puzPos[L.idx] = { x: Math.round(G.bella.x), y: Math.round(G.bella.y) };
    openGate(L);
    SND.sfx('spellget');
    toast(tr('toast.spellLearned', { name: SPELLS[i].name }), 4.2);
    writeSave();
    G.szPending = true;
  });
  SND.sfx('good');
};
function spawnSparks(x, y, col, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU,
      s = 40 + Math.random() * 90;
    G.sparks.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 40,
      t: 0,
      dur: 0.6 + Math.random() * 0.4,
      col
    });
  }
}
const rectsOverlap = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
