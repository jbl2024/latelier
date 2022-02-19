export default function isNumeric(str) {
  if (typeof str !== "string") return false;
  return !Number.isNaN(str) && !Number.isNaN(parseFloat(str));
}
