import { getTranslations, setRequestLocale } from "next-intl/server";

import { GALLERY_IMAGES, GALLERY_STATS } from "@/lib/constants";
import { Photo } from "@/components/site/photo";

/**
 * Photo strip + stats. NOTE: the numbers in GALLERY_STATS are demo placeholders
 * (see constants.ts) — replace them with the hotel's real figures before launch.
 */
export async function Gallery({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <section className="bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[2fr_1fr] lg:items-center lg:gap-16 lg:px-8">
        <div className="grid grid-cols-2 gap-4">
          {GALLERY_IMAGES.map((image) => (
            <div
              key={image.src}
              className="relative aspect-square overflow-hidden rounded-lg bg-gold-soft"
            >
              <Photo
                src={image.src}
                alt={t(image.key)}
                fill
                sizes="(min-width: 1024px) 30vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <ul className="grid gap-8 sm:grid-cols-3 lg:grid-cols-1">
          {GALLERY_STATS.map((stat) => (
            <li key={stat.key}>
              <p className="font-heading text-4xl text-ink">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t(stat.key)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
