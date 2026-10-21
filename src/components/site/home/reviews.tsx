import { getTranslations, setRequestLocale } from "next-intl/server";

import { TESTIMONIALS } from "@/lib/constants";

/**
 * First three testimonials only. These are SAMPLE reviews (demo placeholders,
 * see constants.ts) — replace with real, permitted reviews before launch.
 * Avatars are intentionally omitted: the Unsplash host is not allow-listed in
 * next.config images.remotePatterns yet.
 */
export async function Reviews({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <h2 className="font-heading text-3xl text-ink md:text-4xl">
          {t("home.reviews.title")}
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.slice(0, 3).map((review) => (
            <blockquote
              key={review.key}
              className="flex flex-col rounded-xl border border-border/70 bg-sand/60 p-6"
            >
              <p className="text-sm leading-relaxed text-ink">
                {t(`${review.key}.text`)}
              </p>
              <footer className="mt-5 border-t border-border/60 pt-4">
                <p className="text-sm font-medium text-ink">{review.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t(`${review.key}.role`)}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
