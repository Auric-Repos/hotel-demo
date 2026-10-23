import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRightIcon,
  BanknoteIcon,
  BedDoubleIcon,
  CalendarCheckIcon,
  CheckCircle2Icon,
  ClockIcon,
  InboxIcon,
  MessageCircleIcon,
  type LucideIcon,
} from "lucide-react";

import { getDashboardAccess } from "@/lib/dashboard-auth";
import { listBookingsForDashboard } from "@/server/queries/bookings";
import {
  formatDate,
  formatNumber,
  formatPrice,
  formatRelativeTime,
} from "@/lib/format";
import { toWhatsAppDigits } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { NoAccessCard } from "@/components/dashboard/no-access-card";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const TZ = "Africa/Cairo";

/** Today as YYYY-MM-DD in the hotel's timezone (not the server's). */
function todayInCairo() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

function hourInCairo() {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date()),
  );
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayMonth(iso: string, locale: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return {
    day: formatNumber(d.getUTCDate(), locale),
    month: new Intl.DateTimeFormat(locale, {
      month: "short",
      timeZone: "UTC",
    }).format(d),
  };
}

type Props = { params: Promise<{ locale: string }> };

export default function OverviewPage(props: Props) {
  return (
    <main className="section-bento min-h-[70svh]">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Suspense fallback={<OverviewSkeleton />}>
          <OverviewContent {...props} />
        </Suspense>
      </div>
    </main>
  );
}

function OverviewSkeleton() {
  return (
    <div aria-hidden className="space-y-6">
      <div className="h-1.5 w-20 animate-pulse rounded bg-muted" />
      <div className="h-10 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="h-28 animate-pulse rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

async function OverviewContent({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
  const access = await getDashboardAccess();

  if (access.status === "signed-out") {
    const back = encodeURIComponent(`/${locale}/dashboard`);
    redirect(`/${locale}/sign-in?redirect_url=${back}`);
  }
  if (access.status === "no-access") {
    return <NoAccessCard userId={access.userId} />;
  }

  const { tenant } = access;
  const all = await listBookingsForDashboard(tenant.id, undefined);

  // Computed after the data fetch, so "now" is request-time (Cache Components safe).
  const today = todayInCairo();
  const hour = hourInCairo();
  const greetingKey =
    hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const weekEnd = addDays(today, 7);
  const month = today.slice(0, 7);

  const pending = all
    .filter((b) => b.status === "pending")
    // Longest-waiting first: that's the one most likely to be lost.
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  const arrivalsToday = all.filter(
    (b) => b.status === "confirmed" && b.checkIn === today,
  ).length;

  const inHouse = all.filter((b) => b.status === "checked_in").length;

  const monthRevenueCents = all
    .filter(
      (b) =>
        ["confirmed", "checked_in", "checked_out"].includes(b.status) &&
        b.checkIn.startsWith(month),
    )
    .reduce((sum, b) => sum + b.totalPriceCents, 0);

  const upcoming = all
    .filter(
      (b) =>
        b.status === "confirmed" && b.checkIn >= today && b.checkIn <= weekEnd,
    )
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 6);

  const pendingCount = pending.length;

  const whatsappUrl = (b: (typeof all)[number]) =>
    `https://wa.me/${toWhatsAppDigits(b.guestPhone)}?text=${encodeURIComponent(
      t("bookings.whatsappGreeting", {
        name: b.guestName.trim().split(/\s+/)[0] ?? "",
        hotel: tenant.name,
        reference: b.reference,
      }),
    )}`;

  const roomOf = (b: (typeof all)[number]) =>
    locale === "ar" ? b.roomNameAr : b.roomNameEn;

  const initialOf = (name: string) =>
    Array.from(name.trim())[0]?.toUpperCase() ?? "?";

  return (
    <>
      {/* Header */}
      <header className="animate-appear motion-reduce:animate-none">
        <div aria-hidden className="mb-4 flex items-center gap-3">
          <span className="size-1.5 rotate-45 bg-primary" />
          <span className="h-px w-16 bg-linear-to-r from-primary/70 to-transparent rtl:bg-linear-to-l" />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl leading-tight text-foreground md:text-4xl">
              {t("overview.title")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(`overview.greeting.${greetingKey}`)} · {tenant.name}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3.5 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
            <CalendarCheckIcon aria-hidden className="size-3.5 text-foreground" />
            {formatDate(today, locale)}
          </span>
        </div>
      </header>

      {/* Primary call to action: pending requests */}
      {pendingCount > 0 ? (
        <section
          className="group relative mt-8 animate-appear overflow-hidden rounded-2xl border border-primary/40 bg-linear-to-br from-primary/10 via-card to-card p-5 shadow-sm shadow-primary/10 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/15 motion-reduce:animate-none motion-reduce:transition-none sm:p-6"
          style={{ animationDelay: "60ms" }}
        >
          <span
            aria-hidden
            className="absolute inset-y-0 start-0 w-1 bg-primary"
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="relative shrink-0">
                <span
                  aria-hidden
                  className="grid size-11 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/30 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                >
                  <ClockIcon className="size-5 text-foreground" />
                </span>
                <span
                  aria-hidden
                  className="absolute -end-0.5 -top-0.5 flex size-3"
                >
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-3 rounded-full bg-primary ring-2 ring-card" />
                </span>
              </span>
              <div>
                <h2 className="font-heading text-xl text-foreground">
                  {t("overview.banner.title", {
                    count: pendingCount,
                    formatted: formatNumber(pendingCount, locale),
                  })}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t("overview.banner.body")}
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/dashboard/bookings?tab=pending`}
              className={cn(
                "group/cta inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/30",
                "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0 active:scale-[0.98]",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                focusRing,
              )}
            >
              {t("overview.banner.cta")}
              <ArrowRightIcon
                aria-hidden
                className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1 rtl:-scale-x-100 rtl:group-hover/cta:-translate-x-1 motion-reduce:transition-none"
              />
            </Link>
          </div>
        </section>
      ) : (
        <section
          className="mt-8 flex animate-appear items-center gap-4 rounded-2xl border border-border/60 bg-card/80 p-5 motion-reduce:animate-none sm:p-6"
          style={{ animationDelay: "60ms" }}
        >
          <span
            aria-hidden
            className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20"
          >
            <CheckCircle2Icon className="size-5 text-emerald-700" />
          </span>
          <p className="text-sm text-muted-foreground">
            {t("overview.banner.clear")}
          </p>
        </section>
      )}

      {/* Stats */}
      <section
        aria-label={t("overview.title")}
        className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard
          index={0}
          icon={ClockIcon}
          label={t("overview.stats.pending")}
          value={formatNumber(pendingCount, locale)}
          highlight={pendingCount > 0}
        />
        <StatCard
          index={1}
          icon={CalendarCheckIcon}
          label={t("overview.stats.arrivalsToday")}
          value={formatNumber(arrivalsToday, locale)}
        />
        <StatCard
          index={2}
          icon={BedDoubleIcon}
          label={t("overview.stats.inHouse")}
          value={formatNumber(inHouse, locale)}
        />
        <StatCard
          index={3}
          icon={BanknoteIcon}
          label={t("overview.stats.revenue")}
          value={formatPrice(monthRevenueCents, locale, tenant.currency)}
          hint={t("overview.stats.revenueHint")}
        />
      </section>

      {/* Lists */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          delay={300}
          title={t("overview.waiting.title")}
          count={pendingCount > 0 ? formatNumber(pendingCount, locale) : undefined}
          action={
            pendingCount > 0 ? (
              <ViewAll
                href={`/${locale}/dashboard/bookings?tab=pending`}
                label={t("overview.viewAll")}
              />
            ) : null
          }
        >
          {pending.length === 0 ? (
            <EmptyLine icon={InboxIcon}>{t("overview.waiting.empty")}</EmptyLine>
          ) : (
            <ul className="-mx-3 space-y-0.5">
              {pending.slice(0, 5).map((b) => (
                <li
                  key={b.id}
                  className="group flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-primary/5 motion-reduce:transition-none"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 font-heading text-base text-foreground ring-1 ring-primary/20 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none"
                    >
                      {initialOf(b.guestName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {b.guestName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {roomOf(b)} · {formatDate(b.checkIn, locale)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground/70">
                        {t("bookings.received", {
                          time: formatRelativeTime(b.createdAt, locale),
                        })}
                      </p>
                    </div>
                  </div>
                  <a
                    href={whatsappUrl(b)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t("bookings.whatsapp")} — ${b.guestName}`}
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-background/60 text-foreground",
                      "transition-all duration-200 hover:scale-105 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/25 active:scale-95",
                      "motion-reduce:transition-none motion-reduce:hover:scale-100",
                      focusRing,
                    )}
                  >
                    <MessageCircleIcon aria-hidden className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          delay={360}
          title={t("overview.arrivals.title")}
          count={upcoming.length > 0 ? formatNumber(upcoming.length, locale) : undefined}
          action={
            <ViewAll
              href={`/${locale}/dashboard/bookings?tab=confirmed`}
              label={t("overview.viewAll")}
            />
          }
        >
          {upcoming.length === 0 ? (
            <EmptyLine icon={CalendarCheckIcon}>
              {t("overview.arrivals.empty")}
            </EmptyLine>
          ) : (
            <ul className="-mx-3 space-y-0.5">
              {upcoming.map((b) => {
                const isToday = b.checkIn === today;
                const { day, month: mon } = dayMonth(b.checkIn, locale);
                const guests = b.adults + b.children;
                return (
                  <li
                    key={b.id}
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-primary/5 motion-reduce:transition-none"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border leading-none transition-colors duration-300 motion-reduce:transition-none",
                        isToday
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/60 bg-background/70 text-foreground group-hover:border-primary/50",
                      )}
                    >
                      <span className="font-heading text-lg">{day}</span>
                      <span className="mt-1 text-[10px] uppercase tracking-wider opacity-80">
                        {mon}
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {b.guestName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {roomOf(b)} ·{" "}
                        {t("overview.arrivals.guests", {
                          count: guests,
                          formatted: formatNumber(guests, locale),
                        })}
                      </p>
                    </div>
                    {isToday && (
                      <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-foreground">
                        {t("overview.arrivals.today")}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  highlight,
  index,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
  index: number;
}) {
  return (
    <div
      className={cn(
        "group relative animate-appear overflow-hidden rounded-2xl border bg-card p-5 shadow-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10",
        "motion-reduce:animate-none motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        highlight ? "border-primary/40 shadow-primary/10" : "border-border/60",
      )}
      style={{ animationDelay: `${120 + index * 60}ms` }}
    >
      {/* Gold wash that fades in on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
      />
      {/* Hairline that widens on hover */}
      <span
        aria-hidden
        className="absolute inset-x-6 top-0 h-px origin-center scale-x-50 bg-linear-to-r from-transparent via-primary/70 to-transparent opacity-60 transition-all duration-500 group-hover:scale-x-100 group-hover:opacity-100 motion-reduce:transition-none"
      />

      <div className="relative flex items-start justify-between">
        <span
          aria-hidden
          className="grid size-10 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:ring-primary motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        >
          <Icon className="size-4 text-foreground transition-colors duration-300 group-hover:text-primary-foreground" />
        </span>
        {highlight && (
          <span aria-hidden className="relative mt-1 flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
          </span>
        )}
      </div>

      <p className="relative mt-4 break-words font-heading text-2xl leading-tight text-foreground tabular-nums sm:text-3xl">
        {value}
      </p>
      <p className="relative mt-1 text-sm text-muted-foreground">{label}</p>
      {hint && (
        <p className="relative mt-2 text-xs text-muted-foreground/80">{hint}</p>
      )}
    </div>
  );
}

function Panel({
  title,
  count,
  action,
  delay,
  children,
}: {
  title: string;
  count?: string;
  action?: React.ReactNode;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="animate-appear rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md motion-reduce:animate-none motion-reduce:transition-none sm:p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="size-1.5 rotate-45 bg-primary" />
          <h2 className="font-heading text-lg text-foreground">{title}</h2>
          {count && (
            <span className="grid min-w-5 place-items-center rounded-full bg-primary/15 px-1.5 text-[11px] leading-5 font-semibold text-foreground">
              {count}
            </span>
          )}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ViewAll({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group/link inline-flex items-center gap-1 rounded-md text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground",
        focusRing,
      )}
    >
      {label}
      <ArrowRightIcon
        aria-hidden
        className="size-3 transition-transform duration-300 group-hover/link:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/link:-translate-x-0.5 motion-reduce:transition-none"
      />
    </Link>
  );
}

function EmptyLine({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-background/50 px-4 py-10 text-center">
      <span
        aria-hidden
        className="grid size-11 place-items-center rounded-full bg-muted ring-1 ring-border/60"
      >
        <Icon className="size-5 text-muted-foreground" />
      </span>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}