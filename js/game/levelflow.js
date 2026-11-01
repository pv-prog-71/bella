/* Loading levels, new game / continue, level change */
/* ---------- levels ---------- */
function applyDone(L) {
  const p = L.p;
  p.spoke = true;
  p.done = true;
  openGate(L);
  L.gateT = 9;
  if (L.idx === 0) {
    p.hit = true;
    p.happy = 1;
    p.snakeX = 0;
    L.items = L.items.filter(i => i.type !== 'rock');
  }
  if (L.idx === 1) {
    p.plank = true;
    p.frogDone = true;
    p.frogX = 1500;
    p.bird = 'gone';
    p.branchSpawned = true;
    p.seeds = 3;
    L.solids.push({ x: 2190, y: GY, w: 290, h: 14, oneway: true, k: 'bridge', dyn: true });
    L.items = L.items.filter(i => i.type !== 'branch');
  }
  if (L.idx === 2) {
    p.honey = true;
    p.eat = 9;
    p.bearHappy = true;
    p.lured = false;
  }
  if (L.idx === 3) {
    p.cut = true;
    p.cutT = 9;
    L.items = L.items.filter(i => i.type !== 'bone' && i.type !== 'knife');
  }
}
function loadLevel(i, opt) {
  opt = opt || {};
  G.lvl = i;
  G.mode = 'normal';
  G.normalL = null;
  G.sub = null;
  G.dialog = null;
  G.held = null;
  G.bubbles = [];
  G.wave = null;
  G.fx = { invis: 0, jump: 0, resist: 0 };
  releaseExcept(levelGroups(i));
  const L = LEVEL_BUILDERS[i]();
  G.L = L;
  if (G.puz[i]) applyDone(L);
  const b = G.bella;
  b.x = opt.x != null ? opt.x : L.spawn.x;
  b.y = GY;
  b.vx = b.vy = 0;
  b.face = 1;
  b.inv = 1.2;
  b.onGround = true;
  G.hp = 100;
  G.cam.x = clamp(b.x - 300, 0, L.w - W);
  b.standY = null;
  G.cam.y = cameraTargetY();
  G.hintT = 0;
  G.seizureTimer = -1;
  G.szPending = !!G.puz[i];
  G.lastSafe = { x: b.x, y: GY };
  initParts(L.biome);
  SND.music(L.theme, opt.fade == null ? 2.5 : opt.fade);
  G.musicName = L.theme;
  G.mana = Math.min(G.mana, maxMana());
  writeSave();
}
function initParts(biome) {
  G.parts = [];
  const n = biome === 'mountain' ? 70 : biome === 'alt' ? 50 : 32;
  for (let i = 0; i < n; i++)
    G.parts.push({
      x: Math.random() * W,
      y: Math.random() * H,
      ph: Math.random() * 6,
      sz: 1 + Math.random() * 2,
      sp: 0.5 + Math.random()
    });
}
function startNewGame() {
  deleteSave();
  G.puzPos = [null, null, null, null];
  G.puz = [false, false, false, false];
  G.spells = [false, false, false, false];
  G.mana = 0;
  G.lvl = 0;
  G.state = 'intro';
  G.showControls = true;
  G.intro = { i: 0, t: 0 };
  preloadLevel(0); // download the first level while the story is read
  SND.music('title', 2);
}
function beginPlay(i, opt) {
  if (G.loading) return;
  ensureAssets(levelGroups(i), () => {
    G.state = 'play';
    G.paused = false;
    loadLevel(i, opt);
    G.fadeA = 1;
    G.fadeTo = 0;
    G.fadeSpd = 0.8;
    G.titleCard = { text: G.L.name, t: 0 };
    if (G.showControls && i === 0 && !G.puz[0] && !(COARSE || touch.seen)) toast(tr('toast.controls'), 6); // only after a new game, not on every Continue
    G.showControls = false;
    setTimeout(() => preloadLevel(i + 1), 4000); // and the next one while this one is played
  });
}
function continueGame() {
  const s = loadSave();
  if (!s) return startNewGame();
  G.puz = s.puz.slice();
  G.puzPos = (s.pp || [null, null, null, null]).slice();
  G.spells = s.spells.slice();
  G.mana = s.mana;
  G.lvl = s.lvl;
  beginPlay(s.lvl, {});
}
function changeLevel(next) {
  if (G.sub) return;
  G.sub = 'lvlchange';
  G.fadeTo = 1;
  G.fadeSpd = 0.9;
  G.nextLvl = next;
  preloadLevel(next); // the fade-out gives the download a head start
}
