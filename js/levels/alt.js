/* Alternate World: one reusable level driven by ALT_PARAMS (config/balance.js) */
const ALT_LAYOUTS = [
  { exit: 'A', dest: { B: 'A', C: 'A', D: 'A', E: 'A' } },
  { exit: 'C', dest: { A: 'start', B: 'A', D: 'B', E: 'D' } },
  { exit: 'D', dest: { A: 'E', B: 'C', C: 'start', E: 'A' } },
  { exit: 'E', dest: { A: 'start', B: 'A', C: 'B', D: 'C' } } // the last one: the way out is at the far end, and the false portals send her back
];
// Long floating platforms {x, h (height above the ground), w}: each alternate world visit has its own route, so they do not feel alike.
// Each platform is reached from the one before it (at most 70 up, gap at most 70, see tests/alt_reach.js); the first from the ground.
// portals: B, C, D {x, h}; guard: where the shadows S7 and S8 patrol {x1, x2, h}.
const ALT_MAPS = [
  { // 0: low and gentle, a few wide platforms
    plats: [
      { x: 1400, h: 70, w: 240 }, { x: 1700, h: 110, w: 600 }, { x: 2360, h: 70, w: 420 },
      { x: 2840, h: 100, w: 520 }, { x: 3420, h: 60, w: 500 }, { x: 3990, h: 110, w: 260 }, { x: 4320, h: 70, w: 420 }
    ],
    portals: { B: { x: 2000, h: 110 }, C: { x: 3150, h: 100 }, D: { x: 4500, h: 70 } },
    guard: { S7: { x1: 1720, x2: 2280, h: 110 }, S8: { x1: 2860, x2: 3340, h: 100 } }
  },
  { // 1: climbs in wide steps to a high platform, then comes down
    plats: [
      { x: 1380, h: 70, w: 200 }, { x: 1650, h: 140, w: 700 }, { x: 2420, h: 210, w: 480 }, { x: 2960, h: 280, w: 540 },
      { x: 3560, h: 200, w: 340 }, { x: 3960, h: 140, w: 260 }, { x: 4290, h: 210, w: 460 }
    ],
    portals: { B: { x: 2000, h: 140 }, C: { x: 3150, h: 280 }, D: { x: 4450, h: 210 } },
    guard: { S7: { x1: 1720, x2: 2300, h: 140 }, S8: { x1: 3010, x2: 3450, h: 280 } }
  },
  { // 2: a quick climb, then a long skyway that slowly comes down
    plats: [
      { x: 1400, h: 70, w: 200 }, { x: 1650, h: 140, w: 200 }, { x: 1920, h: 210, w: 240 }, { x: 2230, h: 280, w: 700 },
      { x: 3000, h: 210, w: 300 }, { x: 3370, h: 140, w: 380 }, { x: 3820, h: 70, w: 300 }, { x: 4190, h: 140, w: 540 }
    ],
    portals: { B: { x: 1750, h: 140 }, C: { x: 2600, h: 280 }, D: { x: 4450, h: 140 } },
    guard: { S7: { x1: 2260, x2: 2900, h: 280 }, S8: { x1: 4220, x2: 4700, h: 140 } }
  },
  { // 3: many separated platforms going up and down
    plats: [
      { x: 1400, h: 70, w: 220 }, { x: 1680, h: 130, w: 240 }, { x: 1980, h: 70, w: 200 }, { x: 2240, h: 140, w: 300 },
      { x: 2600, h: 210, w: 300 }, { x: 2960, h: 140, w: 200 }, { x: 3220, h: 70, w: 300 }, { x: 3580, h: 130, w: 260 },
      { x: 3900, h: 200, w: 360 }, { x: 4320, h: 130, w: 360 }
    ],
    portals: { B: { x: 1780, h: 130 }, C: { x: 2750, h: 210 }, D: { x: 4450, h: 130 } },
    guard: { S7: { x1: 2620, x2: 2880, h: 210 }, S8: { x1: 3920, x2: 4240, h: 200 } }
  }
];
const ALT_SHADOWS = {
  S1: { x1: 700, x2: 1050, y: GY },
  S2: { x1: 1450, x2: 1800, y: GY },
  S3: { x1: 2300, x2: 2640, y: GY },
  S4: { x1: 3050, x2: 3500, y: GY },
  S5: { x1: 3720, x2: 3940, y: GY },
  S6: { x1: 4350, x2: 4720, y: GY },
  S9: { x1: 1850, x2: 2250, y: GY }
};

function mkShadow(def, P) {
  return {
    name: 'shadow',
    x: (def.x1 + def.x2) / 2,
    y: def.y,
    x1: def.x1,
    x2: def.x2,
    dir: 1,
    st: 'patrol',
    timer: 0,
    t: Math.random() * 6,
    dmg: P.dmg,
    P,
    dying: 0,
    cool: 0,
    update(dt) {
      this.t += dt;
      const b = G.bella;
      if (this.cool > 0) this.cool -= dt;
      if (this.dying > 0) {
        this.dying -= dt;
        if (this.dying <= 0) this.dead = true;
        return;
      }
      const seen = !G.altInvis,
        dx = b.x - this.x,
        inArea = b.x > this.x1 - 50 && b.x < this.x2 + 50 && Math.abs(b.y - this.y) < 130;
      if (this.st === 'patrol') {
        this.x += this.dir * this.P.patrol * dt;
        if (this.x > this.x2) this.dir = -1;
        if (this.x < this.x1) this.dir = 1;
        if (seen && inArea && Math.abs(dx) < this.P.detect) {
          this.st = 'detect';
          this.timer = 0.55;
          this.dir = dx > 0 ? 1 : -1;
          SND.sfx('shadowalert');
        }
      } else if (this.st === 'detect') {
        this.timer -= dt;
        this.dir = dx > 0 ? 1 : -1;
        if (!seen) this.st = 'patrol';
        else if (this.timer <= 0) this.st = 'chase';
      } else if (this.st === 'chase') {
        if (!seen || !inArea) {
          this.st = 'patrol';
          return;
        }
        this.dir = dx > 0 ? 1 : -1;
        this.x = clamp(this.x + this.dir * this.P.chase * dt, this.x1, this.x2);
      }
    },
    kill() {
      if (!this.dying) this.dying = 1.2;
    },
    box() {
      return this.dying > 0 || G.altInvis || this.cool > 0
        ? null
        : { x: this.x - 18, y: this.y - 86, w: 36, h: 86 };
    },
    onHit() {
      this.cool = 1.6;
    },
    draw(c, t) {
      drawShadow(c, this.x, this.y, {
        t,
        dir: this.dir,
        lean: this.st === 'chase' ? 1 : 0,
        alert: this.st !== 'patrol',
        alpha: this.dying > 0 ? this.dying / 1.2 : 1
      });
    }
  };
}

function buildAlt(origin) {
  const P = ALT_PARAMS[origin],
    LY = ALT_LAYOUTS[P.layout];
  const L = baseLevel(4, 'alt', 4800);
  L.alt = true;
  L.name = tr('level.alt');
  L.theme = 'alt';
  L.origin = origin;
  L.P = P;
  const MAP = ALT_MAPS[P.layout];
  L.solids.push(ground(0, 4800));
  // a few extra ledges so the ground between the portals is not a flat corridor
  L.solids.push(plat(860, 325, 130, 18, 'ledge'), plat(1020, 255, 130, 18, 'ledge'));
  L.solids.push(
    { x: 1100, y: 372, w: 70, h: 40, k: 'ground' },
    { x: 2900, y: 372, w: 70, h: 40, k: 'ground' },
    { x: 4200, y: 372, w: 70, h: 40, k: 'ground' }
  );
  L.spawn = { x: 140, y: GY };
  L.time = P.time;
  L.timeMax = P.time;
  L.exitId = LY.exit;
  const portalPos = { A: { x: 1300, y: GY }, E: { x: 4650, y: GY } };
  ['B', 'C', 'D'].forEach(id => (portalPos[id] = { x: MAP.portals[id].x, y: GY - MAP.portals[id].h }));
  L.portals = Object.keys(portalPos).map(id => ({
    id,
    x: portalPos[id].x,
    y: portalPos[id].y,
    exit: id === LY.exit,
    dest: LY.dest[id]
  }));
  const shadowDef = id => {
    const g = MAP.guard[id];
    return g ? { x1: g.x1, x2: g.x2, y: GY - g.h } : ALT_SHADOWS[id];
  };
  L.enemies = P.shadows.map(id => mkShadow(shadowDef(id), P));
  L.update = function (dt) {
    L.t += dt;
    L.enemies = L.enemies.filter(e => !e.dead);
  };
  L.killAllShadows = function () {
    L.enemies.forEach(e => e.kill && e.kill());
  };
  L.top = TOWER_TOP; // the level extends upwards: the long platforms go up to 280 above the ground
  MAP.plats.forEach(q => L.solids.push(plat(q.x, GY - q.h, q.w, 18, 'ledge')));
  bakeScenery(L); // sprites + terrain come from assets/ (see assets/data/manifest.js)
  return L;
}
