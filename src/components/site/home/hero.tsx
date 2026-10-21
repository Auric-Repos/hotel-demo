import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRightIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { HIGHLIGHTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AvailabilityBar } from "@/components/site/home/availability-bar";
import { HeroAurora } from "@/components/site/home/hero-aurora";

const appear = "animate-appear motion-reduce:animate-none";
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const ctaBase = cn(
  "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-8",
  "text-base font-semibold sm:w-auto",
  "transition-all duration-300 ease-out",
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  focusRing,
);

/**
 * Image-free hero. Typography, token-based decoration and the availability
 * form carry the look; nothing here depends on photos or video.
 */
export async function Hero({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const isAr = locale === "ar";

  return (
    <section className="relative isolate flex min-h-[88svh] flex-col justify-center overflow-hidden bg-background pt-28 pb-24 text-foreground sm:min-h-svh sm:pt-32">
      {/* Animated liquid aurora behind the content. */}
      <HeroAurora />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col px-4 text-center sm:px-6 lg:px-8">
        {/* Eyebrow pill */}
        <div
          className={cn(
            appear,
            "inline-flex items-center gap-2.5 self-center rounded-full border border-primary/30",
            "bg-card/60 px-4 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-md sm:text-sm",
            isAr ? "tracking-normal" : "tracking-[0.18em] uppercase",
          )}
          style={delay(0)}
        >
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          {t("common.brandTagline")}
        </div>

        {/* Title */}
        <h1
          className={cn(
            appear,
            "mt-8 font-heading text-balance",
            isAr
              ? "text-5xl leading-[1.3] sm:text-6xl lg:text-7xl"
              : "text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl",
          )}
          style={delay(100)}
        >
          {t("home.hero.title")}
        </h1>

        {/* Ornament: line, diamond, line (symmetric, so no RTL flip needed) */}
        <div
          aria-hidden
          className={cn(appear, "mt-8 flex items-center justify-center gap-3")}
          style={delay(180)}
        >
          <span className="h-px w-14 bg-linear-to-r from-transparent via-primary/70 to-transparent" />
          <span className="size-1.5 rotate-45 bg-primary" />
          <span className="h-px w-14 bg-linear-to-r from-transparent via-primary/70 to-transparent" />
        </div>

        {/* Subtitle */}
        <p
          className={cn(
            appear,
            "mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl",
          )}
          style={delay(260)}
        >
          {t("home.hero.subtitle")}
        </p>

        {/* CTAs */}
        <div
          className={cn(
            appear,
            "mt-10 flex w-full flex-col justify-center gap-3 sm:flex-row sm:gap-4",
          )}
          style={delay(360)}
        >
          <Link
            href="/book"
            className={cn(
              ctaBase,
              "btn-shine bg-primary text-primary-foreground shadow-md",
              "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30",
              "active:translate-y-0 active:scale-[0.98]",
            )}
          >
            <span>{t("nav.bookNow")}</span>
            {/* The wrapper flips in RTL, so the slide direction flips with it. */}
            <span className="inline-flex rtl:-scale-x-100" aria-hidden>
              <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
            </span>
          </Link>

          <Link
            href="/rooms"
            className={cn(
              ctaBase,
              "border border-border bg-card/60 text-foreground backdrop-blur-md",
              "hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card hover:shadow-lg hover:shadow-primary/10",
              "active:translate-y-0 active:scale-[0.98]",
            )}
          >
            {t("nav.rooms")}
          </Link>
        </div>

        {/* Availability */}
        <div className={cn(appear, "mx-auto mt-10 w-full max-w-3xl")} style={delay(460)}>
          <AvailabilityBar />
        </div>

        {/* Highlights */}
        <ul
          className={cn(
            appear,
            "mt-14 grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4",
          )}
          style={delay(560)}
        >
          {HIGHLIGHTS.map(({ key, icon: Icon }) => (
            <li
              key={key}
              className={cn(
                "group flex cursor-default flex-col items-center gap-3 rounded-2xl",
                "border border-border/60 bg-card/50 px-3 py-5 backdrop-blur-md",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1 hover:border-primary/40 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              )}
            >
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-full",
                  "bg-secondary text-secondary-foreground ring-1 ring-border",
                  "transition-all duration-300",
                  "group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary/30",
                  "motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                )}
              >
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                {t(key)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Scroll cue (desktop). left-1/2 is symmetric, so it needs no RTL flip. */}
      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm:block"
      >
        <div className="flex h-9 w-[22px] justify-center rounded-full border border-muted-foreground/40 pt-2">
          <span className="h-1.5 w-0.5 animate-hero-scroll rounded-full bg-primary motion-reduce:animate-none" />
        </div>
      </div>

      {/* Bottom hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
      />
    </section>
  );
}