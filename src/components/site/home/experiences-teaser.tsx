import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRightIcon, ClockIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { GALLERY_IMAGES } from "@/lib/constants";
import { getCurrentTenant } from "@/lib/tenant";
import { listExperiences } from "@/server/queries/experiences";
import { Photo } from "@/components/site/photo";

/** Four teasers; renders inside a <Suspense> boundary because it reads the DB. */
export async function ExperiencesTeaser({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const tenant = await getCurrentTenant();
  const experiences = (await listExperiences(tenant.id)).slice(0, 4);

  function formatDuration(minutes: number) {
    if (minutes >= 60) {
      const hours = minutes % 60 === 0 ? minutes / 60 : Number((minutes / 60).toFixed(1));
      return t("home.experiences.duration.hours", { n: hours });
    }
    return t("home.experiences.duration.minutes", { n: minutes });
  }

  return (
    <section className="bg-sand">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-heading text-3xl text-ink md:text-4xl">
            {t("home.experiences.title")}
          </h2>
          <Link
            href="/experiences"
            className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            {t("home.experiences.seeAll")}
            <ArrowRightIcon aria-hidden className="size-4 rtl:rotate-180" />
          </Link>
        </div>

        {experiences.length === 0 ? (
          <p className="mt-6 text-muted-foreground">{t("home.experiences.empty")}</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {experiences.map((experience) => {
              const name = locale === "ar" ? experience.nameAr : experience.nameEn;
              const price = `$${Math.round(experience.priceCents / 100)}`;

              return (
                <Link
                  key={experience.id}
                  href="/experiences"
                  className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-white transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:transition-none"
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-gold-soft">
                    <Photo
                      src={experience.images[0] ?? GALLERY_IMAGES[0].src}
                      alt={name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-heading text-xl text-ink">{name}</h3>
                    <p className="mt-auto flex items-center gap-2 pt-4 text-sm text-muted-foreground">
                      <span className="text-ink">{price}</span>
                      <span aria-hidden>·</span>
                      <ClockIcon aria-hidden className="size-4" />
                      <span>{formatDuration(experience.durationMinutes)}</span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
