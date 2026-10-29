/* Master render function */
/* ---------- master render ---------- */
function render() {
  const c = cx;
  c.setTransform(K, 0, 0, K, 0, 0);
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = 'low'; // 'high' was about 3x slower per frame on weak machines and the difference is not visible
  ui.btns = [];
  ui.menu = [];
  if (G.state === 'title') drawTitle(c);
  else if (G.state === 'credits') drawCredits(c);
  else if (G.state === 'bye') drawBye(c);
  else if (G.state === 'endcard') drawEndCard(c);
  else if (G.state === 'intro') drawIntro(c);
  else if (G.state === 'play' && G.L) {
    drawWorld(c);
    if (G.sub === 'seizure') drawSeizure(c);
    else if (G.sub !== 'ending') drawHUD(c);
    if (G.dialog) drawDialog(c);
    if (G.fadeA > 0.001) {
      c.fillStyle = `rgba(0,0,4,${G.fadeA})`;
      c.fillRect(0, 0, W, H);
    }
    if (G.sub === 'dying' && G.fadeA > 0.5)
      T(
        c,
        G.alt ? tr('death.alt') : tr('death.normal'),
        W / 2,
        H / 2,
        30,
        'rgba(255,255,255,' + clamp((G.fadeA - 0.5) * 2, 0, 1) + ')',
        'center',
        500
      );
    if (G.paused) drawPause(c);
  }
  if (G.loading) drawLoading(c);
  if (ui.focus >= ui.menu.length) ui.focus = Math.max(0, ui.menu.length - 1);
  mouse.moved = false;
}

// shown while a level's image files are loading (normally well under a second)
function drawLoading(c) {
  const l = G.loading;
  l.t += 1 / 60;
  c.fillStyle = 'rgba(7,11,16,0.92)';
  c.fillRect(0, 0, W, H);
  if (l.err) {
    T(c, tr('ui.loadError'), W / 2, H / 2, 20, '#ffd0d0', 'center', 500);
    return;
  }
  T(c, tr('ui.loading'), W / 2, H / 2 - 6, 26, '#f4efe4', 'center', 500);
  c.fillStyle = 'rgba(255,255,255,0.15)';
  rrect(c, W / 2 - 80, H / 2 + 16, 160, 8, 4);
  c.fill();
  c.fillStyle = '#ffd36a';
  const u = (l.t * 0.8) % 1;
  rrect(c, W / 2 - 80 + u * 100, H / 2 + 16, 60, 8, 4);
  c.fill();
}
