import type { LucideIcon } from "lucide-react";
import { Home, LineChart, Zap, PieChart, Star, MessageCircle, ClipboardList, Settings, Menu } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** For active-state matching when href includes a query string. */
  matchHref?: string;
}

export const MOBILE_TABS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/signals", label: "Signals", icon: Zap },
  { href: "/markets", label: "Markets", icon: LineChart },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/more", label: "More", icon: Menu },
];

export const SIDEBAR_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/signals", label: "Live Signals", icon: Zap },
  { href: "/markets", label: "Market Data", icon: LineChart },
  { href: "/markets?tab=Sectors", label: "Sector Analysis", icon: PieChart, matchHref: "/markets" },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/chat", label: "AI Intelligence", icon: MessageCircle },
  { href: "/logs", label: "Historical Logs", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings },
];
