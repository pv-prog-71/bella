/* Alternate World: one reusable level driven by ALT_PARAMS (config/balance.js) */
const ALT_LAYOUTS = [
  { exit: 'A', dest: { B: 'A', C: 'A', D: 'A', E: 'A' } },
  { exit: 'C', dest: { A: 'start', B: 'A', D: 'B', E: 'D' } },
  { exit: 'D', dest: { A: 'E', B: 'C', C: 'start', E: 'A' } },
  { exit: 'B', dest: { A: 'D', C: 'E', D: 'start', E: 'C' } }
];
const ALT_PORTALS = {
  A: { x: 1300, y: GY },
  // B, C and D stand on the decks of the three towers (config/towers.js): the tall landmarks lead somewhere real
  B: { x: 1640, y: towerDeckY('alt', 1640) },
  C: { x: 3150, y: towerDeckY('alt', 3150) },
  D: { x: 4450, y: towerDeckY('alt', 4450) },
  E: { x: 4650, y: GY }
};
const ALT_SHADOWS = {
  S1: { x1: 700, x2: 1050, y: GY },
  S2: { x1: 1450, x2: 1800, y: GY },
  S3: { x1: 2300, x2: 2640, y: GY },
  S4: { x1: 3050, x2: 3500, y: GY },
  S5: { x1: 3720, x2: 3940, y: GY },
  S6: { x1: 4350, x2: 4720, y: GY },
  // the decks of two towers (see config/towers.js) hold portals and are guarded in the later levels
  S7: { x1: 3000, x2: 3300, y: GY - TOWER_FIRST - TOWER_STEP * 7 },
  S8: { x1: 4300, x2: 4600, y: GY - TOWER_FIRST - TOWER_STEP * 6 }
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
  L.portals = Object.keys(ALT_PORTALS).map(id => ({
    id,
    x: ALT_PORTALS[id].x,
    y: ALT_PORTALS[id].y,
    exit: id === LY.exit,
    dest: LY.dest[id]
  }));
  L.enemies = P.shadows.map(id => mkShadow(ALT_SHADOWS[id], P));
  L.update = function (dt) {
    L.t += dt;
    L.enemies = L.enemies.filter(e => !e.dead);
  };
  L.killAllShadows = function () {
    L.enemies.forEach(e => e.kill && e.kill());
  };
  addTowers(L); // climbing towers (config/towers.js)
  bakeScenery(L); // sprites + terrain come from assets/ (see assets/data/manifest.js)
  return L;
}
