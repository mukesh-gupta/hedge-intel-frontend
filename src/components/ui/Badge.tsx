import type { ReactNode } from "react";

export default function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}

export function TickerChip({ symbol }: { symbol: string }) {
  return (
    <Badge className="border-border bg-surface-2 font-mono text-foreground/90">{symbol}</Badge>
  );
}
