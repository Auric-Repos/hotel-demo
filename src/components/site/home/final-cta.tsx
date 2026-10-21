import { getTranslations, setRequestLocale } from "next-intl/server";
import { MessageCircleIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { SITE_CONFIG } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/whatsapp";

/** Closing call to action: booking request plus the WhatsApp handoff. */
export async function FinalCta({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const whatsappHref = getWhatsAppUrl(
    t("whatsapp.prefill", { hotel: SITE_CONFIG.name }),
  );

  return (
    <section className="border-t border-gold/30 bg-charcoal text-sand">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-16 text-center sm:px-6 md:py-24">
        <h2 className="font-heading text-3xl md:text-4xl">
          {t("home.cta.title")}
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-sand/80 md:text-base">
          {t("home.cta.body")}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/book"
            className="inline-flex items-center justify-center rounded-md bg-gold px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-gold/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:transition-none"
          >
            {t("home.cta.request")}
          </Link>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-sand underline-offset-4 hover:text-gold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:transition-none"
          >
            <MessageCircleIcon aria-hidden className="size-4" />
            {t("whatsapp.label")}
          </a>
        </div>
      </div>
    </section>
  );
}
