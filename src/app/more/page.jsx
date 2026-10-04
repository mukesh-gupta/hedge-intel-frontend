import Link from "next/link";
import {
  MessageCircle,
  PieChart,
  ClipboardList,
  Target,
  Settings as SettingsIcon,
  ChevronRight,
} from "lucide-react";
import ScreenHeader from "@/components/ScreenHeader";
import ScanButton from "@/components/ScanButton";

const LINKS = [
  { href: "/chat", label: "AI Intelligence Feed", icon: MessageCircle },
  { href: "/markets?tab=Sectors", label: "Sector Analysis", icon: PieChart },
  { href: "/scorecard", label: "Scorecard", icon: Target },
  { href: "/logs", label: "Historical Logs", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function MorePage() {
  return (
    <>
      <ScreenHeader title="More" />
      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-medium text-foreground">Manual RSS Scan</p>
          <ScanButton />
        </div>

        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
          {LINKS.map(({ href, label, icon: Icon }, i) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3.5 text-sm text-foreground ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <Icon size={18} className="text-muted" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={16} className="text-muted" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
