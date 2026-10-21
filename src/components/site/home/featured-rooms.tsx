import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRightIcon, UsersIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { GALLERY_IMAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getCurrentTenant } from "@/lib/tenant";
import { getRooms } from "@/server/queries/rooms";
import { Photo } from "@/components/site/photo";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * First three active rooms. Renders inside a <Suspense> boundary in the page
 * because it reads the database (see rooms/page.tsx for the same pattern).
 */
export async function FeaturedRooms({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations();
  const tenant = await getCurrentTenant();
  const rooms = (await getRooms(tenant.id)).slice(0, 3);

  return (
    <section className="section-bento border-t border-border/40 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div aria-hidden className="mb-5 flex items-center gap-3">
              <span className="size-1.5 rotate-45 bg-primary" />
              <span className="h-px w-16 bg-linear-to-r from-primary/70 to-transparent rtl:bg-linear-to-l" />
            </div>
            <h2 className="font-heading text-3xl leading-tight text-balance text-foreground md:text-5xl">
              {t("home.featuredRooms.title")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
              {t("rooms.subtitle")}
            </p>
          </div>

          {rooms.length > 0 && (
            <Link
              href="/rooms"
              className={cn(
                "group inline-flex shrink-0 items-center gap-2 self-start rounded-xl px-1 py-2",
                "text-sm font-semibold text-foreground md:self-auto",
                focusRing,
              )}
            >
              <span className="border-b border-primary/60 pb-0.5 transition-colors group-hover:border-foreground">
                {t("home.featuredRooms.seeAll")}
              </span>
              <span className="inline-flex rtl:-scale-x-100" aria-hidden>
                <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
              </span>
            </Link>
          )}
        </div>

        {rooms.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/70 px-6 py-16 text-center backdrop-blur-sm">
            <p className="text-muted-foreground">{t("rooms.noRooms")}</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {rooms.map((room) => {
              const name = locale === "ar" ? room.nameAr : room.nameEn;
              const price = `$${Math.round(room.basePriceCents / 100)}`;

              return (
                <article
                  key={room.id}
                  className={cn(
                    "group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm",
                    "transition-all duration-300 ease-out",
                    "hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10",
                    "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  )}
                >
                  <Link
                    href={`/rooms/${room.slug}`}
                    className={cn("flex h-full flex-col rounded-2xl", focusRing)}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                      <Photo
                        src={room.images[0] ?? GALLERY_IMAGES[0].src}
                        alt={name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-linear-to-t from-foreground/35 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90"
                      />
                      <span className="absolute start-3 top-3 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-md">
                        <span aria-hidden className="size-1.5 rounded-full bg-primary" />
                        {t(`rooms.view.${room.view}`)}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <h3 className="font-heading text-2xl leading-snug text-foreground">
                        {name}
                      </h3>

                      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <UsersIcon aria-hidden className="size-4 shrink-0" />
                        {t("home.featuredRooms.capacity", { n: room.capacity })}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/60 pt-4">
                        <p className="text-sm font-medium text-foreground">
                          {t("home.featuredRooms.from", { price })}
                        </p>
                        <span
                          aria-hidden
                          className={cn(
                            "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
                            "border border-border bg-background text-foreground rtl:-scale-x-100",
                            "transition-all duration-300",
                            "group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground",
                            "motion-reduce:transition-none",
                          )}
                        >
                          <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/** Suspense fallback with the same layout, so nothing jumps when data loads. */
export function RoomsSkeleton() {
  return (
    <section className="section-bento border-t border-border/40 bg-background" aria-hidden>
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="max-w-2xl">
          <div className="h-1.5 w-20 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-10 w-72 max-w-full animate-pulse rounded-lg bg-muted md:h-12" />
          <div className="mt-4 h-5 w-full max-w-md animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-border/60 bg-card"
            >
              <div className="aspect-[4/3] animate-pulse bg-muted" />
              <div className="space-y-3 p-6">
                <div className="h-7 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="mt-5 h-9 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}