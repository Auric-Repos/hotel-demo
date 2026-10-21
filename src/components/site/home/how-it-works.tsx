import { getTranslations, setRequestLocale } from "next-intl/server";

import { HOW_IT_WORKS_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Three booking steps; the WhatsApp step is emphasized with a charcoal card. */
export async function HowItWorks({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <section className="bg-sand">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <h2 className="font-heading text-3xl text-ink md:text-4xl">
          {t("home.steps.title")}
        </h2>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step) => {
            const Icon = step.icon;

            return (
              <li
                key={step.stepKey}
                className={cn(
                  "flex flex-col rounded-xl border p-6",
                  step.featured
                    ? "border-gold/40 bg-charcoal text-sand"
                    : "border-border/70 bg-white text-ink",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium",
                    step.featured ? "text-gold" : "text-muted-foreground",
                  )}
                >
                  {t(step.stepKey)}
                </span>
                <Icon aria-hidden className="mt-4 size-6 text-gold" />
                <h3 className="mt-3 font-heading text-xl">{t(step.titleKey)}</h3>
                <p
                  className={cn(
                    "mt-2 text-sm leading-relaxed",
                    step.featured ? "text-sand/80" : "text-muted-foreground",
                  )}
                >
                  {t(step.bodyKey)}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
