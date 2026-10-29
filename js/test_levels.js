/* TEST BUILD ONLY - jump straight to any level. Not part of the release.
 *   keys 1 2 3 4  = go to that level (also works from the title screen)
 *   or open index.html?level=3
 * Earlier levels count as solved: their spells are unlocked and the mana is full. */
(function () {
  function jumpToLevel(n) {
    const i = n - 1;
    G.puz = [0, 1, 2, 3].map(j => j < i);
    G.spells = [0, 1, 2, 3].map(j => j < i);
    G.puzPos = [null, null, null, null];
    G.mana = maxMana();
    G.mode = 'normal';
    G.sub = null;
    G.state = 'title';
    SND.init();
    beginPlay(i);
  }
  window.addEventListener('keydown', e => {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4 && !e.repeat && !e.ctrlKey && !e.altKey && !e.metaKey) jumpToLevel(n);
  });
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;top:6px;left:6px;z-index:9;display:flex;gap:6px;font:600 13px sans-serif';
  [1, 2, 3, 4].forEach(n => {
    const b = document.createElement('button');
    b.textContent = 'Level ' + n;
    b.style.cssText = 'padding:4px 8px;border-radius:6px;border:0;background:#000a;color:#fff;cursor:pointer';
    b.onclick = () => { b.blur(); jumpToLevel(n); };
    bar.appendChild(b);
  });
  const ver = document.createElement('span');
  ver.textContent = 'TEST v' + (typeof GAME_VERSION !== 'undefined' ? GAME_VERSION : '?');
  ver.style.cssText = 'padding:4px 8px;border-radius:6px;background:#c33a;color:#fff';
  bar.appendChild(ver);
  document.body.appendChild(bar);
  const q = parseInt(new URLSearchParams(location.search).get('level'), 10);
  if (q >= 1 && q <= 4) setTimeout(() => jumpToLevel(q), 300);
})();
