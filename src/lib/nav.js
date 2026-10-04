import {
  Home,
  LineChart,
  Zap,
  PieChart,
  Star,
  MessageCircle,
  ClipboardList,
  Settings,
  Menu,
} from "lucide-react";

/** @import { LucideIcon } from "lucide-react" */

/**
 * @typedef {Object} NavItem
 * @property {string} href
 * @property {string} label
 * @property {LucideIcon} icon
 * @property {string} [matchHref] - For active-state matching when href includes a query string.
 */

/** @type {NavItem[]} */
export const MOBILE_TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/signals", label: "Signals", icon: Zap },
  { href: "/markets", label: "Markets", icon: LineChart },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/more", label: "More", icon: Menu },
];

/** @type {NavItem[]} */
export const SIDEBAR_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/signals", label: "Live Signals", icon: Zap },
  { href: "/markets", label: "Market Data", icon: LineChart },
  // matchHref: for active-state matching when href includes a query string.
  { href: "/markets?tab=Sectors", label: "Sector Analysis", icon: PieChart, matchHref: "/markets" },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/chat", label: "AI Intelligence", icon: MessageCircle },
  { href: "/logs", label: "Historical Logs", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings },
];
