/**
 * Number with thousands separators, in one fixed locale. `toLocaleString(undefined)`
 * formats with the server's locale during server rendering and the viewer's in the
 * browser; where those group digits differently (en-IN writes 1,00,000) the text
 * differs and React throws a hydration error.
 */
export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return value.toLocaleString("en-US", { maximumFractionDigits });
}
