/* Level 1 - Forest (chameleon + rock puzzle) */
/* ======================= FOREST ======================= */
function buildForest() {
  const L = baseLevel(0, 'forest', 4600);
  L.name = tr('level.forest');
  L.nextName = tr('level.swamp');
  L.theme = 'forest';
  L.solids.push(
    ground(0, 4600),
    hill(660, 190, 36),
    hill(1950, 200, 46),
    hill(3380, 200, 40),
    hill(3950, 180, 36)
  );
  L.solids.push(
    plat(1040, 330, 150),
    plat(1230, 262, 150),
    plat(3120, 330, 130),
    plat(3310, 262, 130)
  );
  L.solids.push(plat(2240, 325, 140), plat(2420, 250, 140), plat(2600, 165, 260, 24));
  addGate(L, 'bramble');
  orbArc(L, 380, GY - 40, 6, 200, 50);
  orbArc(L, 620, GY - 90, 5, 140, 40);
  orbArc(L, 1110, 300, 3, 80, 0);
  orbArc(L, 1300, 232, 3, 80, 0);
  orbArc(L, 1700, GY - 40, 6, 220, 60);
  orbArc(L, 2050, GY - 110, 5, 160, 30);
  orbArc(L, 3180, 300, 3, 80, 0);
  orbArc(L, 3380, 232, 3, 80, 0);
  orbArc(L, 3640, GY - 40, 6, 220, 60);
  orbArc(L, 4100, GY - 40, 6, 220, 60);
  orbArc(L, 4300, GY - 110, 4, 120, 40);
  L.items.push(mkItem('rock', 1580, towerDeckY('forest', 1580) - 12)); // on top of the first big tree
  // the first level was too easy: more snakes, and two spiders in the second half
  L.enemies.push(
    mkGrassSnake(900),
    mkGrassSnake(1780),
    mkGrassSnake(2500),
    mkGrassSnake(3300),
    mkGrassSnake(3800),
    mkGrassSnake(4250),
    mkSpider(2200, 2),
    mkSpider(3050, 1),
    mkSpider(4000, 3.5)
  );
  const p = (L.p = { spoke: false, hit: false, fleeT: 0, snakeX: 2915, happy: 0, done: false });
  // the big purple snake bites if Bella comes close on the ground (she must reach it from above with the rock)
  L.enemies.push({
    name: 'puzzlesnake',
    x: p.snakeX,
    dmg: DMG.puzzleSnake,
    hissCool: 0,
    update(dt) {
      this.x = p.snakeX;
      this.hissCool -= dt;
      const b = G.bella,
        near = Math.abs(b.x - this.x) < 330 && b.y > GY - 70;
      if (near && this.hissCool <= 0 && !p.hit) {
        this.hissCool = 4;
        SND.sfx('snake_hiss');
        setTimeout(() => SND.sfx('bella_bark'), 180);
      }
    },
    box() {
      return p.hit ? null : { x: this.x - 75, y: GY - 90, w: 150, h: 90 };
    }
  });
  L.update = function (dt) {
    const b = G.bella;
    L.t += dt;
    if (!p.spoke && b.x > 2590 && onScreen(3036, GY - 40) && (p.seen = (p.seen || 0) + dt) > 0.9) {
      p.spoke = true;
      G.openDialog('Chameleon', tr('dlg.chameleon.ask'));
    }
    const rock = L.items.find(i => i.type === 'rock');
    if (
      !p.hit &&
      rock &&
      rock.state === 'ground' &&
      !rock.rest &&
      rock.y > 340 &&
      Math.abs(rock.x - p.snakeX) < 55 &&
      rock.y - rock.peak > 110
    ) {
      p.hit = true;
      SND.sfx('rockhit');
      G.say(p.snakeX, GY - 60, tr('bubble.hsss'), 1.6);
      rock.rest = true;
      rock.vx = 0;
      p.fleeT = 0;
    }
    if (p.hit) {
      p.fleeT += dt;
      if (p.fleeT > 0.4) p.snakeX -= 230 * dt;
      if (!p.done && p.fleeT > 1.3) {
        p.done = true;
        p.happy = 1;
        G.reward(0, 'Chameleon', tr('dlg.chameleon.thanks'));
      }
    }
  };
  L.hint = function () {
    if (p.done || !p.spoke) return null; // no hint before the puzzle has started
    const b = G.bella,
      rock = L.items.find(i => i.type === 'rock');
    // the arrow points to the high ledge above the snake (where the player would think of going first);
    // the rock is only mentioned in words, once Bella is up there and has nothing to drop
    if (G.held && G.held.type === 'rock') return { x: 2860, y: 140, text: tr('hint.forest.drop') };
    if (p.hit) return null;
    if (b.y < 220 && b.x > 2580 && b.x < 2880)
      return { x: 2860, y: 140, text: tr('hint.forest.rock'), noArrow: true };
    return { x: 2730, y: 120, text: tr('hint.forest.climb') };
  };
  L.drawBack = function (c, t) {
    drawSprites(c, L.biome, 'mid'); // tree stump
    drawChameleon(c, 3036, GY - 26, { t, dir: -1, mood: p.happy });
  };
  L.drawEntities = function (c, t) {
    // puzzle snake
    if (p.snakeX > 2300) {
      const a = p.hit ? clamp(1 - (2915 - p.snakeX) / 500, 0, 1) : 1;
      drawSnake(c, p.snakeX, GY, {
        dir: p.hit ? -1 : 1,
        rise: p.hit ? 0.2 : 0.8 + Math.sin(t * 3) * 0.2,
        t: t * (p.hit ? 2 : 1),
        len: 110,
        amp: p.hit ? 10 : 5,
        col: '#7a3a8a',
        alpha: a
      });
    }
  };
  addTowers(L); // climbing towers (config/towers.js)
  bakeScenery(L); // sprites + terrain come from assets/ (see assets/data/manifest.js)
  return L;
}
