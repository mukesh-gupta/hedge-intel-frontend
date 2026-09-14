"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart } from "lucide-react";
import { SIDEBAR_ITEMS } from "@/lib/nav";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <LineChart size={22} className="text-accent" />
        <div>
          <p className="text-sm font-bold leading-tight text-foreground">GLOBAL MACRO</p>
          <p className="text-[11px] leading-tight text-muted">TERMINAL</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {SIDEBAR_ITEMS.map(({ href, label, icon: Icon, matchHref }) => {
          const base = matchHref ?? href;
          const active = base === "/" ? pathname === "/" : pathname.startsWith(base);
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
