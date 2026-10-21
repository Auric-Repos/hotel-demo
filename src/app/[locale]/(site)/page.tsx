import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SITE_CONFIG } from "@/lib/constants";
import { Hero } from "@/components/site/home/hero";
import { Highlights } from "@/components/site/home/highlights";
import { FeaturedRooms } from "@/components/site/home/featured-rooms";
import { ExperiencesTeaser } from "@/components/site/home/experiences-teaser";
import { Gallery } from "@/components/site/home/gallery";
import { HowItWorks } from "@/components/site/home/how-it-works";
import { Reviews } from "@/components/site/home/reviews";
import { Location } from "@/components/site/home/location";
import { FinalCta } from "@/components/site/home/final-cta";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home.meta" });

  return {
    title: t("title", { name: SITE_CONFIG.name }),
    description: t("description"),
    alternates: {
      languages: { en: "/en", ar: "/ar" },
    },
  };
}

/** Skeleton while the DB-backed room cards stream in. */
function RoomsSkeleton() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="h-9 w-56 animate-pulse rounded bg-muted/40 motion-reduce:animate-none" />
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-80 animate-pulse rounded-xl border border-border/40 bg-muted/20 motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Skeleton while the DB-backed experience cards stream in. */
function ExperiencesSkeleton() {
  return (
    <section className="bg-sand">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="h-9 w-64 animate-pulse rounded bg-muted/40 motion-reduce:animate-none" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-64 animate-pulse rounded-xl border border-border/40 bg-muted/20 motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero locale={locale} />
      <Highlights locale={locale} />
      <Suspense fallback={<RoomsSkeleton />}>
        <FeaturedRooms locale={locale} />
      </Suspense>
      <Suspense fallback={<ExperiencesSkeleton />}>
        <ExperiencesTeaser locale={locale} />
      </Suspense>
      <Gallery locale={locale} />
      <HowItWorks locale={locale} />
      <Reviews locale={locale} />
      <Location locale={locale} />
      <FinalCta locale={locale} />
    </>
  );
}
