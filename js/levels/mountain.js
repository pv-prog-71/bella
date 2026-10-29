/* Level 3 - Mountain (bear + flower / honey puzzle) */
/* ======================= MOUNTAIN ======================= */
function buildMountain() {
  const L = baseLevel(2, 'mountain', 4800);
  L.name = tr('level.mountain');
  L.nextName = tr('level.village');
  L.theme = 'mountain';
  const HIVE = { x: 1900, y: 146 },
    BEAR = { x: 3380 };
  L.solids.push(ground(0, 4800), hill(520, 200, 30), hill(2400, 230, 40), hill(3800, 200, 34));
  L.solids.push(
    plat(1480, 325, 130, 18, 'ledge'),
    plat(1640, 250, 110, 18, 'ledge'),
    plat(1780, 185, 240, 22, 'ledge')
  );
  L.solids.push(
    plat(980, 320, 130, 18, 'ledge'),
    plat(3000, 320, 130, 18, 'ledge'),
    plat(4250, 320, 130, 18, 'ledge')
  );
  L.exitX = 4640;
  addGate(L, 'boulders');
  orbArc(L, 300, GY - 40, 6, 220, 60);
  orbArc(L, 560, GY - 80, 5, 140, 40);
  orbArc(L, 1040, 290, 3, 80, 0);
  orbArc(L, 1250, GY - 40, 6, 220, 60);
  orbArc(L, 1830, 150, 4, 120, 0);
  orbArc(L, 2100, GY - 40, 6, 220, 60);
  orbArc(L, 2500, GY - 100, 6, 200, 40);
  orbArc(L, 2800, GY - 40, 6, 220, 60);
  orbArc(L, 3060, 290, 3, 80, 0);
  orbArc(L, 3650, GY - 40, 6, 220, 60);
  orbArc(L, 3900, GY - 100, 5, 160, 40);
  orbArc(L, 4310, 290, 3, 80, 0);
  orbArc(L, 4400, GY - 40, 6, 200, 60);
  L.items.push(mkItem('flower', 3680, towerDeckY('mountain', 3680) - 14)); // on top of the second rock pillar
  L.enemies.push(
    mkSpider(1050, 0),
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
    if (!p.spoke && b.x > 2930 && onScreen(BEAR.x, GY - 60) && (p.seen = (p.seen || 0) + dt) > 0.9) {
      p.spoke = true;
      G.openDialog('Bear', tr('dlg.bear.ask'));
    }
    // flower lure
    const fl = L.items.find(i => i.type === 'flower');
    p.flowerAt = null;
    if (fl && fl.state === 'ground' && fl.rest) {
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
    if (it.type === 'honey' && !p.eat && Math.abs(b.x - BEAR.x) < 200) {
      G.held = null;
      L.items = L.items.filter(i => i !== it);
      p.eat = 0.01;
      SND.sfx('crunch');
      G.say(BEAR.x, GY - 150, tr('bubble.nom'), 2.6);
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
      return { x: BEAR.x, y: GY - 150, text: tr('hint.mtn.bear') };
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
    drawBear(c, BEAR.x, GY, {
      t,
      hurt: !p.bearHappy,
      dir: -1,
      eat: p.eat > 0 ? Math.sin(t * 8) : 0
    });
    if (p.eat > 0 && !p.done) {
      c.fillStyle = '#e8a014';
      ell(c, BEAR.x - 38, GY - 90 + Math.sin(t * 8) * 3, 5, 5);
      c.fill();
    }
    p.bees.forEach(bee => drawBee(c, bee.x, bee.y, L.t + bee.ph, { dir: bee.dir }));
  };
  addTowers(L); // climbing towers (config/towers.js)
  bakeScenery(L); // sprites + terrain come from assets/ (see assets/data/manifest.js)
  return L;
}
