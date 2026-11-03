/* Parallax background layers (images in assets/images/parallax), sky and glow sprite */
const TILE = 1920;
const LAYER_SPEED = {
  forest: [0.1, 0.25, 0.5],
  swamp: [0.1, 0.28, 0.55],
  mountain: [0.06, 0.22, 0.5],
  village: [0.05, 0.22, 0.5],
  alt: [0.1, 0.3, 0.55],
  night: [0.1, 0.28, 0.55]
};
// The layers stay fixed on the screen when the camera climbs a tower: their trunks and tree tops run off the edge of the
// picture, so moving them up or down would show a straight cut.
function drawLayers(c, biome, camx, t) {
  LAYER_SPEED[biome].forEach((p, i) => {
    const im = IMG['parallax/' + biome + '_' + i];
    if (!im) return;
    const sx = Math.floor((camx * p) % TILE),
      w1 = Math.min(960, TILE - sx);
    c.drawImage(im, sx, 0, w1, 480, 0, 0, w1, 480);
    if (w1 < 960) c.drawImage(im, 0, 0, 960 - w1, 480, w1, 0, 960 - w1, 480);
  });
}
// pre-rendered soft glow used for fireflies etc.
const GLOW = (function () {
  const c = mkc(32, 32),
    x = c.getContext('2d'),
    g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,248,170,1)');
  g.addColorStop(1, 'rgba(255,248,170,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 32, 32);
  return c;
})();
function drawSky(c, biome, t, camx) {
  const P = PAL[biome],
    g = c.createLinearGradient(0, 0, 0, 440);
  g.addColorStop(0, P.sky[0]);
  g.addColorStop(1, P.sky[1]);
  c.fillStyle = g;
  c.fillRect(0, 0, 960, 540);
  if (biome === 'village') {
    for (let i = 0; i < 5; i++) {
      const x = ((i * 330 + t * 6 - camx * 0.03) % 1500) - 200;
      cloud(c, x, 70 + ((i * 53) % 110), 1.1 + (i % 3) * 0.3, 0.85);
    }
    c.fillStyle = 'rgba(255,248,200,0.9)';
    ell(c, 760, 90, 34, 34);
    c.fill();
    const sg = c.createRadialGradient(760, 90, 20, 760, 90, 180);
    sg.addColorStop(0, 'rgba(255,248,200,0.5)');
    sg.addColorStop(1, 'rgba(255,248,200,0)');
    c.fillStyle = sg;
    c.fillRect(560, 0, 400, 300);
  }
  if (biome === 'mountain') {
    for (let i = 0; i < 4; i++) {
      const x = ((i * 400 + t * 4 - camx * 0.02) % 1600) - 200;
      cloud(c, x, 60 + i * 28, 1.4, 0.55);
    }
  }
  if (biome === 'forest') {
    // slow light shafts (no flicker)
    c.save();
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const x0 = 120 + i * 190 - ((camx * 0.05) % 190),
        a = 0.05 + 0.025 * Math.sin(t * 0.25 + i);
      c.fillStyle = `rgba(255,248,190,${a})`;
      c.beginPath();
      c.moveTo(x0, 0);
      c.lineTo(x0 + 70, 0);
      c.lineTo(x0 + 260, 420);
      c.lineTo(x0 + 120, 420);
      c.closePath();
      c.fill();
    }
    c.restore();
  }
}
