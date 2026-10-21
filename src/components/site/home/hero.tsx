import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { HIGHLIGHTS } from "@/lib/constants";
import { AvailabilityBar } from "@/components/site/home/availability-bar";
import { ChevronDownIcon } from "lucide-react";

/**
 * Image-free hero. Typography, token-based decoration and the availability
 * form carry the look; nothing here depends on photos or video.
 */
export async function Hero({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const isAr = locale === "ar";

  return (
    <section className="relative isolate overflow-hidden flex flex-col justify-center bg-background text-foreground min-h-[88svh] sm:min-h-[100svh] pt-28 sm:pt-32 pb-24">
      {/* Token-only decoration: gold glow, Nubian pattern, divider. Behind content. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-hero-decoration" />

      <div className="mx-auto flex max-w-4xl flex-col px-4 text-center sm:px-6 lg:px-8 relative z-10">
        <div
          className="animate-appear motion-reduce:animate-none flex items-center justify-center gap-3 text-xs sm:text-sm tracking-[0.2em] uppercase text-muted-foreground"
          style={{ animationDelay: "0ms" }}
        >
          <span className="min-w-[60px] h-[1px] bg-primary opacity-60" />
          {t("common.brandTagline")}
          <span className="min-w-[60px] h-[1px] bg-primary opacity-60" />
        </div>

        <h1
          className={`animate-appear motion-reduce:animate-none mt-6 font-heading text-5xl sm:text-6xl lg:text-8xl leading-[1.05] ${isAr ? "leading-[1.3] tracking-none" : "tracking-tight"}`}
          style={{ animationDelay: "100ms" }}
        >
          {t("home.hero.title")}
        </h1>

        <p
          className="animate-appear motion-reduce:animate-none mt-6 max-w-xl mx-auto text-base sm:text-lg leading-relaxed text-muted-foreground"
          style={{ animationDelay: "200ms" }}
        >
          {t("home.hero.subtitle")}
        </p>

        <div
          className="animate-appear motion-reduce:animate-none mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full"
          style={{ animationDelay: "300ms" }}
        >
          <Link
            href="/book"
            className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl px-8 font-semibold bg-primary text-primary-foreground shadow-md hover:opacity-90 active:scale-95 duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("nav.bookNow")}
          </Link>
          <Link
            href="/rooms"
            className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl px-8 font-semibold border border-border bg-card/70 text-foreground hover:bg-card transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("nav.rooms")}
          </Link>
        </div>

        <div className="animate-appear motion-reduce:animate-none mt-10 w-full max-w-md mx-auto" style={{ animationDelay: "450ms" }}>
          <AvailabilityBar />
        </div>

        <div
          className="animate-appear motion-reduce:animate-none mt-12 grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4"
          style={{ animationDelay: "550ms" }}
        >
          {HIGHLIGHTS.map(({ key, icon: Icon }) => (
            <div key={key} className="flex flex-col items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Icon aria-hidden className="size-4" />
              </div>
              <span className="text-sm text-muted-foreground">{t(key)}</span>
            </div>
          ))}
        </div>

        <div className="mt-16 hidden sm:flex flex-col items-center">
          <ChevronDownIcon
            aria-hidden
            className="size-4 text-muted-foreground motion-reduce:animate-none animate-[hero-scroll_2s_ease-in-out_infinite]"
          />
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute -z-10 bottom-12 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-primary opacity-60" />
    </section>
  );
}
