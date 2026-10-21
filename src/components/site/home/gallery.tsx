import { getTranslations, setRequestLocale } from "next-intl/server";

import { GALLERY_IMAGES, GALLERY_STATS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Photo } from "@/components/site/photo";
import { Reveal } from "@/components/site/reveal";

/**
 * Photo mosaic + stats. NOTE: the numbers in GALLERY_STATS are demo placeholders
 * (see constants.ts) — replace them with the hotel's real figures before launch.
 */
export async function Gallery({ locale }: { locale: string }) {
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
            {t("home.gallery.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            {t("home.gallery.subtitle")}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[2fr_1fr] lg:items-center lg:gap-16">
          {/* Staggered mosaic: second column sits lower, tall/square ratios alternate */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {GALLERY_IMAGES.map((image, i) => {
              const tall = i % 4 === 0 || i % 4 === 3;
              const lowered = i % 2 === 1;

              return (
                <Reveal
                  key={image.src}
                  delay={(i % 2) * 120}
                  className={cn(lowered && "mt-6 sm:mt-10")}
                >
                  <figure
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border border-border/60 bg-secondary shadow-sm",
                      "transition-all duration-300 ease-out",
                      "hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10",
                      "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                      tall ? "aspect-[4/5]" : "aspect-square",
                    )}
                  >
                    <Photo
                      src={image.src}
                      alt={t(image.key)}
                      fill
                      sizes="(min-width: 1024px) 30vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />

                    {/* Gradient + caption */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
                    />
                    <figcaption
                      className={cn(
                        "absolute inset-x-0 bottom-0 flex items-center gap-2 p-4 text-sm font-medium text-white",
                        "translate-y-2 opacity-0 transition-all duration-500 ease-out",
                        "group-hover:translate-y-0 group-hover:opacity-100",
                        "group-focus-within:translate-y-0 group-focus-within:opacity-100",
                        "motion-reduce:translate-y-0 motion-reduce:transition-none",
                      )}
                    >
                      <span aria-hidden className="size-1.5 shrink-0 rotate-45 bg-primary" />
                      {t(image.key)}
                    </figcaption>

                    {/* Gold corner accent */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute end-3 top-3 size-6 rounded-ss-none border-e border-t border-white/0 transition-colors duration-500 group-hover:border-primary/80 rtl:-scale-x-100"
                    />
                  </figure>
                </Reveal>
              );
            })}
          </div>

          {/* Stats */}
          <Reveal delay={200}>
            <div className="glass-surface rounded-2xl p-6 sm:p-8">
              <div aria-hidden className="mb-6 flex items-center gap-3">
                <span className="size-1.5 rotate-45 bg-primary" />
                <span className="h-px flex-1 bg-linear-to-r from-primary/60 to-transparent rtl:bg-linear-to-l" />
              </div>
              <ul className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-border/60">
                {GALLERY_STATS.map((stat) => (
                  <li key={stat.key} className="lg:py-6 lg:first:pt-0 lg:last:pb-0">
                    <p className="font-heading text-5xl leading-none text-foreground">
                      <span className="bg-linear-to-b from-gold to-primary bg-clip-text text-transparent">
                        {stat.value}
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{t(stat.key)}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}