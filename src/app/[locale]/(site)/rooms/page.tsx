import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentTenantId } from "@/lib/tenant";
import { getRooms } from "@/server/queries/rooms";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

async function RoomsGrid({ locale }: { locale: string }) {
  const t = await getTranslations("rooms");
  const tenantId = await getCurrentTenantId();
  const roomsList = await getRooms(tenantId);

  if (roomsList.length === 0) {
    return <p className="text-center text-muted-foreground">{t("noRooms")}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {roomsList.map((room) => {
        const name = locale === "ar" ? room.nameAr : room.nameEn;
        const description = locale === "ar" ? room.descriptionAr : room.descriptionEn;
        const priceFormatted = `$${(room.basePriceCents / 100).toFixed(0)}`;

        return (
          <article
            key={room.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-shadow hover:shadow-md"
          >
            <div className="p-6 flex flex-col flex-1 justify-between">
              <div>
                <h2 className="font-heading text-2xl text-ink font-semibold">
                  {name}
                </h2>
                {description && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {description}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-baseline justify-between border-t border-border/40 pt-4">
                <div>
                  <span className="font-heading text-2xl font-bold text-ink">
                    {priceFormatted}
                  </span>
                  <span className="text-xs text-muted-foreground ms-1">
                    {t("perNight")}
                  </span>
                </div>

                <Link
                  href="/book"
                  className="inline-flex items-center justify-center rounded-md bg-ink px-4 py-2 text-sm font-medium text-sand transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t("bookRoom")}
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default async function RoomsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("rooms");

  return (
    <main className="flex-1 px-6 py-16 sm:px-12 md:py-24 max-w-7xl mx-auto w-full">
      <header className="mb-12 text-center">
        <h1 className="font-heading text-3xl md:text-5xl text-ink tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
          {t("subtitle")}
        </p>
      </header>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 rounded-xl border border-border/40 bg-muted/20 animate-pulse"
              />
            ))}
          </div>
        }
      >
        <RoomsGrid locale={locale} />
      </Suspense>
    </main>
  );
}
