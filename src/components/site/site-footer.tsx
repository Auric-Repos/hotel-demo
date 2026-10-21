import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { FOOTER_QUICK_LINKS, SITE_CONFIG } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/whatsapp";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";
const linkClass = `text-sm text-sand/80 hover:text-gold transition-colors motion-reduce:transition-none ${focusRing}`;
const strongLinkClass = `text-sand hover:text-gold transition-colors motion-reduce:transition-none ${focusRing}`;

/**
 * Hotel footer: brand + tagline, quick links, and a contact block.
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

  return (
    <footer className="border-t border-gold/30 bg-charcoal text-sand">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {/* Brand */}
        <div>
          <p className="font-heading text-2xl text-sand">{SITE_CONFIG.name}</p>
          <p className="mt-2 text-sm text-sand/70">{t("common.brandTagline")}</p>
          <p className="mt-6 text-xs text-sand/50">
            {t("footer.copyright", { brand: SITE_CONFIG.name })}
          </p>
        </div>

        {/* Quick links */}
        <nav aria-label={t("footer.quickLinks")}>
          <h2 className="text-sm font-medium text-gold">
            {t("footer.quickLinks")}
          </h2>
          <ul className="mt-4 space-y-2">
            {FOOTER_QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className="text-sm font-medium text-gold">{t("footer.contact")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${SITE_CONFIG.email}`} className={strongLinkClass}>
                {SITE_CONFIG.email}
              </a>
            </li>
            <li>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("whatsapp.label")}
                className={strongLinkClass}
              >
                +{SITE_CONFIG.whatsappNumber}
              </a>
            </li>
            {SITE_CONFIG.address !== "" && (
              <li className="text-sand/70">{SITE_CONFIG.address}</li>
            )}
            {SITE_CONFIG.mapsUrl !== "" && (
              <li>
                <a
                  href={SITE_CONFIG.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {t("common.openMaps")}
                </a>
              </li>
            )}
          </ul>

          {(SITE_CONFIG.facebookUrl !== "" || SITE_CONFIG.instagramUrl !== "") && (
            <ul className="mt-4 flex flex-wrap gap-4">
              {SITE_CONFIG.facebookUrl !== "" && (
                <li>
                  <a
                    href={SITE_CONFIG.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {t("footer.facebook")}
                  </a>
                </li>
              )}
              {SITE_CONFIG.instagramUrl !== "" && (
                <li>
                  <a
                    href={SITE_CONFIG.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {t("footer.instagram")}
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
