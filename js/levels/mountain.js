/* Level 3 - Mountain (bear + flower / honey puzzle) */
/* ======================= MOUNTAIN ======================= */
// The cliff with the flower: long ledges going up and back (at most 70 up, gap at most 70), see tests/mountain_reach.js
const MTN_CLIFF = [
  { x: 440, h: 70, w: 180 },
  { x: 680, h: 140, w: 300 },
  { x: 1030, h: 210, w: 240 },
  { x: 680, h: 280, w: 280 }
];
function buildMountain() {
  const L = baseLevel(2, 'mountain', 4800);
  L.name = tr('level.mountain');
  L.nextName = tr('level.village');
  L.theme = 'mountain';
  const HIVE = { x: 1900, y: 146 },
    BEAR = { x: 3560, y: GY - 120 }; // the bear waits in a cave up on a shelf: the ground rises towards it
  L.solids.push(ground(0, 4800), hill(520, 200, 30), hill(2400, 230, 40), hill(3820, 200, 34));
  L.solids.push(hill(3130, 160, 40), hill(3260, 160, 80), hill(3390, 430, 120)); // the slope up to the shelf
  L.solids.push(
    plat(1480, 325, 130, 18, 'ledge'),
    plat(1640, 250, 110, 18, 'ledge'),
    plat(1780, 185, 240, 22, 'ledge')
  );
  // a switchback up a cliff (long ledges, not a tower): the flower grows on the top one
  MTN_CLIFF.forEach(q => L.solids.push(plat(q.x, GY - q.h, q.w, 18, 'ledge')));
  L.solids.push(plat(4250, 320, 130, 18, 'ledge'));
  L.exitX = 4640;
  addGate(L, 'boulders');
  orbArc(L, 300, GY - 40, 6, 220, 60);
  orbArc(L, 560, GY - 80, 5, 140, 40);
  orbArc(L, 800, GY - 170, 3, 80, 0);
  orbArc(L, 1250, GY - 40, 6, 220, 60);
  orbArc(L, 1830, 150, 4, 120, 0);
  orbArc(L, 2100, GY - 40, 6, 220, 60);
  orbArc(L, 2500, GY - 100, 6, 200, 40);
  orbArc(L, 2800, GY - 40, 6, 220, 60);
  orbArc(L, 3200, GY - 90, 3, 60, 0);
  orbArc(L, 3650, GY - 40, 6, 220, 60);
  orbArc(L, 3900, GY - 100, 5, 160, 40);
  orbArc(L, 4310, 290, 3, 80, 0);
  orbArc(L, 4400, GY - 40, 6, 200, 60);
  L.items.push(mkItem('flower', 760, GY - 280 - 14)); // more than 1050 from the hive, so the bees are not lured from the start // on the top ledge of the cliff
  L.enemies.push(
    mkSpider(800, 2),
    mkSpider(1050, 0),
    mkBoar(2450, 2950),
    mkSpider(2250, 3),
    mkSpider(2900, 1.5),
    mkSpider(4000, 5),
    mkEagle(800, 2500),
    mkEagle(3000, 4700)
  );
  const bees = [];
  for (let i = 0; i < 16; i++)
    bees.push({ x: HIVE.x + (i - 8) * 4, y: HIVE.y, ph: i * 1.7, r: 26 + (i % 5) * 7 });
  const p = (L.p = {
    spoke: false,
    lured: false,
    flowerAt: null,
    honey: false,
    eat: 0,
    done: false,
    msgT: 0,
    bees,
    bearHappy: false
  });
  L.update = function (dt) {
    const b = G.bella;
    L.t += dt;
    if (p.msgT > 0) p.msgT -= dt;
    // she only finds the bear after climbing the slope to his cave
    if (!p.spoke && Math.abs(b.x - BEAR.x) < 300 && b.y < GY - 90 && onScreen(BEAR.x, BEAR.y - 60) && (p.seen = (p.seen || 0) + dt) > 0.6) {
      p.spoke = true;
      G.openDialog('Bear', tr('dlg.bear.ask'));
    }
    // flower lure
    const fl = L.items.find(i => i.type === 'flower');
    p.flowerAt = null;
    if (G.held && G.held.type === 'flower') p.flowerTaken = true;
    if (fl && p.flowerTaken && fl.state === 'ground' && fl.rest) { // only a flower that Bella has put down lures the bees
      const d = Math.abs(fl.x - HIVE.x);
      if (d > 280 && d < 1050) p.flowerAt = { x: fl.x, y: fl.y - 18 };
    }
    const was = p.lured;
    p.lured = !!p.flowerAt;
    if (p.lured && !was) G.say(p.flowerAt.x, p.flowerAt.y - 40, tr('bubble.bzzz'), 2);
    const cx = p.lured ? p.flowerAt.x : HIVE.x,
      cy = p.lured ? p.flowerAt.y : HIVE.y;
    bees.forEach(bee => {
      const tx = cx + Math.cos(L.t * 2.2 + bee.ph) * bee.r,
        ty = cy + Math.sin(L.t * 3.1 + bee.ph * 1.3) * bee.r * 0.6;
      const sp = p.lured ? 1.4 : 3;
      const nx = bee.x + (tx - bee.x) * Math.min(1, dt * sp),
        ny = bee.y + (ty - bee.y) * Math.min(1, dt * sp);
      bee.dir = nx > bee.x ? 1 : -1;
      bee.x = nx;
      bee.y = ny;
    });
    // honey
    const near = Math.hypot(b.x - 1885, b.y - 185) < 90;
    if (near && p.spoke && !p.honey && !G.held) {
      if (p.lured) {
        const it = mkItem('honey', b.x, b.y - 20);
        it.state = 'held';
        it.rest = false;
        G.held = it;
        L.items.push(it);
        p.honey = true;
        SND.sfx('pick');
        G.say(1885, 120, tr('bubble.honey'), 1.6);
      } else if (p.msgT <= 0) {
        p.msgT = 3;
        p.triedHive = true; // she has seen the bees guard it: now the flower becomes the next idea
        G.say(HIVE.x, 90, tr('bubble.guard'), 2.4);
        SND.sfx('warn');
      }
    }
    if (p.eat > 0) {
      p.eat += dt;
      if (p.eat > 1.4 && !p.done) {
        p.done = true;
        p.bearHappy = true;
        G.reward(2, 'Bear', tr('dlg.bear.thanks'));
      }
    }
  };
  L.onUse = function (it) {
    const b = G.bella;
    if (it.type === 'honey' && !p.eat && Math.abs(b.x - BEAR.x) < 200 && Math.abs(b.y - BEAR.y) < 100) {
      G.held = null;
      L.items = L.items.filter(i => i !== it);
      p.eat = 0.01;
      SND.sfx('crunch');
      G.say(BEAR.x, BEAR.y - 150, tr('bubble.nom'), 2.6);
      return true;
    }
    if (it.type === 'flower') {
      const d = Math.abs(b.x - HIVE.x);
      if (d < 280) G.say(b.x, b.y - 70, tr('bubble.tooClose'), 2);
      else if (d >= 1050) G.say(b.x, b.y - 70, tr('bubble.tooFar'), 2);
    }
    return false;
  };
  L.hint = function () {
    if (p.done || !p.spoke) return null; // no hint before the puzzle has started
    const fl = L.items.find(i => i.type === 'flower');
    if (G.held && G.held.type === 'honey')
      return { x: BEAR.x, y: BEAR.y - 150, text: tr('hint.mtn.bear') };
    // the arrow follows what the player would think of first: the bear wants honey, so the honey comes first;
    // the flower is only suggested after the bees have shown that the hive is guarded
    if (G.held && G.held.type === 'flower')
      return { x: 1500, y: GY - 120, text: tr('hint.mtn.drop'), noArrow: true };
    if (p.lured && !p.honey) return { x: 1885, y: 120, text: tr('hint.mtn.climb') };
    if (!p.honey && !p.triedHive) return { x: HIVE.x, y: HIVE.y - 60, text: tr('hint.mtn.honey') };
    if (fl && !p.lured) return { x: fl.x, y: fl.y - 50, text: tr('hint.mtn.flower'), noArrow: true };
    return null;
  };
  L.drawBack = function (c, t) {
    drawSprites(c, L.biome, 'mid'); // hive tree
  };
  L.drawEntities = function (c, t) {
    if (!p.honey) drawHive(c, HIVE.x, HIVE.y + 60, 1);
    else {
      drawHive(c, HIVE.x, HIVE.y + 60, 1);
      c.fillStyle = '#4a2a12';
      ell(c, HIVE.x, HIVE.y + 50, 9, 11);
      c.fill();
    }
    // the cave behind the bear
    c.fillStyle = '#2a2d33';
    c.beginPath();
    c.moveTo(BEAR.x - 130, BEAR.y);
    c.lineTo(BEAR.x - 130, BEAR.y - 90);
    c.quadraticCurveTo(BEAR.x, BEAR.y - 230, BEAR.x + 130, BEAR.y - 90);
    c.lineTo(BEAR.x + 130, BEAR.y);
    c.closePath();
    c.fill();
    c.fillStyle = '#14161a';
    c.beginPath();
    c.moveTo(BEAR.x - 100, BEAR.y);
    c.lineTo(BEAR.x - 100, BEAR.y - 80);
    c.quadraticCurveTo(BEAR.x, BEAR.y - 195, BEAR.x + 100, BEAR.y - 80);
    c.lineTo(BEAR.x + 100, BEAR.y);
    c.closePath();
    c.fill();
    drawBear(c, BEAR.x, BEAR.y, {
      t,
      hurt: !p.bearHappy,
      dir: -1,
      eat: p.eat > 0 ? Math.sin(t * 8) : 0
    });
    if (p.eat > 0 && !p.done) {
      c.fillStyle = '#e8a014';
      ell(c, BEAR.x - 38, BEAR.y - 90 + Math.sin(t * 8) * 3, 5, 5);
      c.fill();
    }
    p.bees.forEach(bee => drawBee(c, bee.x, bee.y, L.t + bee.ph, { dir: bee.dir }));
  };
  addTowers(L); // climbing towers (config/towers.js)
  bakeScenery(L); // sprites + terrain come from assets/ (see assets/data/manifest.js)
  return L;
}
