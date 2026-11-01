/* Input state (keyboard / mouse / touch) and UI button registry */
/* ---------- input ---------- */
const keys = {},
  keyPressed = {},
  mouse = { x: -1, y: -1, down: false },
  touch = { left: false, right: false, jump: false, jumpHeld: false, seen: false, fs: false, hinted: false, pids: {} };
// on-screen touch buttons (logical 960x540 coordinates): arrows bottom left, jump and use bottom right
const TBTN = {
  left: { x: 76, y: 400, r: 55 },
  right: { x: 198, y: 400, r: 55 },
  jump: { x: 888, y: 400, r: 54 },
  use: { x: 772, y: 400, r: 44 }
};
function touchBtnAt(p, only) {
  let best = null,
    bd = 1e9;
  for (const k in TBTN) {
    if (only && !only.includes(k)) continue;
    if (k === 'use' && G.alt) continue; // items are not used in the other world
    const b = TBTN[k],
      d = Math.hypot(p.x - b.x, p.y - b.y);
    if (d <= b.r + 10 && d < bd) ((best = k), (bd = d));
  }
  return best;
}
const ui = { btns: [], menu: [], focus: 0, confirmNew: false };
function down(code) {
  return !!keys[code];
}
const isLeft = () => down('ArrowLeft') || down('KeyA') || touch.left;
const isRight = () => down('ArrowRight') || down('KeyD') || touch.right;
const isJump = () => down('Space') || down('ArrowUp') || down('KeyW') || touch.jumpHeld;
