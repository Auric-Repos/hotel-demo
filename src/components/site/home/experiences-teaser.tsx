import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRightIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { EXPERIENCE_IMAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getCurrentTenant } from "@/lib/tenant";
import { listExperiences } from "@/server/queries/experiences";
import { ExperienceCard } from "@/components/site/home/experience-card";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * Bento placement on desktop (4 columns, fixed row height):
 *   4 items: [A A][B][C] / [A A][D D]
 *   3 items: [A A][B B] / [A A][C C]
 *   2 items: [A A][B B] (both tall)
 *   1 item:  [A A A A]
 */
function bentoClass(i: number, n: number) {
  if (n === 1) return "sm:col-span-2 lg:col-span-4 lg:row-span-2";
  if (n === 2) return "lg:col-span-2 lg:row-span-2";
  if (i === 0) {
    return n === 3
      ? "sm:col-span-2 lg:col-span-2 lg:row-span-2"
      : "lg:col-span-2 lg:row-span-2";
  }
  if (n === 3) return "lg:col-span-2";
  return i === 3 ? "lg:col-span-2" : "";
}

type Props = {
  locale: string;
  /** "home": first four in a bento layout. "page": all, in a uniform grid. */
  variant?: "home" | "page";
};

/** Renders inside a <Suspense> boundary because it reads the DB. */
export async function ExperiencesTeaser({ locale, variant = "home" }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const tenant = await getCurrentTenant();
  const all = await listExperiences(tenant.id);
  const isHome = variant === "home";
  const experiences = isHome ? all.slice(0, 4) : all;
  const count = experiences.length;

  function formatDuration(minutes: number) {
    if (minutes >= 60) {
      const hours =
        minutes % 60 === 0 ? minutes / 60 : Number((minutes / 60).toFixed(1));
      return t("home.experiences.duration.hours", { n: hours });
    }
    return t("home.experiences.duration.minutes", { n: minutes });
  }

  return (
    <section
      className={cn(
        "section-bento border-t border-border/40 bg-background",
        !isHome && "pt-28 sm:pt-32",
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div aria-hidden className="mb-5 flex items-center gap-3">
              <span className="size-1.5 rotate-45 bg-primary" />
              <span className="h-px w-16 bg-linear-to-r from-primary/70 to-transparent rtl:bg-linear-to-l" />
            </div>
            {isHome ? (
              <h2 className="font-heading text-3xl leading-tight text-balance text-foreground md:text-5xl">
                {t("home.experiences.title")}
              </h2>
            ) : (
              <h1 className="font-heading text-4xl leading-tight text-balance text-foreground md:text-6xl">
                {t("nav.experiences")}
              </h1>
            )}
            <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
              {t("home.experiences.subtitle")}
            </p>
          </div>

          {isHome && count > 0 && (
            <Link
              href="/experiences"
              className={cn(
                "group inline-flex shrink-0 items-center gap-2 self-start rounded-xl px-1 py-2",
                "text-sm font-semibold text-foreground md:self-auto",
                focusRing,
              )}
            >
              <span className="border-b border-primary/60 pb-0.5 transition-colors group-hover:border-foreground">
                {t("home.experiences.seeAll")}
              </span>
              <span className="inline-flex rtl:-scale-x-100" aria-hidden>
                <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
              </span>
            </Link>
          )}
        </div>

        {count === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/70 px-6 py-16 text-center backdrop-blur-sm">
            <p className="text-muted-foreground">{t("home.experiences.empty")}</p>
          </div>
        ) : (
          <div
            className={cn(
              "mt-12",
              isHome
                ? // Mobile: swipeable row. Desktop: bento.
                  "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:auto-rows-[260px] lg:gap-8"
                : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8",
            )}
          >
            {experiences.map((experience, i) => {
              const featured = isHome && (i === 0 || count <= 2);
              return (
                <ExperienceCard
                  key={experience.id}
                  // On the page, "/book" lets guests add it to a stay. Change
                  // this if you add experience detail pages.
                  href={isHome ? "/experiences" : "/book"}
                  name={locale === "ar" ? experience.nameAr : experience.nameEn}
                  image={experience.images[0] ?? EXPERIENCE_IMAGES[0].src}
                  durationLabel={formatDuration(experience.durationMinutes)}
                  priceLabel={`$${Math.round(experience.priceCents / 100)}`}
                  featured={featured}
                  className={cn(
                    "aspect-[4/5]",
                    isHome &&
                      cn(
                        "w-[80%] shrink-0 snap-start sm:w-auto sm:shrink sm:aspect-[4/3] lg:aspect-auto",
                        bentoClass(i, count),
                      ),
                  )}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/** Suspense fallback with the same layout, so nothing jumps when data loads. */
export function ExperiencesSkeleton({
  variant = "home",
}: {
  variant?: "home" | "page"; 
}) {
  return (
    <section
      aria-hidden
      className={cn(
        "section-bento border-t border-border/40 bg-background",
        variant === "page" && "pt-28 sm:pt-32",
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="max-w-2xl">
          <div className="h-1.5 w-20 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-10 w-72 max-w-full animate-pulse rounded-lg bg-muted md:h-12" />
          <div className="mt-4 h-5 w-full max-w-md animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-2xl bg-muted sm:aspect-[4/3]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}