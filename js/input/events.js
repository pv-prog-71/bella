/* Keyboard, mouse and touch event wiring */
/* ---------- input wiring ---------- */
function ensureAudio() {
  SND.init();
  if (SND.ready && !SND.theme) SND.music(G.state === 'play' && G.L ? G.L.theme : 'title', 2);
}
function toLogical(e) {
  const r = cv.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
}
function setTouchDir(x) {
  touch.left = x < W / 2;
  touch.right = !touch.left;
}
cv.addEventListener('pointerdown', e => {
  ensureAudio();
  if (e.pointerType !== 'mouse') {
    touch.seen = true;
    if (!touch.fs) {
      // first touch: go full screen and lock landscape where the browser allows it (iPhone Safari does not)
      touch.fs = true;
      try {
        const el = document.documentElement;
        if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().catch(() => {});
        if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
      } catch (x) {}
    }
  }
  try {
    cv.focus({ preventScroll: true });
  } catch (x) {}
  const p = toLogical(e);
  mouse.x = p.x;
  mouse.y = p.y;
  mouse.down = true;
  mouse.moved = true;
  for (let i = ui.btns.length - 1; i >= 0; i--) {
    const b = ui.btns[i];
    if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
      SND.sfx('ui');
      b.fn();
      return;
    }
  }
  if (G.state === 'intro') {
    introNext();
    return;
  }
  if (e.pointerType !== 'mouse' && G.state === 'play' && !G.paused && !G.dialog) {
    if (ui.jumpRect && p.x >= ui.jumpRect.x && p.x <= ui.jumpRect.x + ui.jumpRect.w && p.y >= ui.jumpRect.y && p.y <= ui.jumpRect.y + ui.jumpRect.h) {
      // on-screen jump button: held = higher jump, a second finger can keep walking
      touch.jumpHeld = true;
      touch.jumpPid = e.pointerId;
      try {
        cv.setPointerCapture(e.pointerId);
      } catch (x) {}
      return;
    }
    if (!touch.hinted) {
      touch.hinted = true;
      toast(tr('toast.touch'), 7);
    }
    // tapping Bella (a bit generous for a finger) uses the item she carries, like the E key
    const bx = G.bella.x - G.cam.x,
      by = G.bella.y - G.cam.y - 30;
    if (Math.abs(p.x - bx) < 55 && Math.abs(p.y - by) < 70) {
      useItem();
      return;
    }
    touch.pid = e.pointerId;
    touch.sx = p.x;
    touch.sy = p.y;
    touch.active = true;
    setTouchDir(p.x);
    try {
      cv.setPointerCapture(e.pointerId);
    } catch (x) {}
  }
});
cv.addEventListener('pointermove', e => {
  const p = toLogical(e);
  mouse.x = p.x;
  mouse.y = p.y;
  mouse.moved = true;
  if (touch.active && e.pointerId === touch.pid) {
    setTouchDir(p.x);
    if (touch.sy - p.y > 45) {
      touch.jump = true;
      touch.jumpUntil = performance.now() + 260; // keep the jump 'held' a moment so a swipe gives a full jump, not a hop
      touch.sy = p.y;
    }
  }
});
function endTouch(e) {
  if (e.pointerId === touch.jumpPid) {
    touch.jumpHeld = false;
    touch.jumpPid = null;
  }
  if (e.pointerId === touch.pid) {
    touch.active = false;
    touch.left = touch.right = false;
    touch.pid = null;
  }
  mouse.down = false;
}
cv.addEventListener('pointerup', endTouch);
cv.addEventListener('pointercancel', endTouch);
cv.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('keydown', e => {
  ensureAudio();
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code))
    e.preventDefault();
  if (e.repeat) {
    keys[e.code] = true;
    return;
  }
  keys[e.code] = true;
  const menuMode =
    G.state === 'title' ||
    G.state === 'credits' ||
    G.state === 'bye' ||
    G.state === 'endcard' ||
    (G.state === 'play' && G.paused);
  if (G.dialog) {
    if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE') {
      if (G.dialog.t * 48 < G.dialog.text.length) G.dialog.t = 99;
      else {
        closeDialog();
        G.bella.jumpHeld = true;
      }
    }
    return;
  }
  if (menuMode) {
    if (e.code === 'ArrowDown' || e.code === 'KeyS')
      ui.focus = (ui.focus + 1) % Math.max(1, ui.menu.length);
    else if (e.code === 'ArrowUp' || e.code === 'KeyW')
      ui.focus = (ui.focus - 1 + ui.menu.length) % Math.max(1, ui.menu.length);
    else if (e.code === 'Enter' || e.code === 'Space') {
      const b = ui.menu[ui.focus];
      if (b) {
        SND.sfx('ui');
        b.fn();
      }
    } else if (e.code === 'Escape') {
      if (G.paused) G.paused = false;
      else if (G.state === 'credits' || G.state === 'bye') G.state = 'title';
      else if (ui.confirmNew) ui.confirmNew = false;
    }
    return;
  }
  if (G.state === 'intro') {
    if (e.code === 'Space' || e.code === 'Enter') introNext();
    else if (e.code === 'Escape') beginPlay(0);
    return;
  }
  if (G.state === 'play') {
    if (e.code === 'Escape' || e.code === 'KeyP') {
      if (!G.sub || G.sub === 'seizure') {
        G.paused = true;
        ui.focus = 0;
      }
    } else if (
      e.code === 'KeyE' ||
      e.code === 'KeyX' ||
      e.code === 'ArrowDown' ||
      e.code === 'Enter'
    )
      useItem();
    else if (e.code.startsWith('Digit')) {
      const n = +e.code.slice(5) - 1;
      if (n >= 0 && n < 4) castSpell(n);
    } else if (e.code === 'KeyM') SND.setMusicOn(!SND.musicOn);
  }
  if (e.code === 'KeyF') {
    try {
      const el = document.documentElement;
      if (!document.fullscreenElement)
        el.requestFullscreen && el.requestFullscreen().catch(() => {});
      else document.exitFullscreen();
    } catch (x) {}
  }
});
window.addEventListener('keyup', e => {
  keys[e.code] = false;
});
window.addEventListener('blur', () => {
  for (const k in keys) keys[k] = false;
  touch.left = touch.right = false;
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && G.state === 'play' && !G.sub) {
    G.paused = true;
    ui.focus = 0;
  }
});
window.addEventListener('resize', resize);
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
try {
  new ResizeObserver(resize).observe(document.getElementById('stage'));
} catch (e) {}
