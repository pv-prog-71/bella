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
function frame(now) {
  const dt = Math.min(0.1, (now - lastT) / 1000);
  lastT = now;
  stepGame(dt);
  render();
  requestAnimationFrame(frame);
}

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
