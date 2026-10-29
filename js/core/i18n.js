/* Tiny text lookup: tr(key, {params}) reads the STRINGS table from lang/<code>.js */
function tr(key, params) {
  let s = typeof STRINGS !== 'undefined' && STRINGS[key] != null ? STRINGS[key] : key; // a missing key shows the key itself
  if (params) s = s.replace(/\{(\w+)\}/g, (m, k) => (params[k] != null ? params[k] : m));
  return s;
}
