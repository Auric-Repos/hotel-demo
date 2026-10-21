import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRightIcon, MailIcon, MapPinIcon, MessageCircleIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { FOOTER_QUICK_LINKS, SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

const contactLink = cn(
  "group inline-flex items-start gap-3 text-sm text-sand/85",
  "transition-colors duration-200 hover:text-gold motion-reduce:transition-none",
  focusRing,
);

const iconBox = cn(
  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
  "border border-sand/15 bg-sand/5 text-gold",
  "transition-colors duration-200 group-hover:border-gold/50 group-hover:bg-gold/10",
);

const socialButton = cn(
  "inline-flex size-10 items-center justify-center rounded-full",
  "border border-sand/20 bg-sand/5 text-sand backdrop-blur-sm",
  "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground",
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  focusRing,
);

/** Brand icons as inline SVG, so they survive Lucide upgrades. */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/**
 * Hotel footer: CTA band, brand + socials, quick links and a contact block.
 * The Google Maps link and each social link render only when the matching
 * SITE_CONFIG value is non-empty, so the footer never shows dead links.
 * Server Component on purpose: no client interactivity here.
 */
export async function SiteFooter({ locale }: { locale: string }) {
  // Must run before getTranslations in this component's own scope (see layout).
  setRequestLocale(locale);
  const t = await getTranslations();
  const whatsappHref = getWhatsAppUrl(
    t("whatsapp.prefill", { hotel: SITE_CONFIG.name }),
  );
  const hasSocials =
    SITE_CONFIG.facebookUrl !== "" || SITE_CONFIG.instagramUrl !== "";

  return (
    <footer className="section-bento section-bento-dark border-t border-gold/30 bg-charcoal text-sand">
      <div className="mx-auto w-full max-w-7xl px-4 pt-16 pb-8 sm:px-6 md:pt-20 lg:px-8">
        {/* CTA band */}
        <div
          className={cn(
            "flex flex-col gap-8 rounded-3xl border border-sand/15 bg-sand/5 p-8 backdrop-blur-md",
            "md:flex-row md:items-center md:justify-between md:p-12",
          )}
        >
          <div className="max-w-xl">
            <p className="font-heading text-3xl leading-tight text-balance text-sand md:text-4xl">
              {t("home.cta.title")}
            </p>
            <p className="mt-3 leading-relaxed text-pretty text-sand/70">
              {t("home.cta.body")}
            </p>
          </div>

          <Link
            href="/book"
            className={cn(
              "btn-shine group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-8",
              "bg-primary text-base font-semibold text-primary-foreground shadow-md",
              "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30",
              "active:translate-y-0 active:scale-[0.98]",
              "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              focusRing,
            )}
          >
            <span>{t("home.cta.request")}</span>
            <span className="inline-flex rtl:-scale-x-100" aria-hidden>
              <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
            </span>
          </Link>
        </div>

        {/* Columns */}
        <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <div aria-hidden className="mb-5 flex items-center gap-3">
              <span className="size-1.5 rotate-45 bg-gold" />
              <span className="h-px w-16 bg-linear-to-r from-gold/70 to-transparent rtl:bg-linear-to-l" />
            </div>
            <p className="font-heading text-3xl text-sand">{SITE_CONFIG.name}</p>
            <p className="mt-3 max-w-sm leading-relaxed text-sand/70">
              {t("common.brandTagline")}
            </p>

            {hasSocials && (
              <ul className="mt-6 flex gap-3">
                {SITE_CONFIG.facebookUrl !== "" && (
                  <li>
                    <a
                      href={SITE_CONFIG.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("footer.facebook")}
                      className={socialButton}
                    >
                      <FacebookIcon className="size-4" />
                    </a>
                  </li>
                )}
                {SITE_CONFIG.instagramUrl !== "" && (
                  <li>
                    <a
                      href={SITE_CONFIG.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("footer.instagram")}
                      className={socialButton}
                    >
                      <InstagramIcon className="size-4" />
                    </a>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Quick links */}
          <nav aria-label={t("footer.quickLinks")} className="lg:col-span-3">
            <h2 className="text-sm font-semibold tracking-wide text-gold">
              {t("footer.quickLinks")}
            </h2>
            <ul className="mt-5 space-y-3">
              {FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "group inline-flex items-center gap-2 text-sm text-sand/80",
                      "transition-colors duration-200 hover:text-gold motion-reduce:transition-none",
                      focusRing,
                    )}
                  >
                    <span
                      aria-hidden
                      className="h-px w-0 bg-gold transition-all duration-300 group-hover:w-4 motion-reduce:transition-none"
                    />
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h2 className="text-sm font-semibold tracking-wide text-gold">
              {t("footer.contact")}
            </h2>
            <ul className="mt-5 space-y-4">
              <li>
                <a href={`mailto:${SITE_CONFIG.email}`} className={contactLink}>
                  <span className={iconBox}>
                    <MailIcon aria-hidden className="size-4" />
                  </span>
                  <span className="pt-1 break-all">{SITE_CONFIG.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("whatsapp.label")}
                  className={contactLink}
                >
                  <span className={iconBox}>
                    <MessageCircleIcon aria-hidden className="size-4" />
                  </span>
                  {/* Phone numbers stay left-to-right, even in Arabic. */}
                  <span dir="ltr" className="inline-block pt-1 text-start">
                    +{SITE_CONFIG.whatsappNumber}
                  </span>
                </a>
              </li>
              {SITE_CONFIG.address !== "" && (
                <li className="flex items-start gap-3 text-sm text-sand/70">
                  <span className={cn(iconBox, "group-hover:border-sand/15")}>
                    <MapPinIcon aria-hidden className="size-4" />
                  </span>
                  <span className="pt-1 leading-relaxed">{SITE_CONFIG.address}</span>
                </li>
              )}
              {SITE_CONFIG.mapsUrl !== "" && (
                <li className="ps-11">
                  <a
                    href={SITE_CONFIG.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group inline-flex items-center gap-2 text-sm font-medium text-gold",
                      "transition-colors duration-200 hover:text-sand motion-reduce:transition-none",
                      focusRing,
                    )}
                  >
                    <span className="border-b border-gold/50 pb-0.5 transition-colors group-hover:border-sand">
                      {t("common.openMaps")}
                    </span>
                    <span className="inline-flex rtl:-scale-x-100" aria-hidden>
                      <ArrowRightIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
                    </span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 border-t border-sand/10 pt-6 text-center md:text-start">
          <p className="text-xs text-sand/50">
            {t("footer.copyright", { brand: SITE_CONFIG.name })}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;