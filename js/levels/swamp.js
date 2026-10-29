/* Level 2 - Swamps (frog + seeds / branch / plank puzzle) */
/* ======================= SWAMPS ======================= */
// Small ledges over the gap (up 70 / down 70, gaps of at most 70), usable in both directions: the way across before the branch bridge
const SWAMP_CROSS = [
  { x: 2200, h: 70, w: 110 },
  { x: 2370, h: 140, w: 110 },
  { x: 2500, h: 70, w: 100 }
];
function buildSwamp() {
  const L = baseLevel(1, 'swamp', 4800);
  L.name = tr('level.swamp');
  L.nextName = tr('level.mountain');
  L.theme = 'swamp';
  const GAP0 = 2190,
    GAP1 = 2480,
    FROG_X0 = 3080; // the frog is stranded on the far bank
  L.solids.push(ground(0, 1700), ground(2900, 1900));
  L.solids.push(
    { x: 1700, y: GY, w: GAP0 - 1700, h: 14, oneway: true, k: 'bridge' },
    { x: GAP1, y: GY, w: 2900 - GAP1, h: 14, oneway: true, k: 'bridge' }
  );
  L.solids.push(hill(420, 160, 34), hill(3500, 170, 34));
  L.solids.push(plat(3300, 320, 140, 18, 'log'), plat(4000, 320, 140, 18, 'log'));
  // a way over the gap through the branches, so Bella can reach the frog before the bridge exists (the water has crocs)
  SWAMP_CROSS.forEach(q => L.solids.push(plat(q.x, GY - q.h, q.w, 18, 'log')));
  L.exitX = 4640;
  addGate(L, 'vines');
  L.water.push({ x1: 1700, x2: 2900, y: 478, type: 'croc', respawn: { x: 1640, y: GY } });
  orbArc(L, 300, GY - 40, 6, 220, 60);
  orbArc(L, 560, GY - 90, 5, 140, 40);
  orbArc(L, 1030, 290, 3, 80, 0);
  orbArc(L, 1900, GY - 50, 6, 220, 70);
  orbArc(L, 2300, GY - 130, 6, 260, 40);
  orbArc(L, 2700, GY - 50, 6, 220, 70);
  orbArc(L, 3100, GY - 40, 6, 220, 60);
  orbArc(L, 3370, 290, 3, 80, 0);
  orbArc(L, 3800, GY - 40, 6, 220, 60);
  orbArc(L, 4070, 290, 3, 80, 0);
  orbArc(L, 4300, GY - 40, 6, 220, 60);
  const p = (L.p = {
    spoke: false,
    seeds: 0,
    bird: 'perch',
    birdT: 0,
    fat: 1,
    anim: null,
    branchSpawned: false,
    plank: false,
    frogX: FROG_X0,
    frogT: 0,
    frogHop: 0,
    frogDone: false,
    done: false,
    pods: 3,
    podT: 0,
    birdFly: 0,
    creakT: 0,
    msgT: 0
  });
  L.enemies.push(mkSpider(900, 0), mkSpider(1450, 2.5), mkSpider(3250, 1), mkSpider(4150, 4));
  [1800, 2000, 2320, 2530, 2700, 2830].forEach((x, i) => L.enemies.push(mkCroc(x, i % 2 ? -1 : 1)));
  const POD_X = 520,
    POD_Y = towerDeckY('swamp', 520), // the seed plant grows on top of the first mangrove
    TREEX = 1250,
    BIRD = { x: 1327, y: 202 };
  L.update = function (dt) {
    const b = G.bella;
    L.t += dt;
    if (!p.spoke && b.x > 2850 && onScreen(p.frogX, GY - 30) && (p.seen = (p.seen || 0) + dt) > 0.9) {
      p.spoke = true;
      G.openDialog('Frog', tr('dlg.frog.ask'));
    }
    // seed plant
    if (p.pods < 3) {
      p.podT += dt;
      if (p.podT > 2) {
        p.pods++;
        p.podT = 0;
      }
    }
    if (p.spoke && !G.held && p.pods > 0 && Math.abs(b.x - POD_X) < 55 && Math.abs(b.y - POD_Y) < 6) {
      const it = mkItem('seed', b.x, b.y - 20);
      it.state = 'held';
      it.rest = false;
      G.held = it;
      L.items.push(it);
      p.pods--;
      SND.sfx('pick');
    }
    // seed flight
    if (p.anim) {
      p.anim.t += dt;
      const u = Math.min(1, p.anim.t / 0.7);
      p.anim.x = lerp(p.anim.x0, BIRD.x, u);
      p.anim.y = lerp(p.anim.y0, BIRD.y - 20, u) - Math.sin(u * Math.PI) * 60;
      if (u >= 1) {
        p.anim = null;
        p.seeds++;
        SND.sfx('crunch');
        SND.sfx('chirp');
        p.fat = 1 + p.seeds * 0.28;
        G.say(BIRD.x, BIRD.y - 50, p.seeds < 3 ? tr('bubble.tweet') : tr('bubble.heavy'), 1.5);
        if (p.seeds >= 3) {
          p.bird = 'creak';
          p.creakT = 0;
          SND.sfx('creak');
        }
      }
    }
    if (p.bird === 'creak') {
      p.creakT += dt;
      if (p.creakT > 1.8 && !p.branchSpawned) {
        p.branchSpawned = true;
        p.bird = 'fly';
        SND.sfx('snap');
        const br = mkItem('branch', 1335, 200);
        br.rest = false;
        br.state = 'ground';
        br.vy = 0;
        br.peak = 200;
        L.items.push(br);
      }
    }
    if (p.bird === 'fly') p.birdFly += dt;
    // frog crossing
    if (p.plank && !p.frogDone) {
      p.frogT += dt;
      p.frogX -= 300 * dt;
      p.frogHop = Math.abs(Math.sin(p.frogT * 5.2));
      if (p.frogX <= 2340 && !p.done) {
        p.done = true;
        SND.sfx('chirp');
        G.reward(1, 'Frog', tr('dlg.frog.thanks'));
      }
      if (p.frogX <= 1500) {
        p.frogDone = true;
        p.frogHop = 0;
      }
    }
    if (p.msgT > 0) p.msgT -= dt;
  };
  L.onUse = function (it) {
    const b = G.bella;
    if (it.type === 'seed' && p.bird === 'perch' && !p.anim && Math.abs(b.x - TREEX) < 270) {
      G.held = null;
      it.dead = true;
      L.items = L.items.filter(i => i !== it);
      p.anim = { t: 0, x0: b.x + b.face * 30, y0: b.y - 26, x: b.x, y: b.y };
      SND.sfx('drop');
      return true;
    }
    if (
      it.type === 'branch' &&
      !p.plank &&
      Math.abs(b.x - (GAP0 + GAP1) / 2) < 230 &&
      b.y >= GY - 5
    ) {
      G.held = null;
      L.items = L.items.filter(i => i !== it);
      p.plank = true;
      L.solids.push({
        x: GAP0,
        y: GY,
        w: GAP1 - GAP0,
        h: 14,
        oneway: true,
        k: 'bridge',
        dyn: true
      });
      SND.sfx('plank');
      G.say((GAP0 + GAP1) / 2, GY - 50, tr('bubble.bridgeFixed'), 2);
      return true;
    }
    return false;
  };
  L.hint = function () {
    if (p.done || !p.spoke) return null; // no hint before the puzzle has started
    const b = G.bella;
    if (!p.plank) {
      if (p.bird === 'perch') {
        // seeds only help the bird: a line of text, no arrow
        if (G.held && G.held.type === 'seed')
          return { x: BIRD.x, y: BIRD.y - 70, text: tr('hint.swamp.seed'), noArrow: true };
        return { x: POD_X, y: POD_Y - 80, text: tr('hint.swamp.pods'), noArrow: true };
      }
      if (p.bird === 'creak' || p.bird === 'fly') {
        const br = L.items.find(i => i.type === 'branch');
        if (G.held && G.held.type === 'branch')
          return { x: (GAP0 + GAP1) / 2, y: GY - 90, text: tr('hint.swamp.branch') };
        if (br) return { x: br.x, y: br.y - 50, text: tr('hint.swamp.branchFound') };
      }
    }
    return null;
  };
  L.drawBack = function (c, t) {
    // water
    const wy = 470;
    const g = c.createLinearGradient(0, wy - 6, 0, 540);
    g.addColorStop(0, 'rgba(60,140,130,0.96)');
    g.addColorStop(1, 'rgba(18,60,64,0.99)');
    c.fillStyle = g;
    c.fillRect(1700, wy, 1200, 120);
    c.strokeStyle = 'rgba(200,255,240,0.35)';
    c.lineWidth = 1.6;
    for (let i = 0; i < 40; i++) {
      const x = 1710 + i * 30 + Math.sin(t + i) * 4;
      c.beginPath();
      c.moveTo(x, wy + 4 + (i % 3) * 8);
      c.quadraticCurveTo(x + 10, wy + 1 + (i % 3) * 8, x + 22, wy + 4 + (i % 3) * 8);
      c.stroke();
    }
    for (let i = 0; i < 9; i++) {
      const x = 1760 + i * 135,
        y = wy + 3 + Math.sin(t * 0.8 + i) * 1.5;
      c.fillStyle = '#4a9a46';
      ell(c, x, y, 22, 5);
      c.fill();
      if (i % 3 === 0) {
        c.fillStyle = '#ff9ccd';
        ell(c, x, y - 4, 5, 4);
        c.fill();
      }
    }
    drawSprites(c, L.biome, 'mid'); // bridge posts and rails
  };
  L.drawEntities = function (c, t) {
    // seed plant
    c.strokeStyle = '#3f8a34';
    c.lineWidth = 3;
    for (let k = 0; k < 6; k++) {
      c.beginPath();
      c.moveTo(POD_X, POD_Y);
      c.quadraticCurveTo(
        POD_X + (k - 2.5) * 12,
        POD_Y - 30,
        POD_X + (k - 2.5) * 22,
        POD_Y - 40 - (k % 2) * 14
      );
      c.stroke();
    }
    for (let k = 0; k < 3; k++) {
      if (k < p.pods) {
        c.fillStyle = '#d8aa44';
        ell(c, POD_X - 24 + k * 24, POD_Y - 52 - (k % 2) * 10, 6, 9, 0.3);
        c.fill();
      }
    }
    drawSprites(c, L.biome, 'tree'); // bird tree trunk (the bending branch below is animated)
    if (!p.branchSpawned) {
      const bend =
        p.bird === 'creak'
          ? Math.min(1, p.creakT / 1.8) * 14 + Math.sin(t * 30) * (p.creakT > 0 ? 1.2 : 0)
          : 0;
      c.lineWidth = 12;
      c.beginPath();
      c.moveTo(TREEX, 196);
      c.quadraticCurveTo(TREEX + 50, 196 + bend * 0.4, TREEX + 96, 200 + bend);
      c.stroke();
      c.fillStyle = '#4f8a3e';
      ell(c, TREEX + 70, 190 + bend * 0.7, 9, 5, -0.5);
      c.fill();
    }
    // bird
    if (p.bird === 'perch' || p.bird === 'creak')
      drawBird(
        c,
        BIRD.x - (p.bird === 'creak' ? 0 : 0),
        BIRD.y + (p.bird === 'creak' ? Math.min(1, p.creakT / 1.8) * 12 : 0) - 4,
        { s: p.fat, t, dir: -1, fat: p.seeds > 0 }
      );
    else if (p.bird === 'fly')
      drawBird(c, BIRD.x + p.birdFly * 160, BIRD.y - 20 - p.birdFly * 120, {
        s: p.fat * 0.8,
        t,
        fly: true,
        dir: 1
      });
    if (p.anim) drawItem(c, 'seed', p.anim.x, p.anim.y, 0.8);
    // frog
    const fy = GY - (p.plank && !p.frogDone ? p.frogHop * 34 : 0);
    drawFrog(c, p.frogX, fy, { t, dir: -1, hop: p.plank && !p.frogDone ? 1 : 0, sad: !p.plank });
    // repaired plank (branch across the gap)
    if (p.plank) {
      c.save();
      c.translate((GAP0 + GAP1) / 2, GY + 2);
      c.strokeStyle = '#6a4a2a';
      c.lineWidth = 12;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(-(GAP1 - GAP0) / 2 - 6, 0);
      c.lineTo((GAP1 - GAP0) / 2 + 6, 0);
      c.stroke();
      c.strokeStyle = '#52391e';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(-(GAP1 - GAP0) / 2 + 6, 3);
      c.lineTo((GAP1 - GAP0) / 2 - 6, 3);
      c.stroke();
      c.restore();
    }
  };
  addTowers(L); // climbing towers (config/towers.js)
  bakeScenery(L); // sprites + terrain come from assets/ (see assets/data/manifest.js)
  return L;
}
