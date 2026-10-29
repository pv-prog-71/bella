/* Level helpers: level base, platforms, items, gates, orb layouts */
function baseLevel(idx, biome, w) {
  return {
    idx,
    biome,
    w,
    top: 0, // how many pixels the level extends ABOVE y = 0 (set it where the level has high ledges)
    solids: [],
    orbs: [],
    items: [],
    enemies: [],
    bubbles: [],
    p: {},
    orbValue: ORB_VALUE[idx],
    water: [],
    t: 0,
    exitX: w - 160,
    spawn: { x: 120, y: GY },
    back: null,
    front: null
  };
}
const ground = (x, w) => ({ x, y: GY, w, h: 220, k: 'ground' });
const hill = (x, w, h) => ({ x, y: GY - h, w, h: h + 10, k: 'ground' });
const plat = (x, y, w, h, k) => ({ x, y, w, h: h || 18, oneway: true, k: k || 'log' });
// Adds the climbing towers of a biome (see config/towers.js): the ledges, the deck at the top and a few orbs up there.
function addTowers(L) {
  const deckKind = { forest: 24, mountain: 22, alt: 22 }[L.biome] || 18; // the deck uses the thicker strip when the biome has one
  const ledgeKind = L.biome === 'mountain' || L.biome === 'alt' ? 'ledge' : 'log';
  L.top = TOWER_TOP;
  (TOWERS[L.biome] || []).forEach(t => {
    towerLedges(t).forEach(ledge => {
      L.solids.push(plat(ledge.x, ledge.y, ledge.w, ledge.deck ? deckKind : 18, ledgeKind));
      if (ledge.deck && !L.alt) orbArc(L, t.x, ledge.y - 36, 7, 240, 50);
    });
  });
}
function orbArc(L, x, y, n, spread, h) {
  for (let i = 0; i < n; i++) {
    const u = n === 1 ? 0.5 : i / (n - 1);
    L.orbs.push({
      x: x + (u - 0.5) * spread,
      y: y - Math.sin(u * Math.PI) * h,
      got: false,
      ph: L.orbs.length * 0.7
    });
  }
}
function orbRow(L, x, y, n, gap) {
  for (let i = 0; i < n; i++)
    L.orbs.push({ x: x + i * gap, y, got: false, ph: L.orbs.length * 0.7 });
}
function mkItem(type, x, y) {
  return {
    type,
    x,
    y,
    vx: 0,
    vy: 0,
    state: 'ground',
    rest: true,
    peak: y,
    cool: 0,
    home: { x, y }
  };
}
function addGate(L, kind) {
  L.gate = { x: L.exitX, kind, open: 0 };
  L.solids.push({ x: L.exitX, y: -1000, w: 24, h: GY + 1000, gate: true, k: 'gate', noPaint: true });
}
function openGate(L) {
  L.solids = L.solids.filter(s => !s.gate);
  L.gateOpening = true;
}
function stepItem(it, dt, L) {
  if (it.state === 'held' || it.rest) return;
  it.vy = Math.min(900, it.vy + 1500 * dt);
  const pb = it.y + 12;
  it.x += it.vx * dt;
  it.y += it.vy * dt;
  it.vx *= Math.max(0, 1 - 2.5 * dt);
  if (it.vy < 0) it.peak = Math.min(it.peak, it.y);
  const nb = it.y + 12;
  if (it.vy >= 0)
    for (const s of L.solids) {
      if (s.gate) continue;
      if (it.x > s.x - 4 && it.x < s.x + s.w + 4 && pb <= s.y + 3 && nb >= s.y) {
        it.y = s.y - 12;
        it.vy = 0;
        it.vx = 0;
        it.rest = true;
        it.landed = true;
        return;
      }
    }
  if (it.y > 560) {
    it.x = it.home.x;
    it.y = it.home.y;
    it.vy = 0;
    it.vx = 0;
    it.rest = true;
    it.peak = it.y;
  }
}
