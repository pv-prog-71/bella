/* Canvas setup, responsive resize, vignette */
const cv = document.getElementById('game'),
  cx = cv.getContext('2d');
let K = 1;
function resize() {
  const host = document.getElementById('stage'),
    vv = window.visualViewport,
    bw = Math.min(host.clientWidth, window.innerWidth - 32, vv ? vv.width - 32 : 1e9),
    bh = Math.min(host.clientHeight, window.innerHeight - 16, vv ? vv.height - 16 : 1e9);
  if (!(bw > 40) || !(bh > 40)) return;
  const s = Math.min(bw / W, bh / H),
    cw = Math.floor(W * s),
    ch = Math.floor(H * s),
    dpr = Math.min(2, window.devicePixelRatio || 1);
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
