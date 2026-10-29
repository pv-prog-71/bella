/* Image assets: loader and the code that assembles a level from image files.
 * The files live in assets/images/ (parallax/, terrain/, decor/); assets/data/manifest.js lists them per group
 * and says where every scenery sprite sits in each level. Images are loaded per level (biome + the alternate world)
 * and released when the player moves on. */
const IMG = {}; // name ("decor/forest_tree_1") -> loaded HTMLImageElement
const LEVEL_BIOMES = ['forest', 'swamp', 'mountain', 'village'];

function loadImages(names) {
  return Promise.all(
    names
      .filter(n => !IMG[n])
      .map(
        n =>
          new Promise((res, rej) => {
            const im = new Image();
            im.onload = () => {
              IMG[n] = im;
              res();
            };
            im.onerror = () => rej(new Error('Missing image: ' + n));
            im.src =
              (typeof ASSET_DATA !== 'undefined' && ASSET_DATA[n]) || 'assets/images/' + n + '.png'; // ASSET_DATA only exists in the single-file build
          })
      )
  );
}
function groupNames(groups) {
  const out = [];
  groups.forEach(g => (ASSET_MANIFEST.groups[g] || []).forEach(n => out.push(n)));
  return out;
}
function levelGroups(i) {
  return [LEVEL_BIOMES[i], 'alt', 'common'];
}
// Run `then` once the images for these groups are ready (immediately if they already are; otherwise a loading screen shows).
function ensureAssets(groups, then) {
  const names = groupNames(groups).filter(n => !IMG[n]);
  if (!names.length) {
    then();
    return;
  }
  G.loading = { t: 0, err: null };
  loadImages(names)
    .then(() => {
      G.loading = null;
      then();
    })
    .catch(e => {
      G.loading.err = String(e.message || e);
    });
}
// the title-screen backdrop ('night') is dropped while playing and reloaded when the title shows again
let nightLoading = false;
function ensureNight() {
  if (IMG['parallax/night_0'] || nightLoading) return;
  nightLoading = true;
  loadImages(groupNames(['night'])).then(
    () => {
      nightLoading = false;
    },
    () => {
      nightLoading = false;
    }
  );
}
function releaseExcept(groups) {
  const keep = {};
  groupNames(groups).forEach(n => (keep[n] = 1));
  Object.keys(IMG).forEach(n => {
    if (!keep[n]) delete IMG[n];
  });
}

/* ---------- terrain ---------- */
// Ground and platforms are image strips: left end cap + repeating middle tile + right end cap.
function terrainKey(biome, s) {
  if (!s.oneway) return { key: biome + '_ground', style: 'ground' };
  if (biome === 'mountain' || biome === 'alt')
    return { key: `${biome}_ledge_${s.h || 18}`, style: 'ledge' };
  if (s.k === 'bridge') return { key: biome + '_bridge', style: 'bridge' };
  return { key: `${biome}_log_${s.h || 18}`, style: 'log' };
}
function bakeSolid(b, s, biome) {
  const k = terrainKey(biome, s),
    l = IMG['terrain/' + k.key + '_l'],
    m = IMG['terrain/' + k.key + '_m'],
    r = IMG['terrain/' + k.key + '_r'];
  if (!l || !m || !r) return;
  const M = ASSET_MANIFEST,
    head = M.terrain[k.key].head,
    top = s.y - head;
  const rows = k.style === 'ground' ? Math.min(l.height, head + s.h + 4) : l.height; // hills only use the top of the ground strip
  b.drawImage(l, 0, 0, l.width, rows, s.x - M.pad, top, l.width, rows);
  const x1 = s.x + s.w - M.cap;
  for (let x = s.x + M.cap; x < x1; x += M.mid) {
    const w = Math.min(M.mid, x1 - x);
    b.drawImage(m, 0, 0, w, rows, x, top, w, rows);
  }
  b.drawImage(r, 0, 0, r.width, rows, x1, top, r.width, rows);
}

/* ---------- level scenery ---------- */
// L.back = sprites behind the action + terrain; L.front = sprites in front of Bella. Both are level-wide canvases made once at load.
function bakeScenery(L) {
  if (window.__EXPORT__) return; // the exporter only needs the level geometry
  // the canvases are L.top pixels taller than the screen: world y = 0 is at canvas row L.top
  L.back = mkc(L.w, 540 + L.top);
  L.front = mkc(L.w, 540 + L.top);
  const b = L.back.getContext('2d'),
    f = L.front.getContext('2d'),
    lay = ASSET_MANIFEST.layouts[L.biome];
  b.translate(0, L.top);
  f.translate(0, L.top);
  const put = (c, list) =>
    list.forEach(e => {
      const im = IMG[e[0]];
      if (im) c.drawImage(im, e[1], e[2]);
    });
  put(b, lay.back);
  L.solids.forEach(s => {
    if (!s.noPaint) bakeSolid(b, s, L.biome);
  });
  put(f, lay.front);
}

// Draws a list of fixed scenery pieces (see "mid" / "tree" lists in assets/data/manifest.js) inside a level's drawBack/drawEntities.
function drawSprites(ctx, biome, listName) {
  (ASSET_MANIFEST.layouts[biome][listName] || []).forEach(entry => {
    const sprite = IMG[entry[0]];
    if (sprite) ctx.drawImage(sprite, entry[1], entry[2]);
  });
}
