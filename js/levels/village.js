/* Level 4 - Village (stingray + bone / knife puzzle) */
/* ======================= VILLAGE ======================= */
function buildVillage() {
  const L = baseLevel(3, 'village', 4900);
  L.name = tr('level.village');
  L.theme = 'village';
  L.exitX = 4400;
  L.isLast = true;
  const FISH = 2350,
    KNIFE_X = 2430,
    NET = { x: 3560 };
  L.solids.push(ground(0, 3300), ground(3800, 1100));
  L.solids.push({ x: 3300, y: GY, w: 500, h: 14, oneway: true, k: 'bridge' });
  L.solids.push(hill(1500, 190, 30), hill(2850, 200, 34), hill(4100, 160, 30));
  addGate(L, 'fence');
  L.solids.push(
    plat(420, 320, 130, 18, 'wood'),
    plat(900, 320, 130, 18, 'wood'),
    plat(3980, 320, 130, 18, 'wood')
  );
  L.water.push({ x1: 3300, x2: 3800, y: 462, type: 'splash', respawn: { x: 3290, y: GY } });
  orbArc(L, 300, GY - 40, 6, 220, 60);
  orbArc(L, 480, 290, 3, 80, 0);
  orbArc(L, 700, GY - 40, 6, 220, 60);
  orbArc(L, 960, 290, 3, 80, 0);
  orbArc(L, 1250, GY - 40, 6, 220, 60);
  orbArc(L, 1600, GY - 90, 5, 150, 40);
  orbArc(L, 1850, GY - 40, 6, 220, 60);
  orbArc(L, 2650, GY - 40, 6, 220, 60);
  orbArc(L, 2950, GY - 100, 5, 160, 40);
  orbArc(L, 3400, GY - 50, 6, 220, 40);
  orbArc(L, 3650, GY - 50, 6, 220, 40);
  orbArc(L, 4040, 290, 3, 80, 0);
  orbArc(L, 4200, GY - 40, 6, 220, 60);
  orbArc(L, 4420, GY - 90, 5, 150, 40);
  L.items.push(
    mkItem('bone', 1250, towerDeckY('village', 1250) - 12), // on top of the watch tower
    Object.assign(mkItem('knife', KNIFE_X, GY - 12), { canPick: () => L.p.fed })
  );
  L.enemies.push(
    mkSpider(1650, 0),
    mkSpider(2300, 3),
    mkSpider(3050, 2),
    mkSpider(4200, 4),
    mkWasp(600, 230),
    mkWasp(4000, 240),
    mkBoar(1000, 1450),
    mkBoar(1650, 1950),
    mkBoar(2800, 3200),
    mkBoar(3900, 4300)
  );
  const dog = {
    name: 'dog',
    x: 2100,
    dir: 1,
    st: 'patrol',
    t: 0,
    dmg: 10,
    eatT: 0,
    turnT: 0,
    targetX: 0,
    bark: 0,
    cool: 0,
    update(dt) {
      this.t += dt;
      const b = G.bella;
      if (this.cool > 0) this.cool -= dt;
      if (this.bark > 0) this.bark -= dt;
      const bone = L.items.find(
        i =>
          i.type === 'bone' &&
          i.state === 'ground' &&
          i.rest &&
          i.landed &&
          Math.abs(i.x - this.x) < 750
      );
      if (this.st === 'eat') {
        this.eatT -= dt;
        if (this.eatT < 11 && this.boneRef) {
          L.items = L.items.filter(i => i !== this.boneRef);
          this.boneRef = null;
        }
        if (this.eatT <= 0) this.st = 'patrol';
        return;
      }
      if (bone && this.st !== 'fetch') {
        this.st = 'fetch';
        this.boneRef = bone;
        bone.canPick = () => false; // the dog has taken it: Bella can no longer pick it up again
        SND.sfx('bark');
        this.bark = 0.6;
      }
      if (this.st === 'fetch') {
        const dx = this.boneRef.x - this.x;
        this.dir = dx > 0 ? 1 : -1;
        this.x += this.dir * 210 * dt;
        if (Math.abs(dx) < 18) {
          this.st = 'eat';
          this.eatT = 14;
          L.p.fed = true;
        }
        return;
      }
      const dxb = b.x - this.x;
      if (this.st === 'patrol') {
        this.x += this.dir * 45 * dt;
        if (this.x > 2300) this.dir = -1;
        if (this.x < 1950) this.dir = 1;
        if (
          !G.altInvis &&
          Math.abs(dxb) < 270 &&
          b.x > 1850 &&
          b.x < 2700 &&
          Math.abs(b.y - GY) < 90
        ) {
          this.st = 'chase';
          this.dir = dxb > 0 ? 1 : -1;
          this.turnT = 0;
          this.bark = 0.7;
          SND.sfx('bark');
        }
      } else if (this.st === 'chase') {
        const wantDir = dxb > 0 ? 1 : -1;
        if (wantDir !== this.dir) {
          // Bella got past the dog (for example by jumping over it): the dog overshoots a little before turning round
          this.turnT += dt;
          if (this.turnT >= DOG_TURN_DELAY) {
            this.dir = wantDir;
            this.turnT = 0;
          }
        } else this.turnT = 0;
        this.x += this.dir * (this.turnT > 0 ? 110 : 175) * dt;
        this.x = clamp(this.x, 1850, 2650);
        if (Math.abs(dxb) > 420 || b.x < 1800 || b.x > 2750) this.st = 'patrol';
      }
    },
    box() {
      return this.st === 'chase' && this.cool <= 0
        ? { x: this.x - 30, y: GY - 44, w: 60, h: 44 }
        : null;
    },
    onHit() {
      this.cool = 1.5;
      this.st = 'patrol';
    },
    draw(c, t) {
      drawDog(c, this.x, GY, {
        t,
        dir: this.dir,
        run: this.st === 'chase' || this.st === 'fetch',
        eat: this.st === 'eat',
        bark: this.bark > 0
      });
      if (this.st === 'eat') {
        c.fillStyle = 'rgba(255,255,255,0.9)';
        c.font = '600 13px Fredoka, sans-serif';
        c.textAlign = 'center';
        c.fillText(tr('bubble.omnom'), this.x + this.dir * 30, GY - 70 + Math.sin(t * 6) * 2);
      }
    }
  };
  L.enemies.push(dog);
  const p = (L.p = { spoke: false, cut: false, cutT: 0, done: false, fed: false });
  L.update = function (dt) {
    const b = G.bella;
    L.t += dt;
    if (!p.spoke && b.x > 3110 && onScreen(NET.x, GY - 40) && (p.seen = (p.seen || 0) + dt) > 0.9) {
      p.spoke = true;
      G.openDialog('Stingray', tr('dlg.ray.ask'));
    }
    if (p.spoke && !p.fed && Math.abs(b.x - KNIFE_X) < 110) p.triedKnife = true; // she has been to the knife: she saw the dog
    if (p.cut) {
      p.cutT += dt;
      if (!p.done && p.cutT > 1.2) {
        p.done = true;
        G.reward(3, 'Stingray', tr('dlg.ray.thanks'));
      }
    }
  };
  L.onUse = function (it) {
    const b = G.bella;
    if (it.type === 'bone') {
      G.held = null;
      it.state = 'ground';
      it.rest = false;
      it.landed = false;
      it.x = b.x + b.face * 30;
      it.y = b.y - 30;
      it.vx = b.face * 320;
      it.vy = -420;
      it.peak = it.y;
      it.cool = 0.5;
      SND.sfx('drop');
      return true;
    }
    if (it.type === 'knife' && !p.cut && Math.abs(b.x - NET.x) < 190 && b.y >= GY - 5) {
      G.held = null;
      L.items = L.items.filter(i => i !== it);
      p.cut = true;
      SND.sfx('cut');
      G.say(NET.x, GY - 70, tr('bubble.snip'), 1.8);
      return true;
    }
    return false;
  };
  L.hint = function () {
    if (p.done || !p.spoke) return null; // no hint before the puzzle has started
    const bone = L.items.find(i => i.type === 'bone'),
      knife = L.items.find(i => i.type === 'knife');
    if (G.held && G.held.type === 'knife')
      return { x: NET.x, y: GY - 100, text: tr('hint.vil.knife') };
    if (G.held && G.held.type === 'bone')
      return { x: 2100, y: GY - 110, text: tr('hint.vil.bone'), noArrow: true };
    const dogBusy = dog.st === 'eat';
    if (knife && dogBusy) return { x: KNIFE_X, y: GY - 60, text: tr('hint.vil.busy') };
    if (knife && !p.fed && !p.triedKnife)
      return { x: KNIFE_X, y: GY - 60, text: tr('hint.vil.knifeFirst') };
    if (knife && bone) return { x: bone.x, y: bone.y - 50, text: tr('hint.vil.guard'), noArrow: true };
    if (knife && p.fed) return { x: KNIFE_X, y: GY - 60, text: tr('hint.vil.knifeGet') };
    return null;
  };
  L.drawBack = function (c, t) {
    // pond / sea
    const wy = 462;
    const g = c.createLinearGradient(0, wy, 0, 540);
    g.addColorStop(0, 'rgba(70,170,220,0.95)');
    g.addColorStop(1, 'rgba(30,90,160,0.98)');
    c.fillStyle = g;
    c.fillRect(3300, wy, 500, 90);
    c.strokeStyle = 'rgba(255,255,255,0.45)';
    c.lineWidth = 1.6;
    for (let i = 0; i < 18; i++) {
      const x = 3310 + i * 28 + Math.sin(t + i) * 4;
      c.beginPath();
      c.moveTo(x, wy + 6 + (i % 3) * 9);
      c.quadraticCurveTo(x + 8, wy + 2 + (i % 3) * 9, x + 20, wy + 6 + (i % 3) * 9);
      c.stroke();
    }
    drawSprites(c, L.biome, 'mid'); // sand beach, pier, umbrella, boat
  };
  L.drawEntities = function (c, t) {
    drawFisherman(c, FISH, GY, t);
    // net + stingray
    const sy = 468 + Math.sin(t * 1.4) * 3;
    if (!p.cut) {
      c.strokeStyle = '#8a7a50';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(NET.x - 60, GY);
      c.lineTo(NET.x - 50, 440);
      c.moveTo(NET.x + 60, GY);
      c.lineTo(NET.x + 50, 440);
      c.stroke();
      drawStingray(c, NET.x, sy + 8, { t, dir: 1 });
      drawNet(c, NET.x, sy + 4, 130, 80, false, t);
    } else {
      const u = Math.min(1, p.cutT / 2.2);
      drawStingray(c, NET.x + u * u * 360, sy - u * 30, { t, free: true, dir: 1 });
      drawNet(c, NET.x, 480 + u * 40, 130, 70, true, t);
    }
  };
  addTowers(L); // climbing towers (config/towers.js)
  bakeScenery(L); // sprites + terrain come from assets/ (see assets/data/manifest.js)
  return L;
}
