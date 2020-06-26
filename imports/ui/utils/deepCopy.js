/* eslint-disable */
export default function deepCopy(src) {
  const target = Array.isArray(src) ? [] : {};
  for (const key in src) {
    const v = src[key];
    if (v) {
      if (typeof v.getMonth === 'function') {
        target[key] = new Date(v.valueOf());
      } else if (typeof v === "object") {
        target[key] = deepCopy(v);
      } else {
        target[key] = v;
      }
    } else {
      target[key] = v;
    }
  }

  return target;
}
