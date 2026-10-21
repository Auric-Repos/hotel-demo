import { getTranslations, setRequestLocale } from "next-intl/server";

import { HOW_IT_WORKS_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/site/reveal";

/** Three booking steps; the WhatsApp step is emphasized with a charcoal card. */
export async function HowItWorks({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <section className="section-bento border-t border-border/40 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        {/* Header */}
        <Reveal className="max-w-2xl">
          <div aria-hidden className="mb-5 flex items-center gap-3">
            <span className="size-1.5 rotate-45 bg-primary" />
            <span className="h-px w-16 bg-linear-to-r from-primary/70 to-transparent rtl:bg-linear-to-l" />
          </div>
          <h2 className="font-heading text-3xl leading-tight text-balance text-foreground md:text-5xl">
            {t("home.steps.title")}
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, i) => {
            const Icon = step.icon;
            const featured = step.featured;

            return (
              <li key={step.stepKey} className="relative">
                <Reveal delay={i * 120} className="h-full">
                  <article
                    className={cn(
                      "group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 sm:p-8",
                      "transition-all duration-300 ease-out",
                      "hover:-translate-y-1 hover:shadow-xl",
                      "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                      featured
                        ? "border-gold/40 bg-charcoal text-sand shadow-lg hover:border-gold hover:shadow-primary/20"
                        : "border-border/60 bg-card text-foreground shadow-sm hover:border-primary/40 hover:shadow-primary/10",
                    )}
                  >
                    {/* Soft gold glow on the featured card */}
                    {featured && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -top-24 -end-24 size-64 rounded-full bg-primary/20 blur-3xl transition-opacity duration-500 group-hover:opacity-80 motion-reduce:transition-none"
                      />
                    )}

                    {/* Watermark number */}
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute end-5 top-3 font-heading text-7xl leading-none select-none",
                        "transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                        featured ? "text-gold/15" : "text-primary/10",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Icon + step label */}
                    <div className="relative flex items-center gap-4">
                      <span
                        className={cn(
                          "inline-flex size-12 shrink-0 items-center justify-center rounded-full border",
                          "transition-all duration-300 motion-reduce:transition-none",
                          featured
                            ? "border-gold/50 bg-gold/10 text-gold group-hover:bg-gold group-hover:text-ink"
                            : "border-border bg-background text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground",
                        )}
                      >
                        <Icon aria-hidden className="size-5" />
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold tracking-wide uppercase",
                          featured ? "text-gold" : "text-muted-foreground",
                        )}
                      >
                        {t(step.stepKey)}
                      </span>
                    </div>

                    <h3 className="relative mt-6 font-heading text-2xl leading-snug">
                      {t(step.titleKey)}
                    </h3>
                    <p
                      className={cn(
                        "relative mt-3 text-sm leading-relaxed text-pretty sm:text-base",
                        featured ? "text-sand/80" : "text-muted-foreground",
                      )}
                    >
                      {t(step.bodyKey)}
                    </p>
                  </article>
                </Reveal>

                {/* Connector to the next card (desktop only, sits in the grid gap, aligned to icon center) */}
                {i < HOW_IT_WORKS_STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-14 -end-6 hidden h-px w-6 bg-linear-to-r from-primary/60 to-primary/10 md:block rtl:bg-linear-to-l"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}