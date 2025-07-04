export function toPgArray(array) {
  if (!array || array.length === 0) return "{}";
  return `{${array.join(",")}}`;
}
