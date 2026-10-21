import { getTranslations, setRequestLocale } from "next-intl/server";

import { TESTIMONIALS } from "@/lib/constants";
import { Reveal } from "@/components/site/reveal";
import { ReviewCard, ReviewsMarquee } from "@/components/site/reviews-marquee";

/**
 * SAMPLE reviews (demo placeholders, see constants.ts): replace with real,
 * permitted reviews before launch. Avatars are rendered as initials; no images.
 */
export async function Reviews({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  // Only testimonials that have translations; resolved on the server.
  const reviews = TESTIMONIALS.filter(
    (r) => t.has(`${r.key}.text`) && t.has(`${r.key}.role`),
  ).map((r) => ({
    id: r.key,
    name: r.name,
    role: t(`${r.key}.role`),
    text: t(`${r.key}.text`),
  }));

  if (reviews.length === 0) return null;

  const hasSubtitle = t.has("home.reviews.subtitle");

  return (
    <section className="section-bento border-t border-border/40 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal className="max-w-2xl">
          <div aria-hidden className="mb-5 flex items-center gap-3">
            <span className="size-1.5 rotate-45 bg-primary" />
            <span className="h-px w-16 bg-linear-to-r from-primary/70 to-transparent rtl:bg-linear-to-l" />
          </div>
          <h2 className="font-heading text-3xl leading-tight text-balance text-foreground md:text-5xl">
            {t("home.reviews.title")}
          </h2>
          {hasSubtitle && (
            <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
              {t("home.reviews.subtitle")}
            </p>
          )}
        </Reveal>

        {reviews.length <= 3 ? (
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {reviews.map((review, i) => (
              <li key={review.id}>
                <Reveal delay={i * 120} className="h-full">
                  <ReviewCard review={review} className="h-full" />
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <ReviewsMarquee reviews={reviews} />
        )}
      </div>
    </section>
  );
}