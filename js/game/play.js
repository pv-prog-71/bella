/* Per-frame play update: puzzles, enemies, hazards, camera */
/* ---------- main play update ---------- */
function playUpdate(dt) {
  const L = G.L,
    b = G.bella;
  G.parts.forEach(p => {
    p.y += (L.biome === 'mountain' ? 40 : L.biome === 'alt' ? 14 : -4) * p.sp * dt;
    p.x += Math.sin(G.t * 0.6 + p.ph) * 14 * dt;
    if (p.y > H + 5) p.y = -5;
    if (p.y < -5) p.y = H + 5;
  });
  G.sparks = G.sparks.filter(s => {
    s.t += dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 200 * dt;
    return s.t < s.dur;
  });
  G.toasts = G.toasts.filter(t => (t.t += dt) < t.dur);
  G.bubbles = G.bubbles.filter(t => (t.t += dt) < t.dur);
  if (G.hurtFx > 0) G.hurtFx = Math.max(0, G.hurtFx - dt * 0.9);
  if (G.titleCard) {
    G.titleCard.t += dt;
    if (G.titleCard.t > 3.6) G.titleCard = null;
  }
  // fading
  if (G.fadeA !== G.fadeTo) {
    const d = G.fadeSpd * dt;
    G.fadeA =
      G.fadeA < G.fadeTo ? Math.min(G.fadeTo, G.fadeA + d) : Math.max(G.fadeTo, G.fadeA - d);
  }
  if (G.dialog) {
    G.dialog.t += dt;
    // pan the camera so the speaking animal is on screen
    const sx = { Chameleon: 3036, Frog: L.p && L.p.frogX, Bear: 3560, Stingray: 3560 }[
      G.dialog.who
    ];
    if (sx != null && !G.alt) {
      const bx = G.bella.x;
      let tx = Math.abs(sx - bx) < 560 ? (sx + bx) / 2 - 480 : sx - 600;
      tx = clamp(tx, 0, L.w - W);
      G.cam.x += (tx - G.cam.x) * Math.min(1, dt * 3.5);
      G.cam.y += (cameraTargetY() - G.cam.y) * Math.min(1, dt * 3.5);
    }
    return;
  }

  // sub-states
  if (G.sub === 'seizure') {
    G.sz.t += dt;
    if (G.sz.t > SZ_DUR) {
      G.fadeTo = 1;
      G.fadeSpd = 1.3;
      if (G.fadeA >= 1) enterAlt();
    }
    return;
  }
  if (G.sub === 'dying') {
    G.dieT += dt;
    if (G.fadeA >= 1 && G.dieT > 1.3) respawnAfterDeath();
    return;
  }
  if (G.sub === 'lvlchange') {
    if (G.fadeA >= 1 && !G.loading) {
      const n = G.nextLvl;
      ensureAssets(levelGroups(n), () => {
        loadLevel(n);
        G.sub = null;
        G.fadeA = 1;
        G.fadeTo = 0;
        G.fadeSpd = 0.8;
        G.titleCard = { text: G.L.name, t: 0 };
      });
    }
    return;
  }
  if (G.sub === 'returning') {
    if (G.fadeA >= 1) finishReturn();
    return;
  }
  if (G.sub === 'ending') {
    endingUpdate(dt);
    return;
  }

  L.t += 0;
  G.hintT += dt;
  if (G.sinceHurt < 99) G.sinceHurt += dt;
  G.fullToastT -= dt;
  // Bella standing still and facing an enemy barks in random bursts (1-3 barks in a row, then a pause); quiet in the alternate world
  G.barkT -= dt;
  if (b.bark > 0) b.bark = Math.max(0, b.bark - dt * 1.7);
  if (G.barkT <= 0) {
    const idle = !G.alt && b.onGround && Math.abs(b.vx) < 20 && !G.sub && !G.dialog && !G.paused,
      near =
        idle &&
        L.enemies.some(e => {
          if (typeof e.x !== 'number' || e.dead || e.gone || (e.box && !e.box())) return false;
          if ((e.x - b.x) * b.face <= 0 || Math.abs(e.x - b.x) >= 200) return false; // in front of her, close
          const bx = e.box && e.box(),
            ey = bx ? bx.y + bx.h / 2 : typeof e.y === 'number' ? e.y - 20 : b.y - 30;
          return Math.abs(ey - (b.y - 30)) < 100; // and at her height (not a spider hanging high up)
        });
    if (!near) { G.barkQ = 0; G.barkT = 0.5; }
    else {
      SND.sfx('bella_bark'); // also opens the mouth (see main.js)
      if (!(G.barkQ > 0)) G.barkQ = 2 + Math.floor(Math.random() * 4); // new burst: 2-5 barks
      G.barkQ--;
      G.barkT = G.barkQ > 0 ? 0.4 + Math.random() * 0.2 : 1.2 + Math.random() * 2;
    }
  }
  G.gateToastT -= dt;
  G.portalCool -= dt;

  stepBella(dt);

  // gate opening animation
  if (L.gateOpening) L.gateT = (L.gateT || 0) + dt;
  // items
  L.items.forEach(it => {
    if (it.cool > 0) it.cool -= dt;
    stepItem(it, dt, L);
  });
  if (!G.held && !G.alt && !G.puz[L.idx] && L.p && L.p.spoke)
    for (const it of L.items) {
      if (it.state !== 'ground' || it.cool > 0 || it.dead || (it.canPick && !it.canPick()))
        continue;
      if (Math.abs(it.x - b.x) < 36 && Math.abs(it.y - (b.y - 24)) < 40) {
        it.state = 'held';
        it.rest = false;
        G.held = it;
        SND.sfx('pick');
        G.hintT = 0;
        break;
      }
    }
  // orbs
  if (!G.alt)
    for (const o of L.orbs) {
      if (o.got) continue;
      const dx = o.x - b.x,
        dy = o.y - (b.y - 26);
      if (dx * dx + dy * dy < 34 * 34) {
        if (G.mana >= maxMana()) {
          if (G.fullToastT <= 0) {
            toast(tr('toast.manaFull'), 1.8);
            SND.sfx('full');
            G.fullToastT = 3;
          }
          continue;
        }
        o.got = true;
        G.mana = Math.min(maxMana(), G.mana + L.orbValue);
        SND.sfx('orb');
        spawnSparks(o.x, o.y, '#a8c8ff', 8);
      }
    }
  // level logic + enemies
  if (L.update) L.update(dt);
  const bb = { x: b.x - 19, y: b.y - 50, w: 38, h: 50 };
  for (const e of L.enemies) {
    e.update && e.update(dt);
    const bx = e.box && e.box();
    if (bx && rectsOverlap(bb, bx)) {
      if (hurt(Math.round((e.dmg || 10) * (ENEMY_DMG_SCALE[L.idx] || 1)), e.x)) {
        e.onHit && e.onHit();
      }
    }
  }
  // water hazards
  for (const z of L.water || []) {
    if (b.x > z.x1 && b.x < z.x2 && b.y > z.y) {
      SND.sfx('splash');
      spawnSparks(b.x, z.y, '#bfe8ff', 14);
      if (z.type === 'croc') {
        SND.sfx('snap');
        b.inv = 0;
        hurt(DMG.croc, b.x, true);
      } else {
        b.inv = 0;
        hurt(5, b.x, true);
        G.say(b.x, z.y - 80, tr('bubble.splash'), 1.4);
      }
      if (G.hp > 0) {
        b.x = z.respawn.x;
        b.y = z.respawn.y;
        b.vx = b.vy = 0;
        b.inv = 1.6;
      }
    }
  }
  // spell timers
  ['invis', 'jump', 'resist'].forEach(k => {
    if (G.fx[k] > 0) G.fx[k] = Math.max(0, G.fx[k] - dt);
  });
  if (G.wave) {
    G.wave.t += dt;
    const r = G.wave.t * 3000;
    L.enemies.forEach(e => {
      if (e.kill && Math.hypot(e.x - G.wave.x, e.y - 40 - G.wave.y) < r) e.kill();
    });
    if (G.wave.t > 1.8) G.wave = null;
  }
  // alternate world
  if (G.alt) {
    L.time -= dt;
    if (L.time <= 0) {
      L.time = 0;
      G.hp = 0;
      toast(tr('toast.timeout'), 2);
      die();
    }
    for (const p of L.portals) {
      if (G.portalCool > 0 || G.sub) break;
      if (Math.abs(b.x - p.x) < 26 && b.y > p.y - 96 && b.y < p.y + 14) {
        if (p.exit) {
          SND.sfx('portal');
          if (G.normalL.isLast) leaveAlt();
          else changeLevel(G.lvl + 1);
        } else {
          SND.sfx('portal');
          const d = p.dest === 'start' ? L.spawn : L.portals.find(q => q.id === p.dest);
          b.x = d.x + (p.dest === 'start' ? 0 : 60);
          b.y = d.y;
          b.vx = b.vy = 0;
          b.inv = 1.4;
          G.portalCool = 1.6;
          G.tele = { t: 0 };
          spawnSparks(b.x, b.y - 40, '#b8a8ff', 20);
        }
        break;
      }
    }
    if (G.tele) {
      G.tele.t += dt;
      if (G.tele.t > 1) G.tele = null;
    }
  } else {
    // health regeneration: slow, after several seconds without damage
    if (G.sinceHurt > 6 && G.hp < 100) G.hp = Math.min(100, G.hp + 2 * dt);
    // gate / exit
    if (L.gate && !G.puz[L.idx]) {
      if (b.x > L.exitX - 70 && G.gateToastT <= 0) {
        G.gateToastT = 4;
        G.say(b.x, b.y - 80, tr('bubble.helpFirst'), 2.4);
      }
    }
    if (G.puz[L.idx] && !G.sub) {
      if (G.seizureTimer > 0) {
        G.seizureTimer -= dt;
        if (G.seizureTimer <= 0) G.seizureTimer = 0.0001;
        if (G.seizureTimer <= 0.0001 && b.onGround) {
          G.seizureTimer = -1;
          startSeizure();
          return;
        }
      }
      if (G.szPending && b.onGround && b.x > L.exitX - 150) {
        G.szPending = false;
        startSeizure();
        return;
      }
      if (b.x > L.exitX + 30) {
        b.x = L.exitX + 30;
        if (b.vx > 0) b.vx = 0;
      }
    }
    // autosave
    G.saveT += dt;
    if (G.saveT > 5) {
      G.saveT = 0;
      writeSave();
    }
  }
  // camera
  const tx = clamp(b.x - 480 + b.face * 70, 0, L.w - W);
  G.cam.x += (tx - G.cam.x) * Math.min(1, dt * 4);
  G.cam.y += (cameraTargetY() - G.cam.y) * Math.min(1, dt * 4);
}
