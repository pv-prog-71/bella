/* Main loop and boot (loaded last) */
/* ---------- loop ---------- */
function stepGame(dt) {
  G.t += dt;
  if (G.state === 'play') {
    if (!G.paused) {
      const n = Math.max(1, Math.ceil(dt / 0.02));
      for (let i = 0; i < n; i++) playUpdate(dt / n);
    }
  } else if (G.state === 'intro') introUpdate(dt);
  else if (G.state === 'endcard') {
    G.endT += dt;
    if (G.fadeA > 0) G.fadeA = Math.max(0, G.fadeA - dt * 0.6);
  }
}
let lastT = performance.now();
let frameMs = 16,
  slowT = 0,
  showFps = false,
  worstMs = 0,
  worstT = 0,
  worstShown = 0;
function frame(now) {
  const raw = now - lastT,
    dt = Math.min(0.1, raw / 1000);
  lastT = now;
  stepGame(dt);
  render();
  // slow machine: lower the drawing resolution step by step (never raised again, so it does not flicker)
  if (G.state === 'play' && !G.loading && raw < 400) {
    frameMs += (raw - frameMs) * 0.05;
    slowT = frameMs > 26 ? slowT + raw / 1000 : 0;
    if (slowT > 2 && RES_Q > 0.5) {
      RES_Q = Math.max(0.5, RES_Q * 0.8);
      slowT = 0;
      resize();
    }
  }
  if (raw < 400) worstMs = Math.max(worstMs, raw);
  if ((worstT += raw / 1000) > 2) {
    worstShown = worstMs;
    worstMs = 0;
    worstT = 0;
  }
  if (showFps) {
    cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.fillStyle = 'rgba(0,0,0,0.6)';
    cx.fillRect(6, 6, 250, 22);
    cx.fillStyle = '#9fe8a0';
    cx.font = '13px monospace';
    cx.textAlign = 'left';
    cx.fillText(
      `${Math.round(1000 / frameMs)} fps  worst ${Math.round(worstShown)} ms  ${cv.width}x${cv.height}  q${RES_Q.toFixed(2)}`,
      12,
      21
    );
  }
  requestAnimationFrame(frame);
}
window.addEventListener('keydown', e => {
  if (e.key === 'F3') {
    showFps = !showFps;
    e.preventDefault();
  }
});

/* ---------- boot ---------- */
(function boot() {
  resize();
  try {
    ['500', '600'].forEach(w => document.fonts && document.fonts.load(`${w} 20px Fredoka`));
  } catch (e) {}
  const img = new Image();
  img.onload = () => bellaBuild(img);
  img.src = BELLA_SRC;
  loadSave();
  console.info(
    `Bella's Journey v${GAME_VERSION} (GDD v${GDD_REF.gdd}, Addendum v${GDD_REF.addendum})`
  );
  // debug / test hook used by tests/*.js (harmless in production)
  window.__bella = {
    version: GAME_VERSION,
    preloadAll: () => loadImages(groupNames(Object.keys(ASSET_MANIFEST.groups))),
    closeDialog,
    startEnding,
    changeLevel,
    leaveAlt,
    G,
    stepGame,
    render,
    loadLevel,
    castSpell,
    useItem,
    keys,
    ui,
    SND,
    beginPlay,
    startNewGame,
    buildAlt,
    hurt,
    enterAlt,
    startSeizure,
    mouse,
    resize,
    sim(sec, step) {
      step = step || 1 / 60;
      for (let t = 0; t < sec; t += step) stepGame(step);
    }
  };
  requestAnimationFrame(frame);
})();
