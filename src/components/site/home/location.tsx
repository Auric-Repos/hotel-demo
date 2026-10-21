import { getTranslations, setRequestLocale } from "next-intl/server";
import { LandmarkIcon, MapPinIcon, PlaneIcon, TrainFrontIcon, WavesIcon } from "lucide-react";

import { SITE_CONFIG } from "@/lib/constants";

/**
 * Location card: address (when set), short distance notes from messages, and a
 * maps button only when SITE_CONFIG.mapsUrl is filled in. Distances are demo
 * placeholders. No embedded map by design.
 */
export async function Location({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  const distances = [
    { key: "airport", icon: PlaneIcon },
    { key: "train", icon: TrainFrontIcon },
    { key: "corniche", icon: WavesIcon },
    { key: "philae", icon: LandmarkIcon },
  ] as const;

  return (
    <section className="bg-sand">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid gap-10 rounded-xl border border-border/70 bg-white p-6 sm:p-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="font-heading text-3xl text-ink md:text-4xl">
              {t("home.location.title")}
            </h2>

            {SITE_CONFIG.address !== "" && (
              <p className="mt-4 flex items-start gap-2 text-sm text-ink">
                <MapPinIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>
                  <span className="sr-only">{t("home.location.addressLabel")}: </span>
                  {SITE_CONFIG.address}
                </span>
              </p>
            )}
          </div>

          <div>
            <ul className="space-y-3">
              {distances.map(({ key, icon: Icon }) => (
                <li
                  key={key}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span>{t(`home.location.${key}`)}</span>
                </li>
              ))}
            </ul>

            {SITE_CONFIG.mapsUrl !== "" && (
              <a
                href={SITE_CONFIG.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-md border border-charcoal px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-charcoal hover:text-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:transition-none"
              >
                {t("common.openMaps")}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
