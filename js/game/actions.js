/* Items, health, death and spell casting */
/* ---------- item handling ---------- */
function useItem() {
  const it = G.held,
    b = G.bella,
    L = G.L;
  if (!it || G.dialog || G.sub || G.paused || G.alt || G.state !== 'play') return;
  G.hintT = 0;
  if (L.onUse && L.onUse(it)) return;
  it.state = 'ground';
  it.rest = false;
  it.landed = false;
  it.x = b.x + b.face * 30;
  it.y = b.y - 30;
  it.vx = b.face * 70;
  it.vy = -170;
  it.peak = it.y;
  it.cool = 0.7;
  G.held = null;
  SND.sfx('drop');
}

/* ---------- health ---------- */
function hurt(dmg, srcX, quiet) {
  const b = G.bella;
  if (b.inv > 0 || G.fx.resist > 0 || G.sub) return false;
  G.hp = Math.max(0, G.hp - dmg);
  b.inv = 1.5;
  G.sinceHurt = 0;
  G.hurtFx = 1;
  SND.sfx('hurt');
  if (!quiet) {
    b.vx = (b.x >= srcX ? 1 : -1) * 240;
    b.vy = -300;
    b.onGround = false;
  }
  if (G.hp <= 0) die();
  return true;
}
function die() {
  if (G.sub === 'dying') return;
  G.sub = 'dying';
  G.dieT = 0;
  G.fadeTo = 1;
  G.fadeSpd = 0.9;
  G.held = null;
  SND.sfx('dead');
}
function respawnAfterDeath() {
  loadLevel(G.lvl, { fade: 3 });
  G.fadeA = 1;
  G.fadeTo = 0;
  G.fadeSpd = 0.8;
  G.titleCard = null;
  toast(tr('toast.retry'), 3.2);
}

/* ---------- spells (Alternate World) ---------- */
function castSpell(i) {
  if (G.state !== 'play' || G.sub || G.dialog || G.paused || !G.alt) return;
  const S = SPELLS[i];
  if (!G.spells[i]) return;
  if (i < 3 && G.fx[['invis', 'jump', 'resist'][i]] > 0) return;
  if (i === 3 && G.wave) return;
  if (G.mana < S.cost) {
    SND.sfx('full');
    toast(tr('toast.noMana', { cost: S.cost }), 1.8);
    return;
  }
  G.mana -= S.cost;
  SND.sfx('spell' + (i + 1));
  const b = G.bella;
  if (i === 0) G.fx.invis = S.dur;
  else if (i === 1) G.fx.jump = S.dur;
  else if (i === 2) G.fx.resist = S.dur;
  else {
    G.wave = { t: 0, x: b.x, y: b.y - 30 };
  }
  spawnSparks(b.x, b.y - 30, S.col, 18);
}
