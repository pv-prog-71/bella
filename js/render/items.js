/* Carried / collectible items: images in assets/images/items/ (rock, seed, branch, flower, honey, bone, knife) */
// Draws an item centred on x,y. `scale` 1 = normal world size.
function drawItem(ctx, type, x, y, scale) {
  const sprite = IMG['items/' + type];
  if (!sprite) return;
  const info = ASSET_MANIFEST.items[type], // { dx, dy } = where the image's top-left corner sits relative to the item centre
    k = (scale || 1) / ASSET_MANIFEST.itemExportScale;
  ctx.drawImage(sprite, x + info.dx * k, y + info.dy * k, sprite.width * k, sprite.height * k);
}
