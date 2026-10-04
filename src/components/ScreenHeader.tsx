"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import NotificationBell from "@/components/NotificationBell";

export default function ScreenHeader({
  title,
  eyebrow,
  back,
  right,
}: {
  title: string;
  eyebrow?: ReactNode;
  back?: string;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
      {back && (
        <Link href={back} className="text-muted hover:text-foreground">
          <ArrowLeft size={20} />
        </Link>
      )}
      <div className="flex-1">
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            {eyebrow}
          </p>
        )}
        <h1 className="text-base font-bold text-foreground">{title}</h1>
      </div>
      {right}
      <NotificationBell className="lg:hidden" />
    </header>
  );
}
