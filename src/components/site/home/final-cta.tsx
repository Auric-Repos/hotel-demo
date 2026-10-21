import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRightIcon, MessageCircleIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Reveal } from "@/components/site/reveal";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

/** Closing call to action: booking request plus the WhatsApp handoff. */
export async function FinalCta({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const whatsappHref = getWhatsAppUrl(
    t("whatsapp.prefill", { hotel: SITE_CONFIG.name }),
  );

  return (
    <section className="relative isolate overflow-hidden border-t border-gold/30 bg-charcoal text-sand">
      {/* Background: drifting gold glows (reuse the hero aurora keyframes) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 start-[8%] size-[28rem] animate-aurora-a rounded-full bg-gold/20 blur-3xl motion-reduce:animate-none" />
        <div className="absolute -bottom-48 end-[6%] size-[30rem] animate-aurora-b rounded-full bg-aurora-sand/10 blur-3xl motion-reduce:animate-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,color-mix(in_oklab,var(--gold)_14%,transparent),transparent_75%)]" />
        {/* Gold hairline along the top edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold/70 to-transparent" />
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6 md:py-32">
        <Reveal className="flex flex-col items-center">
          {/* Centered ornament */}
          <div aria-hidden className="mb-6 flex items-center gap-3">
            <span className="h-px w-12 bg-linear-to-l from-gold/70 to-transparent" />
            <span className="size-1.5 rotate-45 bg-gold" />
            <span className="h-px w-12 bg-linear-to-r from-gold/70 to-transparent" />
          </div>

          <h2 className="font-heading text-3xl leading-tight text-balance md:text-5xl">
            {t("home.cta.title")}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-sand/80 md:text-lg">
            {t("home.cta.body")}
          </p>
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/book"
              className={cn(
                "btn-shine group inline-flex items-center justify-center gap-2 rounded-xl",
                "bg-gold px-7 py-3.5 text-sm font-semibold text-charcoal shadow-lg shadow-gold/20",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold/30",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                focusRing,
              )}
            >
              {t("home.cta.request")}
              <span className="inline-flex rtl:-scale-x-100" aria-hidden>
                <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
              </span>
            </Link>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group inline-flex items-center justify-center gap-2 rounded-xl",
                "border border-sand/20 bg-sand/5 px-7 py-3.5 text-sm font-medium text-sand backdrop-blur-md",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-0.5 hover:border-gold/60 hover:bg-gold/10 hover:text-gold",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                focusRing,
              )}
            >
              <MessageCircleIcon
                aria-hidden
                className="size-4 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              {t("whatsapp.label")}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}