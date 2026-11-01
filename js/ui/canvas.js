/* Canvas setup, responsive resize, vignette */
const cv = document.getElementById('game'),
  cx = cv.getContext('2d');
let K = 1;
// render quality 0.5..1, lowered by the main loop when the frames are slow
let RES_Q = 1;
const COARSE = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches); // phones/tablets: use the whole screen, no gutter
function resize() {
  const host = document.getElementById('stage'),
    vv = window.visualViewport,
    bw = Math.min(host.clientWidth, window.innerWidth - (COARSE ? 0 : 32), vv ? vv.width - (COARSE ? 0 : 32) : 1e9),
    bh = Math.min(host.clientHeight, window.innerHeight - (COARSE ? 0 : 16), vv ? vv.height - (COARSE ? 0 : 16) : 1e9);
  if (!(bw > 40) || !(bh > 40)) return;
  const s = Math.min(bw / W, bh / H),
    cw = Math.floor(W * s),
    ch = Math.floor(H * s),
    // the picture is drawn at most 1600 px wide and gets smaller on its own if the machine is slow (see main.js);
    // the browser scales it up to the window, so a big or full-screen window does not cost more
    dpr = Math.min(2, window.devicePixelRatio || 1, 1600 / cw) * RES_Q;
  cv.style.width = cw + 'px';
  cv.style.height = ch + 'px';
  cv.width = Math.round(cw * dpr);
  cv.height = Math.round(ch * dpr);
  K = cv.width / W;
}
const DARK = (function () {
  const c = mkc(480, 270);
  return { c, x: c.getContext('2d'), w: 480, h: 270 };
})();
let VIG = null;
function vignette() {
  if (VIG) return VIG;
  const c = mkc(W, H),
    x = c.getContext('2d'),
    g = x.createRadialGradient(W / 2, H / 2, 260, W / 2, H / 2, 620);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.5)');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  VIG = c;
  return c;
}
