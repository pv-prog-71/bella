/* Enemy factories (snake, spider, croc, eagle, wasp, boar) */
/* ---------- enemies ---------- */
function grassTuft(c, x, y) {
  c.strokeStyle = '#3f8a34';
  c.lineWidth = 2.2;
  c.lineCap = 'round';
  for (let i = -3; i <= 3; i++) {
    c.beginPath();
    c.moveTo(x + i * 3, y);
    c.quadraticCurveTo(x + i * 4, y - 10, x + i * 6 + (i > 0 ? 3 : -3), y - 18 + Math.abs(i));
    c.stroke();
  }
}
function mkGrassSnake(x) {
  return {
    name: 'snake',
    x,
    home: x,
    rise: 0,
    st: 0,
    dir: 1,
    dmg: DMG.snake,
    t: Math.random() * 5,
    update(dt) {
      this.t += dt;
      const b = G.bella,
        dx = b.x - this.x;
      if (this.st === 0) {
        if (Math.abs(dx) < 170 && Math.abs(b.y - GY) < 70) {
          this.st = 1;
          SND.sfx('snake_hiss');
          setTimeout(() => SND.sfx('bella_bark'), 180); // Bella reacts to the snake
        }
      } else if (this.st === 1) {
        this.rise = Math.min(1, this.rise + dt * 3);
        this.dir = dx > 0 ? 1 : -1;
        if (this.rise >= 1) {
          this.x = clamp(this.x + (dx > 0 ? 1 : -1) * 72 * dt, this.home - 180, this.home + 180);
          if (Math.abs(dx) > 360) this.st = 2;
        }
      } else {
        this.rise -= dt * 2;
        if (this.rise <= 0) {
          this.rise = 0;
          this.st = 0;
        }
      }
    },
    box() {
      return this.rise > 0.6 ? { x: this.x - 34, y: GY - 26, w: 68, h: 26 } : null;
    },
    draw(c, t) {
      grassTuft(c, this.x - 10, GY);
      grassTuft(c, this.x + 12, GY);
      if (this.rise > 0) drawSnake(c, this.x, GY, { dir: this.dir, rise: this.rise, t, len: 76 });
      else {
        c.fillStyle = 'rgba(255,225,60,0.9)';
        if (Math.sin(t * 1.3 + this.home) > 0.8) {
          ell(c, this.x, GY - 6, 1.6, 1.6);
          c.fill();
        }
      }
    }
  };
}
function mkSpider(x, phase) {
  return {
    name: 'spider',
    x,
    y: 120,
    t: phase || 0,
    dmg: DMG.spider,
    update(dt) {
      this.t += dt;
      const u = this.t % 7;
      this.y =
        u < 2.2
          ? lerp(120, 372, ease(u / 2.2))
          : u < 2.8
            ? 372
            : u < 5
              ? lerp(372, 120, ease((u - 2.8) / 2.2))
              : 120;
    },
    box() {
      return { x: this.x - 14, y: this.y - 12, w: 28, h: 30 };
    },
    draw(c, t) {
      drawSpider(c, this.x, this.y, { t, top: -20 });
    }
  };
}
function mkCroc(x, dir) {
  return {
    name: 'croc',
    x,
    dir: dir || 1,
    up: 0,
    open: 0,
    t: Math.random() * 6,
    dmg: 0,
    nobox: true,
    update(dt) {
      this.t += dt;
      const b = G.bella,
        near = Math.abs(b.x - this.x) < 110 && b.y < GY + 5;
      const target = near ? 1 : 0;
      this.up += (target - this.up) * Math.min(1, dt * 3);
      this.open += ((near ? 1 : 0) - this.open) * Math.min(1, dt * 4);
      this.x += Math.sin(this.t * 0.4) * 6 * dt;
    },
    box() {
      return null;
    },
    draw(c, t) {
      drawCroc(c, this.x, 470, { t, dir: this.dir, up: this.up * 0.4, open: this.open });
    }
  };
}
function mkEagle(x1, x2) {
  return {
    name: 'eagle',
    x: x1,
    y: 70,
    dir: -1,
    t: 0,
    st: 'cruise',
    timer: 4 + Math.random() * 3,
    dmg: DMG.eagle,
    zone: [x1, x2],
    tx: 0,
    sx: 0,
    sy: 0,
    dive: 0,
    warn: 0,
    update(dt) {
      const b = G.bella,
        active = b.x > this.zone[0] && b.x < this.zone[1];
      this.t += dt;
      if (this.st === 'cruise') {
        const goal = b.x + Math.sin(this.t * 0.45) * 340;
        this.x += (goal - this.x) * Math.min(1, dt * 1.2);
        this.y = 66 + Math.sin(this.t * 1.1) * 12;
        this.dir = Math.cos(this.t * 0.45) > 0 ? 1 : -1;
        if (active && !G.altInvis) this.timer -= dt;
        if (this.timer <= 0) {
          this.st = 'warn';
          this.timer = 1.1;
          SND.sfx('warn');
        }
      } else if (this.st === 'warn') {
        this.timer -= dt;
        this.warn = this.timer;
        this.x += (b.x + (this.x < b.x ? -300 : 300) - this.x) * Math.min(1, dt * 2);
        if (this.timer <= 0) {
          this.st = 'dive';
          this.dive = 0;
          this.tx = b.x;
          this.sx = this.x;
          this.sy = this.y;
          SND.sfx('swoosh');
        }
      } else if (this.st === 'dive') {
        this.dive += dt / 1.0;
        const u = Math.min(1, this.dive);
        this.x = lerp(this.sx, this.tx, u);
        this.y = lerp(this.sy, GY - 34, u * u);
        this.dir = this.tx > this.sx ? 1 : -1;
        if (this.dive >= 1.18) {
          this.st = 'climb';
          this.dive = 0;
          this.sx = this.x;
          this.sy = this.y;
        }
      } else {
        this.dive += dt / 1.4;
        const u = Math.min(1, this.dive);
        this.x = this.sx + this.dir * 220 * u;
        this.y = lerp(this.sy, 66, ease(u));
        if (u >= 1) {
          this.st = 'cruise';
          this.timer = 7 + Math.random() * 4;
        }
      }
    },
    box() {
      return this.st === 'dive' && this.dive > 0.55
        ? { x: this.x - 30, y: this.y - 14, w: 60, h: 34 }
        : null;
    },
    draw(c, t) {
      const ang =
        this.st === 'dive'
          ? Math.atan2(GY - 34 - this.sy, this.tx - this.sx || 1) * 0.0 + 0.55 * this.dir
          : 0;
      drawEagle(c, this.x, this.y, {
        t,
        dir: this.dir,
        dive: this.st === 'dive',
        ang: this.st === 'dive' ? 0.35 * this.dir : 0
      });
    },
    drawWarn(c, camx) {
      if (this.st !== 'warn') return;
      const sx = clamp(G.bella.x - camx, 40, 920);
      c.fillStyle = 'rgba(255,205,60,0.95)';
      c.beginPath();
      c.moveTo(sx, 74);
      c.lineTo(sx + 18, 104);
      c.lineTo(sx - 18, 104);
      c.closePath();
      c.fill();
      c.fillStyle = '#3a2800';
      c.font = '700 20px Fredoka, sans-serif';
      c.textAlign = 'center';
      c.fillText('!', sx, 101);
    }
  };
}
function mkWasp(hx, hy) {
  return {
    name: 'wasp',
    x: hx,
    y: hy,
    hx,
    hy,
    t: Math.random() * 6,
    st: 0,
    dmg: DMG.wasp,
    dir: 1,
    cool: 0,
    update(dt) {
      this.t += dt;
      const b = G.bella;
      if (this.cool > 0) this.cool -= dt;
      if (this.st === 0) {
        const tx = this.hx + Math.cos(this.t * 0.9) * 70,
          ty = this.hy + Math.sin(this.t * 1.3) * 30;
        this.dir = tx > this.x ? 1 : -1;
        this.x += (tx - this.x) * Math.min(1, dt * 3);
        this.y += (ty - this.y) * Math.min(1, dt * 3);
        if (
          this.cool <= 0 &&
          !G.altInvis &&
          Math.abs(b.x - this.x) < 230 &&
          Math.abs(b.x - this.hx) < 420
        )
          this.st = 1;
      } else {
        const dx = b.x - this.x,
          dy = b.y - 30 - this.y,
          d = Math.hypot(dx, dy) || 1;
        this.dir = dx > 0 ? 1 : -1;
        this.x += (dx / d) * 105 * dt;
        this.y += (dy / d) * 105 * dt;
        if (Math.abs(b.x - this.hx) > 480 || this.cool > 0) this.st = 2;
      }
      if (this.st === 2) {
        const dx = this.hx - this.x,
          dy = this.hy - this.y,
          d = Math.hypot(dx, dy);
        this.x += (dx / (d || 1)) * 130 * dt;
        this.y += (dy / (d || 1)) * 130 * dt;
        if (d < 20) this.st = 0;
      }
    },
    onHit() {
      this.cool = 2.5;
      this.st = 2;
    },
    box() {
      return this.cool > 1.5 ? null : { x: this.x - 14, y: this.y - 10, w: 28, h: 20 };
    },
    draw(c, t) {
      drawWasp(c, this.x, this.y, { t, dir: this.dir });
    }
  };
}
function mkBoar(x1, x2) {
  return {
    name: 'boar',
    x: (x1 + x2) / 2,
    x1,
    x2,
    dir: 1,
    st: 'patrol',
    timer: 0,
    t: 0,
    dmg: DMG.boar,
    update(dt) {
      this.t += dt;
      const b = G.bella,
        dx = b.x - this.x;
      if (this.st === 'patrol') {
        this.x += this.dir * 55 * dt;
        if (this.x > this.x2) this.dir = -1;
        if (this.x < this.x1) this.dir = 1;
        if (
          !G.altInvis &&
          Math.abs(dx) < 380 &&
          b.x > this.x1 - 80 &&
          b.x < this.x2 + 80 &&
          Math.abs(b.y - GY) < 90
        ) {
          this.st = 'alert';
          this.timer = 0.75;
          this.dir = dx > 0 ? 1 : -1;
          SND.sfx('growl');
        }
      } else if (this.st === 'alert') {
        this.timer -= dt;
        if (this.timer <= 0) {
          this.st = 'charge';
          this.cd = dx > 0 ? 1 : -1;
          this.dir = this.cd;
        }
      } else if (this.st === 'charge') {
        this.x += this.dir * 290 * dt;
        if (this.x > this.x2 + 60 || this.x < this.x1 - 60) {
          this.st = 'rest';
          this.timer = 1.8;
        }
      } else {
        this.timer -= dt;
        if (this.timer <= 0) {
          this.st = 'patrol';
          this.dir = this.x > (this.x1 + this.x2) / 2 ? -1 : 1;
        }
      }
    },
    box() {
      return this.st === 'rest' ? null : { x: this.x - 34, y: GY - 42, w: 68, h: 42 };
    },
    draw(c, t) {
      drawBoar(c, this.x, GY, {
        t,
        dir: this.dir,
        run: this.st === 'charge',
        lean: this.st === 'alert' ? 1 : this.st === 'charge' ? -0.6 : 0
      });
      if (this.st === 'alert') {
        c.fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 3; i++) {
          ell(c, this.x + this.dir * 40 + i * 5 * -this.dir, GY - 3 - i * 3, 3 + i, 2);
          c.fill();
        }
      }
    }
  };
}
