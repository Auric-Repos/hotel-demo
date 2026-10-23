"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useLocale, useTranslations } from "next-intl";
import {
  CalendarCheckIcon,
  ExternalLinkIcon,
  LayoutDashboardIcon,
  type LucideIcon,
} from "lucide-react";

import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const linkClass = (active: boolean) =>
  cn(
    "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm",
    "transition-colors duration-200 motion-reduce:transition-none",
    focusRing,
    active
      ? "bg-primary/15 font-medium text-foreground ring-1 ring-primary/30"
      : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
  );

export function DashboardHeader() {
  const t = useTranslations("dashboard.nav");
  const tNav = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const pathname = usePathname();

  const items: {
    href: string;
    label: string;
    exact: boolean;
    icon: LucideIcon;
  }[] = [
    {
      href: `/${locale}/dashboard`,
      label: t("overview"),
      exact: true,
      icon: LayoutDashboardIcon,
    },
    {
      href: `/${locale}/dashboard/bookings`,
      label: t("bookings"),
      exact: false,
      icon: CalendarCheckIcon,
    },
  ];

  const isActive = (item: (typeof items)[number]) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const links = items.map((item) => {
    const active = isActive(item);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={linkClass(active)}
      >
        <item.icon aria-hidden className="size-4" />
        {item.label}
      </Link>
    );
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/${locale}/dashboard`}
            className={cn(
              "truncate rounded-lg font-heading text-lg text-foreground",
              "transition-opacity duration-200 hover:opacity-70",
              focusRing,
            )}
          >
            {SITE_CONFIG.name}
          </Link>
          <span className="hidden items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-foreground sm:inline-flex">
            {tNav("dashboard")}
          </span>
        </div>

        {/* Desktop nav */}
        <nav
          aria-label={tNav("dashboard")}
          className="hidden items-center gap-1 md:flex"
        >
          {links}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href={`/${locale}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-xl border border-border/70 bg-card/70 px-3 text-sm text-foreground",
              "transition-colors duration-200 hover:border-primary/60 hover:bg-primary/5 motion-reduce:transition-none",
              focusRing,
            )}
          >
            <ExternalLinkIcon aria-hidden className="size-4 rtl:-scale-x-100" />
            <span className="sr-only sm:not-sr-only">{tAuth("backToSite")}</span>
          </a>
          <UserButton appearance={{ elements: { avatarBox: "size-9" } }} />
        </div>
      </div>

      {/* Mobile nav: second row, scrolls instead of overflowing */}
      <nav
        aria-label={tNav("dashboard")}
        className="flex gap-1 overflow-x-auto border-t border-border/40 px-4 py-2 md:hidden"
      >
        {links}
      </nav>
    </header>
  );
}