import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowUpRightIcon,
  LandmarkIcon,
  MapPinIcon,
  PlaneIcon,
  TrainFrontIcon,
  WavesIcon,
} from "lucide-react";

import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/site/reveal";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

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
    <section className="section-bento border-t border-border/40 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal>
          <div className="glass-surface relative overflow-hidden rounded-3xl p-6 sm:p-10 lg:p-14">
            {/* Soft gold glow in the corner */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 -end-32 size-80 rounded-full bg-primary/15 blur-3xl"
            />

            <div className="relative grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
              {/* Left: title, address, maps button */}
              <div>
                <div aria-hidden className="mb-5 flex items-center gap-3">
                  <span className="size-1.5 rotate-45 bg-primary" />
                  <span className="h-px w-16 bg-linear-to-r from-primary/70 to-transparent rtl:bg-linear-to-l" />
                </div>

                <h2 className="font-heading text-3xl leading-tight text-balance text-foreground md:text-5xl">
                  {t("home.location.title")}
                </h2>

                {SITE_CONFIG.address !== "" && (
                  <p className="mt-6 flex items-start gap-3 text-base leading-relaxed text-foreground">
                    <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                      <MapPinIcon aria-hidden className="size-4" />
                    </span>
                    <span className="pt-1.5">
                      <span className="sr-only">{t("home.location.addressLabel")}: </span>
                      {SITE_CONFIG.address}
                    </span>
                  </p>
                )}

                {SITE_CONFIG.mapsUrl !== "" && (
                  <a
                    href={SITE_CONFIG.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "btn-shine group mt-8 inline-flex items-center justify-center gap-2 rounded-xl",
                      "bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm",
                      "transition-all duration-300 ease-out",
                      "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25",
                      "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                      focusRing,
                    )}
                  >
                    {t("common.openMaps")}
                    <span className="inline-flex rtl:-scale-x-100" aria-hidden>
                      <ArrowUpRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" />
                    </span>
                  </a>
                )}
              </div>

              {/* Right: distances */}
              <ul className="grid gap-3">
                {distances.map(({ key, icon: Icon }, i) => (
                  <li key={key}>
                    <Reveal delay={150 + i * 100}>
                      <div
                        className={cn(
                          "group flex items-center gap-4 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm",
                          "transition-all duration-300 ease-out",
                          "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
                          "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex size-11 shrink-0 items-center justify-center rounded-full",
                            "border border-border bg-background text-primary",
                            "transition-all duration-300 motion-reduce:transition-none",
                            "group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground",
                          )}
                        >
                          <Icon aria-hidden className="size-5" />
                        </span>
                        <span className="text-sm leading-relaxed text-pretty text-foreground sm:text-base">
                          {t(`home.location.${key}`)}
                        </span>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}