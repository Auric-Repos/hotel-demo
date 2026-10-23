import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRightIcon,
  BedDoubleIcon,
  GlobeIcon,
  InboxIcon,
  LockIcon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
  StickyNoteIcon,
} from "lucide-react";

import { getDashboardAccess } from "@/lib/dashboard-auth";
import { listBookingsForDashboard } from "@/server/queries/bookings";
import type { BookingStatus } from "@/server/db/schema";
import {
  formatDate,
  formatNumber,
  formatPrice,
  formatRelativeTime,
} from "@/lib/format";
import { toWhatsAppDigits } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { BookingActions } from "@/components/dashboard/booking-actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

type Tab = "pending" | "confirmed" | "all";
const TAB_ORDER: Tab[] = ["pending", "confirmed", "all"];
const TAB_STATUSES: Record<Tab, BookingStatus[] | undefined> = {
  pending: ["pending"],
  confirmed: ["confirmed", "checked_in"],
  all: undefined,
};

const STATUS: Record<
  BookingStatus,
  { badge: string; dot: string; accent: string }
> = {
  pending: {
    badge: "bg-primary/15 text-foreground",
    dot: "bg-primary",
    accent: "bg-primary",
  },
  confirmed: {
    badge: "bg-emerald-500/10 text-emerald-800",
    dot: "bg-emerald-500",
    accent: "bg-emerald-500",
  },
  checked_in: {
    badge: "bg-sky-500/10 text-sky-800",
    dot: "bg-sky-500",
    accent: "bg-sky-500",
  },
  checked_out: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
    accent: "bg-border",
  },
  cancelled: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
    accent: "bg-border",
  },
  declined: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
    accent: "bg-destructive",
  },
  no_show: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
    accent: "bg-destructive",
  },
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

export default function BookingsPage(props: Props) {
  return (
    <main className="section-bento min-h-[70svh]">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Suspense fallback={<ListSkeleton />}>
          <BookingsContent {...props} />
        </Suspense>
      </div>
    </main>
  );
}

function ListSkeleton() {
  return (
    <div aria-hidden className="space-y-5">
      <div className="h-1.5 w-20 animate-pulse rounded bg-muted" />
      <div className="h-10 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="h-11 w-72 max-w-full animate-pulse rounded-full bg-muted" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}

async function BookingsContent({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { tab: tabParam } = await searchParams;
  const rawTab = Array.isArray(tabParam) ? tabParam[0] : tabParam;
  const tab: Tab = TAB_ORDER.includes(rawTab as Tab) ? (rawTab as Tab) : "pending";

  const t = await getTranslations("dashboard");
  const access = await getDashboardAccess();

  if (access.status === "signed-out") redirect(`/${locale}/sign-in`);

  if (access.status === "no-access") {
    return (
      <div className="relative mx-auto max-w-md rounded-3xl border border-border/60 bg-card/80 p-8 text-center shadow-xl shadow-primary/10 backdrop-blur-xl">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
        />
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/30">
          <LockIcon aria-hidden className="size-6 text-foreground" />
        </span>
        <h1 className="mt-5 font-heading text-2xl text-foreground">
          {t("noAccess.title")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("noAccess.body")}
        </p>
        <p className="mt-6 text-xs text-muted-foreground">{t("noAccess.userId")}</p>
        <p
          dir="ltr"
          className="mt-1.5 select-all break-all rounded-lg bg-background/70 px-3 py-2 font-mono text-xs text-foreground ring-1 ring-border/50"
        >
          {access.userId}
        </p>
      </div>
    );
  }

  const { tenant } = access;

  // The Pending tab shows how many requests are waiting, from any tab.
  const [rows, pendingRows] = await Promise.all([
    listBookingsForDashboard(tenant.id, TAB_STATUSES[tab]),
    tab === "pending"
      ? Promise.resolve(null)
      : listBookingsForDashboard(tenant.id, ["pending"]),
  ]);
  const pendingCount = pendingRows ? pendingRows.length : rows.length;

  return (
    <>
      {/* Page header */}
      <header>
        <div aria-hidden className="mb-4 flex items-center gap-3">
          <span className="size-1.5 rotate-45 bg-primary" />
          <span className="h-px w-16 bg-linear-to-r from-primary/70 to-transparent rtl:bg-linear-to-l" />
        </div>
        <h1 className="font-heading text-3xl leading-tight text-foreground md:text-4xl">
          {t("bookings.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{tenant.name}</p>
      </header>

      {/* Tabs */}
      <nav
        aria-label={t("bookings.title")}
        className="mt-8 inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-border/60 bg-card/80 p-1 shadow-sm backdrop-blur-sm"
      >
        {TAB_ORDER.map((id) => {
          const active = id === tab;
          return (
            <Link
              key={id}
              href={`/${locale}/dashboard/bookings?tab=${id}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm",
                "transition-colors duration-200 motion-reduce:transition-none",
                focusRing,
                active
                  ? "bg-primary font-medium text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
              )}
            >
              {t(`bookings.tabs.${id}`)}
              {id === "pending" && pendingCount > 0 && (
                <span
                  className={cn(
                    "grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] leading-5 font-semibold",
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {formatNumber(pendingCount, locale)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/70 px-6 py-16 text-center backdrop-blur-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted ring-1 ring-border/60">
            <InboxIcon aria-hidden className="size-6 text-muted-foreground" />
          </span>
          <p className="mt-5 text-sm text-muted-foreground">
            {t(`bookings.empty.${tab}`)}
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-5">
          {rows.map((b, index) => {
            const roomName = locale === "ar" ? b.roomNameAr : b.roomNameEn;
            const nights = Math.round(
              (new Date(`${b.checkOut}T00:00:00Z`).getTime() -
                new Date(`${b.checkIn}T00:00:00Z`).getTime()) /
                86_400_000,
            );
            const firstName = b.guestName.trim().split(/\s+/)[0] ?? "";
            const initial = Array.from(b.guestName.trim())[0]?.toUpperCase() ?? "?";
            const whatsappUrl = `https://wa.me/${toWhatsAppDigits(b.guestPhone)}?text=${encodeURIComponent(
              t("bookings.whatsappGreeting", {
                name: firstName,
                hotel: tenant.name,
                reference: b.reference,
              }),
            )}`;
            const style = STATUS[b.status];
            const isPending = b.status === "pending";

            return (
              <li
                key={b.id}
                className="animate-appear motion-reduce:animate-none"
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              >
                <article
                  className={cn(
                    "relative overflow-hidden rounded-2xl border bg-card shadow-sm",
                    "transition-shadow duration-300 hover:shadow-md motion-reduce:transition-none",
                    isPending
                      ? "border-primary/40 shadow-primary/10"
                      : "border-border/60",
                  )}
                >
                  {/* Status bar on the start edge (RTL-safe) */}
                  <span
                    aria-hidden
                    className={cn("absolute inset-y-0 start-0 w-1", style.accent)}
                  />

                  <div className="p-5 sm:p-6">
                    {/* Top row */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          dir="ltr"
                          className="inline-flex items-center rounded-lg border border-border/60 bg-background/70 px-2.5 py-1 font-mono text-xs tracking-widest text-foreground"
                        >
                          {b.reference}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                            style.badge,
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn("size-1.5 rounded-full", style.dot)}
                          />
                          {t(`status.${b.status}`)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("bookings.received", {
                          time: formatRelativeTime(b.createdAt, locale),
                        })}
                      </p>
                    </div>

                    {/* Body */}
                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                      {/* Guest */}
                      <div className="flex min-w-0 items-start gap-4">
                        <span
                          aria-hidden
                          className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 font-heading text-lg text-foreground ring-1 ring-primary/20"
                        >
                          {initial}
                        </span>
                        <div className="min-w-0 space-y-1.5">
                          <p className="font-heading text-lg leading-snug text-foreground">
                            {b.guestName}
                          </p>
                          <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <PhoneIcon aria-hidden className="size-3.5 shrink-0" />
                            <span dir="ltr">{b.guestPhone}</span>
                          </p>
                          {b.guestEmail && (
                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MailIcon aria-hidden className="size-3.5 shrink-0" />
                              <span dir="ltr" className="break-all">
                                {b.guestEmail}
                              </span>
                            </p>
                          )}
                          {b.guestCountry && (
                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                              <GlobeIcon aria-hidden className="size-3.5 shrink-0" />
                              {b.guestCountry}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stay */}
                      <dl className="overflow-hidden rounded-xl border border-border/50 bg-background/60 px-4 text-sm">
                        <div className="flex items-baseline justify-between gap-4 py-2.5">
                          <dt className="flex items-center gap-2 text-muted-foreground">
                            <BedDoubleIcon aria-hidden className="size-3.5" />
                            {t("bookings.room")}
                          </dt>
                          <dd className="text-end font-medium text-foreground">
                            {roomName}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-border/40 py-2.5">
                          <dt className="text-muted-foreground">{t("bookings.dates")}</dt>
                          <dd className="flex flex-wrap items-center justify-end gap-1.5 text-end text-foreground">
                            {formatDate(b.checkIn, locale)}
                            <ArrowRightIcon
                              aria-hidden
                              className="size-3.5 text-muted-foreground rtl:-scale-x-100"
                            />
                            {formatDate(b.checkOut, locale)}
                          </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-4 border-t border-border/40 py-2.5">
                          <dt className="text-muted-foreground">{t("bookings.nights")}</dt>
                          <dd className="text-foreground">{formatNumber(nights, locale)}</dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-4 border-t border-border/40 py-2.5">
                          <dt className="text-muted-foreground">{t("bookings.guests")}</dt>
                          <dd className="text-foreground">
                            {formatNumber(b.adults + b.children, locale)}
                          </dd>
                        </div>
                        <div className="-mx-4 flex items-baseline justify-between gap-4 border-t border-border/40 bg-primary/10 px-4 py-3">
                          <dt className="font-medium text-foreground">
                            {t("bookings.total")}
                          </dt>
                          <dd className="font-heading text-lg text-foreground">
                            {formatPrice(b.totalPriceCents, locale, tenant.currency)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Notes */}
                    {b.notes && (
                      <p className="mt-5 flex items-start gap-3 rounded-xl border border-border/50 bg-background/60 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                        <StickyNoteIcon
                          aria-hidden
                          className="mt-0.5 size-4 shrink-0 text-foreground"
                        />
                        <span>
                          <span className="font-medium text-foreground">
                            {t("bookings.notes")}:{" "}
                          </span>
                          {b.notes}
                        </span>
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-5 flex flex-col gap-3 border-t border-border/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/60 px-4 text-sm text-foreground",
                          "transition-colors duration-200 hover:border-primary/60 hover:bg-primary/5 motion-reduce:transition-none",
                          focusRing,
                        )}
                      >
                        <MessageCircleIcon aria-hidden className="size-4" />
                        {t("bookings.whatsapp")}
                      </a>
                      <BookingActions bookingId={b.id} status={b.status} />
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}