/* Input state (keyboard / mouse / touch) and UI button registry */
/* ---------- input ---------- */
const keys = {},
  keyPressed = {},
  mouse = { x: -1, y: -1, down: false },
  touch = { left: false, right: false, jump: false, pid: null, sx: 0, sy: 0, active: false, seen: false, jumpHeld: false, jumpPid: null, fs: false, jumpUntil: 0 };
const ui = { btns: [], menu: [], focus: 0, confirmNew: false };
function down(code) {
  return !!keys[code];
}
const isLeft = () => down('ArrowLeft') || down('KeyA') || touch.left;
const isRight = () => down('ArrowRight') || down('KeyD') || touch.right;
const isJump = () => down('Space') || down('ArrowUp') || down('KeyW') || touch.jumpHeld || performance.now() < touch.jumpUntil;
