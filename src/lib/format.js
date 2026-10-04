/**
 * Number with thousands separators, in one fixed locale. `toLocaleString(undefined)`
 * formats with the server's locale during server rendering and the viewer's in the
 * browser; where those group digits differently (en-IN writes 1,00,000) the text
 * differs and React throws a hydration error.
 *
 * @param {number} value
 * @param {any} [maximumFractionDigits]
 * @returns {string}
 */
export function formatNumber(value, maximumFractionDigits = 2) {
  return value.toLocaleString("en-US", { maximumFractionDigits });
}
