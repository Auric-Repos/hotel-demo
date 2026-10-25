import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRightIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  NavigationIcon,
  PhoneIcon,
  type LucideIcon,
} from "lucide-react";

import { SITE_CONFIG } from "@/lib/constants";
import { getCurrentTenant } from "@/lib/tenant";
import { toWhatsAppDigits } from "@/lib/phone";
import { getTenantContact } from "@/server/queries/contact";
import { ContactForm } from "@/components/site/contact-form";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ locale: string }> };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });

  return {
    title: t("meta.title", { name: SITE_CONFIG.name }),
    description: t("meta.description"),
    alternates: { languages: { en: "/en/contact", ar: "/ar/contact" } },
  };
}

function Ornament() {
  return (
    <div aria-hidden className="mb-5 flex items-center justify-center gap-3">
      <span className="h-px w-12 bg-linear-to-r from-transparent to-primary/70" />
      <span className="size-1.5 rotate-45 bg-primary" />
      <span className="h-px w-12 bg-linear-to-l from-transparent to-primary/70" />
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  href,
  ltr,
  children,
}: {
  icon: LucideIcon;
  label: string;
  href?: string;
  ltr?: boolean;
  children: React.ReactNode;
}) {
  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/20 transition-all duration-300 motion-reduce:transition-none",
          href &&
            "group-hover:scale-110 group-hover:bg-primary group-hover:ring-primary motion-reduce:group-hover:scale-100",
        )}
      >
        <Icon
          className={cn(
            "size-4 text-foreground transition-colors duration-300",
            href && "group-hover:text-primary-foreground",
          )}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs uppercase tracking-[0.16em] text-muted-foreground rtl:tracking-normal">
          {label}
        </span>
        <span
          dir={ltr ? "ltr" : undefined}
          className={cn(
            "mt-1 block break-words text-sm text-foreground",
            ltr && "text-start",
          )}
        >
          {children}
        </span>
      </span>
      {href && (
        <ArrowRightIcon
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5 motion-reduce:transition-none"
        />
      )}
    </>
  );

  const base =
    "group relative flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm";

  if (!href) return <div className={base}>{inner}</div>;

  return (
    <a
      href={href}
      className={cn(
        base,
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        focusRing,
      )}
    >
      {inner}
    </a>
  );
}

async function ContactBody({ locale }: { locale: string }) {
  const t = await getTranslations("contact");
  const tenant = await getCurrentTenant();
  const c = await getTenantContact(tenant.id);

  if (!c) {
    return (
      <p className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center text-muted-foreground">
        {t("unavailable")}
      </p>
    );
  }

  const address = locale === "ar" ? c.addressAr : c.addressEn;
  const hours = locale === "ar" ? c.hoursAr : c.hoursEn;
  const whatsappDigits = c.whatsapp ? toWhatsAppDigits(c.whatsapp) : null;
  const telHref = c.phone ? `tel:${c.phone.replace(/[^\d+]/g, "")}` : null;

  const mapSrc = c.mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(c.mapQuery)}&output=embed&hl=${locale}`
    : null;
  const directionsHref = c.mapQuery
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.mapQuery)}`
    : null;

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Contact options */}
        <div
          className="animate-appear space-y-4 motion-reduce:animate-none"
          style={{ animationDelay: "100ms" }}
        >
          {whatsappDigits && (
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/30",
                "transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40 active:scale-[0.99]",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                focusRing,
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-1/3 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-[400%] rtl:translate-x-full rtl:group-hover:-translate-x-[400%] motion-reduce:hidden"
              />
              <span
                aria-hidden
                className="relative grid size-12 shrink-0 place-items-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/30"
              >
                <MessageCircleIcon className="size-5" />
              </span>
              <span className="relative min-w-0 flex-1">
                <span className="block font-heading text-xl">
                  {t("whatsapp.cta")}
                </span>
                <span dir="ltr" className="mt-0.5 block text-start text-sm opacity-80">
                  {c.whatsapp}
                </span>
              </span>
              <ArrowRightIcon
                aria-hidden
                className="relative size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1 motion-reduce:transition-none"
              />
            </a>
          )}

          {c.phone && telHref && (
            <Tile icon={PhoneIcon} label={t("call")} href={telHref} ltr>
              {c.phone}
            </Tile>
          )}
          {c.email && (
            <Tile icon={MailIcon} label={t("email")} href={`mailto:${c.email}`} ltr>
              {c.email}
            </Tile>
          )}
          {hours && (
            <Tile icon={ClockIcon} label={t("hours")}>
              {hours}
            </Tile>
          )}
          {address && (
            <Tile icon={MapPinIcon} label={t("address")}>
              {address}
            </Tile>
          )}
        </div>

        {/* Message form */}
        {whatsappDigits && (
          <section
            className="relative h-fit animate-appear overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm motion-reduce:animate-none sm:p-8"
            style={{ animationDelay: "180ms" }}
          >
            <span
              aria-hidden
              className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
            />
            <div className="mb-6 flex items-center gap-2.5">
              <span aria-hidden className="size-1.5 rotate-45 bg-primary" />
              <h2 className="font-heading text-xl text-ink">{t("form.title")}</h2>
            </div>
            <p className="-mt-3 mb-6 text-sm text-muted-foreground">
              {t("form.subtitle")}
            </p>
            <ContactForm whatsappDigits={whatsappDigits} hotelName={tenant.name} />
          </section>
        )}
      </div>

      {/* Map */}
      {mapSrc && directionsHref && (
        <section
          className="mt-14 animate-appear motion-reduce:animate-none"
          style={{ animationDelay: "260ms" }}
        >
          <div className="mb-6 flex items-center gap-2.5">
            <span aria-hidden className="size-1.5 rotate-45 bg-primary" />
            <h2 className="font-heading text-xl text-ink">{t("location.title")}</h2>
          </div>
          <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-secondary shadow-sm transition-shadow duration-500 hover:shadow-xl hover:shadow-primary/10 sm:aspect-[16/8] motion-reduce:transition-none">
            <iframe
              src={mapSrc}
              title={t("location.mapTitle")}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="size-full border-0 grayscale-[0.35] transition-[filter] duration-700 group-hover:grayscale-0 motion-reduce:transition-none"
            />
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "absolute bottom-4 start-4 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30",
                "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                focusRing,
              )}
            >
              <NavigationIcon aria-hidden className="size-4" />
              {t("location.directions")}
            </a>
          </div>
        </section>
      )}
    </>
  );
}

function ContactSkeleton() {
  return (
    <div aria-hidden className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 sm:px-12 md:py-24">
      <header className="mb-14 animate-appear text-center motion-reduce:animate-none">
        <Ornament />
        <h1 className="font-heading text-3xl tracking-tight text-ink md:text-5xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
          {t("subtitle")}
        </p>
      </header>

      <Suspense fallback={<ContactSkeleton />}>
        <ContactBody locale={locale} />
      </Suspense>
    </main>
  );
}