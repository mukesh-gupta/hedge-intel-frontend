"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart } from "lucide-react";
import { MOBILE_TABS } from "@/lib/nav";
import NotificationBell from "@/components/NotificationBell";

export default function TopTabs() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 hidden border-b border-border bg-surface/95 backdrop-blur md:flex lg:hidden">
      <div className="flex w-full items-center gap-6 px-6 py-3">
        <div className="flex items-center gap-2">
          <LineChart size={20} className="text-accent" />
          <span className="text-sm font-bold tracking-tight text-foreground">
            GLOBAL MACRO TERMINAL
          </span>
        </div>
        <nav className="flex flex-1 gap-1">
          {MOBILE_TABS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
        <NotificationBell />
      </div>
    </header>
  );
}
