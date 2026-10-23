import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2Icon, MessageCircleIcon, SearchXIcon } from "lucide-react";

import { getCurrentTenant } from "@/lib/tenant";
import { getBookingByReference } from "@/server/queries/bookings";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

// A private page: it must never appear in search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string | string[] }>;
};

const formatDate = (iso: string, locale: string): string =>
  new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));

const formatNumber = (n: number, locale: string): string =>
  new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(n);

const buttonClass = cn(
  "btn-shine inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md",
  "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto",
);

export default function ConfirmationPage(props: Props) {
  return (
    // Match the wrapper classes used in book/page.tsx if they differ.
    <section className="mx-auto w-full max-w-2xl px-4 py-14 sm:py-20">
      <Suspense fallback={<ConfirmationSkeleton />}>
        <ConfirmationContent {...props} />
      </Suspense>
    </section>
  );
}

function ConfirmationSkeleton() {
  return (
    <div
      aria-hidden
      className="h-[28rem] animate-pulse rounded-3xl border border-border/60 bg-card/60"
    />
  );
}

async function ConfirmationContent({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { ref } = await searchParams;
  const reference = Array.isArray(ref) ? ref[0] : ref;

  const t = await getTranslations("book");

  const booking = reference
    ? await getBookingByReference((await getCurrentTenant()).id, reference)
    : null;

  /* Unknown or missing reference: a calm page, not an error. */
  if (!booking) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/70 p-8 text-center shadow-sm sm:p-10">
        <SearchXIcon aria-hidden className="mx-auto size-10 text-primary" />
        <h1 className="mt-5 font-heading text-2xl text-ink">
          {t("confirmation.notFound.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("confirmation.notFound.body")}
        </p>
        <Link href={`/${locale}/book`} className={cn(buttonClass, "mt-7")}>
          {t("confirmation.notFound.cta")}
        </Link>
      </div>
    );
  }

  const roomName = locale === "ar" ? booking.roomNameAr : booking.roomNameEn;
  const whatsappUrl = getWhatsAppUrl(
    t("success.whatsappMessage", { reference: booking.reference }),
  );

  const rows: { label: string; value: string }[] = [
    { label: t("summary.room"), value: roomName },
    { label: t("stay.checkIn"), value: formatDate(booking.checkIn, locale) },
    { label: t("stay.checkOut"), value: formatDate(booking.checkOut, locale) },
    { label: t("summary.nights"), value: formatNumber(booking.nights, locale) },
    { label: t("summary.guests"), value: formatNumber(booking.guests, locale) },
  ];

  const steps = [
    t("confirmation.next.step1"),
    t("confirmation.next.step2"),
    t("confirmation.next.step3"),
  ];

  return (
    <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm sm:p-10">
      <div className="text-center">
        <CheckCircle2Icon aria-hidden className="mx-auto size-11 text-primary" />
        <h1 className="mt-5 font-heading text-3xl text-ink">
          {t("confirmation.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("confirmation.greeting", { name: booking.firstName })}
        </p>

        <div className="mt-6 inline-flex flex-col items-center rounded-2xl border border-primary/30 bg-primary/5 px-6 py-3">
          <span className="text-xs text-muted-foreground">
            {t("confirmation.reference")}
          </span>
          {/* Latin letters and a hyphen: keep LTR so RTL doesn't reorder it. */}
          <span dir="ltr" className="font-heading text-xl tracking-widest text-ink">
            {booking.reference}
          </span>
        </div>
      </div>

      <dl className="mt-8 divide-y divide-border/40 rounded-2xl border border-border/60 bg-background/60 px-5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="text-end text-sm text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex justify-center">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          <MessageCircleIcon aria-hidden className="size-4" />
          {t("success.whatsapp")}
        </a>
      </div>

      <div className="mt-10 border-t border-border/40 pt-8">
        <h2 className="font-heading text-lg text-ink">{t("confirmation.next.title")}</h2>
        <ol className="mt-4 space-y-4">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold text-primary">
                {formatNumber(i + 1, locale)}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed text-muted-foreground">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}