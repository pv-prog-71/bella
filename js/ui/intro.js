/* Opening story cut-scene */
/* ---------- intro cutscene ---------- */
const INTRO = [
  { bg: 0, text: tr('intro.1') },
  { bg: 0, text: tr('intro.2') },
  { bg: 0, text: tr('intro.3') },
  { bg: 0, text: tr('intro.4') },
  { bg: 1, text: tr('intro.5') },
  { bg: 1, text: tr('intro.6') },
  { bg: 1, text: tr('intro.7') },
  { bg: 1, text: tr('intro.8') },
  { bg: 1, text: tr('intro.9') }
];
function introDur(i) {
  return 1.9 + INTRO[i].text.length * 0.045;
}
function introNext() {
  const I = G.intro;
  if (I.done) return; // already starting the game (a second click or key press must not start it twice)
  I.i++;
  I.t = 0;
  if (I.i >= INTRO.length) {
    I.i = INTRO.length - 1; // the intro is still drawn while the first level loads
    I.done = true;
    beginPlay(0);
  }
}
function introUpdate(dt) {
  const I = G.intro;
  if (I.done) return;
  I.t += dt;
  if (I.t > introDur(I.i)) introNext();
}
function drawIntro(c) {
  const I = G.intro,
    cur = INTRO[I.i];
  let bgA = cur.bg ? clamp((I.i === 4 ? I.t : 99) / 2.2, 0, 1) : 0;
  c.fillStyle = '#000';
  c.fillRect(0, 0, W, H);
  if (cur.bg) {
    c.globalAlpha = bgA;
    drawNightBackdrop(c, 900, 0.35);
    bellaDraw(c, 190, 470, {
      face: 1,
      t: G.t,
      scale: 1.0,
      alpha: 0.9,
      glow: [200, 230, 255, 0.4],
      rim: 4
    });
    c.globalAlpha = 1;
  }
  let y = cur.bg ? 150 : 200;
  for (let i = 0; i <= I.i; i++) {
    if (INTRO[i].bg !== cur.bg) continue;
    const age = i === I.i ? I.t : 99,
      a = clamp(age / 0.8, 0, 1);
    c.globalAlpha = a;
    const lines = wrapLines(c, INTRO[i].text, 560, 24, 500);
    lines.forEach(ln => {
      T(c, ln, cur.bg ? 340 : 280, y, 24, '#f4f4f0', 'left', 500, { w: 5, c: 'rgba(0,0,0,0.6)' });
      y += 32;
    });
    y += 10;
    c.globalAlpha = 1;
  }
  addBtn(W - 130, H - 56, 104, 38, () => { if (!I.done) { I.done = true; beginPlay(0); } }, false);
  pill(c, W - 130, H - 56, 104, 38, 'rgba(255,255,255,0.92)', 10);
  T(c, tr('intro.skip'), W - 78, H - 31, 18, '#222', 'center', 600);
  T(c, tr('intro.continue'), 30, H - 30, 14, 'rgba(255,255,255,0.4)', 'left', 400);
}
