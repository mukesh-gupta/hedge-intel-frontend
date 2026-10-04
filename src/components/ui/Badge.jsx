/** @import { ReactNode } from "react" */

/** @param {{ children: ReactNode; className?: string; }} props */
export default function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}

/** @param {{ symbol: string }} props */
export function TickerChip({ symbol }) {
  return (
    <Badge className="border-border bg-surface-2 font-mono text-foreground/90">{symbol}</Badge>
  );
}
