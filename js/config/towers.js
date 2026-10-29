/* Climbing towers: tall landmarks with a zig-zag stair of ledges that leads to a wide deck at the top.
 * ONE definition here feeds both the level (platforms + orbs, see addTowers in levels/common.js) and the art tool
 * (the tower sprite, project/art_tools/decor_catalog.js), so the picture and the platforms always match.
 *   x     centre of the tower (world x)
 *   n     number of ledges below the deck (each is TOWER_STEP higher than the one before)
 *   flip  start the zig-zag on the other side
 *   look  (alternate world only) which landmark shape to paint: 'obelisk' | 'arch' | 'crystal'
 * Reach: a normal jump rises about 110 px, so steps of 72 px and gaps of 40 px are comfortable. */
const TOWER_STEP = 72,
  TOWER_FIRST = 70, // the first ledge is this high above the ground
  TOWER_ARM = 150; // how far the ledges stick out from the middle
// In the alternate world Bella sees the way out (a glowing arrow) while she is higher than this world y, i.e. on a tower deck
const ALT_VANTAGE_Y = 100;
const TOWER_TOP = 380; // how far above y = 0 a level with towers extends (L.top)
const TOWERS = {
  forest: [
    { x: 1580, n: 7 },
    { x: 3700, n: 6 }
  ],
  swamp: [
    { x: 520, n: 7 },
    { x: 3750, n: 5, flip: true },
    { x: 4400, n: 6 }
  ],
  mountain: [
    { x: 1300, n: 7 },
    { x: 3680, n: 6 }
  ],
  village: [{ x: 1250, n: 6 }],
  alt: [
    { x: 1640, n: 6, look: 'obelisk' },
    { x: 3150, n: 7, look: 'arch' },
    { x: 4450, n: 6, look: 'crystal' }
  ]
};
// World y of the deck (top surface) of the tower at world x, so a puzzle object can be put up there
function towerDeckY(biome, x) {
  const t = TOWERS[biome].find(tw => tw.x === x);
  return GY - TOWER_FIRST - TOWER_STEP * t.n;
}
// Small fixed irregularity per ledge (always the same for the same tower), so a stair is not a perfect zig-zag
function towerWobble(t, i) {
  const h = Math.sin(t.x * 12.9898 + i * 78.233) * 43758.5453;
  return Math.round(((h - Math.floor(h)) - 0.5) * 24); // -12..12 px
}
// The ledges of one tower, bottom to top. The last one is the deck.
// The ledge just under the deck sticks out past the deck's edge, so Bella can step off the deck and land on it on the way down.
function towerLedges(t) {
  const out = [],
    flip = t.flip ? 1 : 0;
  for (let i = 0; i < t.n; i++) {
    const onLeft = (i + flip) % 2 === 0,
      wob = towerWobble(t, i),
      last = i === t.n - 1;
    let x = onLeft ? t.x - TOWER_ARM : t.x + 20,
      w = TOWER_ARM - 20;
    if (last) {
      w = 130;
      x = onLeft ? t.x - 90 - w : t.x + 90;
    } else x += wob;
    out.push({ x, y: GY - TOWER_FIRST - TOWER_STEP * i, w });
  }
  const deckY = GY - TOWER_FIRST - TOWER_STEP * t.n;
  out.push({ x: t.x - 150, y: deckY, w: 300, deck: true });
  return out;
}
