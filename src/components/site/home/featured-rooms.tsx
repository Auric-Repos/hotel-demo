import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { GALLERY_IMAGES } from "@/lib/constants";
import { getCurrentTenant } from "@/lib/tenant";
import { getRooms } from "@/server/queries/rooms";
import { Photo } from "@/components/site/photo";

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
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <h2 className="font-heading text-3xl text-ink md:text-4xl">
          {t("home.featuredRooms.title")}
        </h2>

        {rooms.length === 0 ? (
          <p className="mt-6 text-muted-foreground">{t("rooms.noRooms")}</p>
        ) : (
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const name = locale === "ar" ? room.nameAr : room.nameEn;
              const price = `$${Math.round(room.basePriceCents / 100)}`;

              return (
                <article
                  key={room.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-white transition-shadow hover:shadow-md motion-reduce:transition-none"
                >
                  <Link
                    href={`/rooms/${room.slug}`}
                    className="flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gold-soft">
                      <Photo
                        src={room.images[0] ?? GALLERY_IMAGES[0].src}
                        alt={name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-heading text-2xl text-ink">{name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t(`rooms.view.${room.view}`)}
                        {" · "}
                        {t("home.featuredRooms.capacity", { n: room.capacity })}
                      </p>
                      <p className="mt-auto pt-4 text-sm text-ink">
                        {t("home.featuredRooms.from", { price })}
                      </p>
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
