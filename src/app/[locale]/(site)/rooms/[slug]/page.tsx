import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BedDoubleIcon,
  CheckIcon,
  EyeIcon,
  RulerIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { SITE_CONFIG } from "@/lib/constants";
import { DEMO_TENANT_ID, getCurrentTenant } from "@/lib/tenant";
import { getRoomBySlug, getRooms } from "@/server/queries/rooms";
import { Photo } from "@/components/site/photo";
import { cn } from "@/lib/utils";

type SearchParams = {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
};

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<SearchParams>;
};

type Translator = { has(key: string): boolean; (key: string): string };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function roomName(room: { nameEn: string; nameAr: string }, locale: string) {
  return locale === "ar" ? room.nameAr : room.nameEn;
}

function roomPrice(room: { basePriceCents: number }) {
  return `$${Math.round(room.basePriceCents / 100)}`;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function translateAmenity(t: Translator, amenity: string) {
  const key = `amenities.${slugify(amenity)}`;
  return t.has(key) ? t(key) : amenity;
}

export async function generateStaticParams(): Promise<
  Array<{ locale: string; slug: string }>
> {
  const rooms = await getRooms(DEMO_TENANT_ID);
  return rooms.flatMap((room) =>
    ["en", "ar"].map((locale) => ({ locale, slug: room.slug })),
  );
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "rooms" });

  return {
    title: t("meta.title", { name: SITE_CONFIG.name }),
    description: t("meta.description"),
    alternates: {
      languages: { en: "/en", ar: "/ar" },
    },
  };
}

/* ------------------------------ Small pieces ------------------------------ */

function Ornament() {
  return (
    <div aria-hidden className="mb-5 flex items-center justify-center gap-3">
      <span className="h-px w-12 bg-linear-to-r from-transparent to-primary/70" />
      <span className="size-1.5 rotate-45 bg-primary" />
      <span className="h-px w-12 bg-linear-to-l from-transparent to-primary/70" />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-2.5">
      <span aria-hidden className="size-1.5 rotate-45 bg-primary" />
      <h2 className="font-heading text-xl text-ink">{children}</h2>
    </div>
  );
}

function GalleryTile({
  src,
  alt,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-secondary",
        className,
      )}
    >
      <Photo
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/0 transition-all duration-500 group-hover:ring-primary/40 motion-reduce:transition-none"
      />
    </div>
  );
}

function FactTile({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 text-sm text-foreground",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
    >
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:ring-primary motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      >
        <Icon className="size-4 text-foreground transition-colors duration-300 group-hover:text-primary-foreground" />
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/** Gold request button with a soft shine sweep on hover. */
function RequestLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary font-medium text-primary-foreground shadow-md shadow-primary/30",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:translate-y-0 active:scale-[0.98]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        focusRing,
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-1/2 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[300%] rtl:translate-x-full rtl:group-hover:-translate-x-[300%] motion-reduce:hidden"
      />
      <span className="relative">{label}</span>
      <ArrowRightIcon
        aria-hidden
        className="relative size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1 motion-reduce:transition-none"
      />
    </Link>
  );
}

/* --------------------------------- Content -------------------------------- */

async function RoomBody({
  locale,
  slug,
  searchParams,
}: {
  locale: string;
  slug: string;
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations();
  const search = await searchParams;
  const tenant = await getCurrentTenant();
  const room = await getRoomBySlug(tenant.id, slug);

  if (!room || !room.isActive) {
    notFound();
  }

  const name = roomName(room, locale);
  const description =
    locale === "ar" ? room.descriptionAr : room.descriptionEn;
  const fromPrice = t("rooms.from", { price: roomPrice(room) });
  const images = room.images.length ? room.images : ["/gallery-1.jpg"];
  const thumbs = images.slice(1, 5);
  const rich = thumbs.length >= 4;

  const allRooms = await getRooms(tenant.id);
  const similar = allRooms
    .filter((r) => r.id !== room.id && r.isActive)
    .slice(0, 2);

  const bookingQuery = new URLSearchParams(search as Record<string, string>);
  bookingQuery.set("room", slug);
  const bookHref = `/book?${bookingQuery.toString()}`;

  const facts: { icon: LucideIcon; text: string }[] = [
    { icon: EyeIcon, text: t(`rooms.view.${room.view}`) },
    { icon: UsersIcon, text: t("rooms.capacity", { n: room.capacity }) },
    { icon: BedDoubleIcon, text: `${t("rooms.bed")}: ${room.bedType}` },
    { icon: RulerIcon, text: t("rooms.size", { sqm: room.sizeSqm }) },
  ];

  return (
    <article className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/rooms"
        className={cn(
          "group mb-8 inline-flex items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-ink",
          focusRing,
        )}
      >
        <ArrowLeftIcon
          aria-hidden
          className="size-4 transition-transform duration-300 group-hover:-translate-x-1 rtl:-scale-x-100 rtl:group-hover:translate-x-1 motion-reduce:transition-none"
        />
        {t("rooms.backToRooms")}
      </Link>

      {/* Header */}
      <header className="mb-10 animate-appear text-center motion-reduce:animate-none">
        <Ornament />
        <h1 className="font-heading text-3xl tracking-tight text-ink md:text-5xl">
          {name}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        )}
      </header>

      {/* Gallery */}
      <section
        aria-label={name}
        className="mb-12 animate-appear motion-reduce:animate-none"
        style={{ animationDelay: "80ms" }}
      >
        {rich ? (
          <div className="grid gap-3 lg:h-[34rem] lg:grid-cols-4 lg:grid-rows-2">
            <GalleryTile
              src={images[0]}
              alt={name}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="aspect-[4/3] lg:col-span-2 lg:row-span-2 lg:aspect-auto"
            />
            <div className="grid grid-cols-2 gap-3 lg:contents">
              {thumbs.map((image, i) => (
                <GalleryTile
                  key={`${image}-${i}`}
                  src={image}
                  alt={`${name} — ${i + 2}`}
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="aspect-square lg:aspect-auto"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <GalleryTile
              src={images[0]}
              alt={name}
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="aspect-[4/3] sm:aspect-[16/9]"
            />
            {thumbs.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {thumbs.map((image, i) => (
                  <GalleryTile
                    key={`${image}-${i}`}
                    src={image}
                    alt={`${name} — ${i + 2}`}
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="aspect-[4/3]"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Content + sticky booking card */}
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <div className="min-w-0 space-y-14">
          {/* Facts */}
          <section>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {facts.map((fact) => (
                <FactTile key={fact.text} icon={fact.icon}>
                  {fact.text}
                </FactTile>
              ))}
            </ul>
          </section>

          {/* Amenities */}
          {room.amenities.length > 0 && (
            <section>
              <SectionTitle>{t("rooms.amenities")}</SectionTitle>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                {room.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition-colors duration-200 hover:bg-primary/5 motion-reduce:transition-none"
                  >
                    <span
                      aria-hidden
                      className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/20 transition-colors duration-300 group-hover:bg-primary group-hover:ring-primary motion-reduce:transition-none"
                    >
                      <CheckIcon className="size-3.5 text-foreground transition-colors duration-300 group-hover:text-primary-foreground" />
                    </span>
                    {translateAmenity(t, amenity)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Similar rooms */}
          {similar.length > 0 && (
            <section>
              <SectionTitle>{t("rooms.similarRooms")}</SectionTitle>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {similar.map((other) => (
                  <Link
                    key={other.id}
                    href={`/rooms/${other.slug}`}
                    className={cn(
                      "group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm",
                      "transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10",
                      "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                      focusRing,
                    )}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                      <Photo
                        src={other.images[0] ?? "/gallery-1.jpg"}
                        alt={roomName(other, locale)}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    </div>
                    <div className="flex items-end justify-between gap-3 p-5">
                      <div className="min-w-0">
                        <h3 className="truncate font-heading text-lg font-semibold text-ink">
                          {roomName(other, locale)}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t(`rooms.view.${other.view}`)} ·{" "}
                          {t("rooms.capacity", { n: other.capacity })}
                        </p>
                        <p className="mt-3 font-heading text-lg font-bold text-ink">
                          {t("rooms.from", { price: roomPrice(other) })}
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none"
                      >
                        <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5 motion-reduce:transition-none" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Desktop: sticky booking card */}
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-6 shadow-xl shadow-primary/10">
            <span
              aria-hidden
              className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent"
            />
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground rtl:tracking-normal">
              {t("rooms.pricePerNight")}
            </p>
            <p className="mt-2 font-heading text-3xl text-ink">{fromPrice}</p>
            <RequestLink
              href={bookHref}
              label={t("rooms.requestThisRoom")}
              className="mt-6 h-12 w-full px-5 text-sm"
            />
            <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
              {t("rooms.requestNote")}
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile: sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground rtl:tracking-normal">
              {t("rooms.pricePerNight")}
            </p>
            <p className="font-heading text-xl text-ink">{fromPrice}</p>
          </div>
          <RequestLink
            href={bookHref}
            label={t("rooms.requestThisRoom")}
            className="h-11 shrink-0 px-5 text-sm"
          />
        </div>
      </div>
    </article>
  );
}

function RoomSkeleton() {
  return (
    <article
      aria-hidden
      className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8"
    >
      <div className="mb-8 h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="mx-auto mb-10 flex max-w-md flex-col items-center gap-4">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="mb-12 grid gap-3 lg:h-[34rem] lg:grid-cols-4 lg:grid-rows-2">
        <div className="aspect-[4/3] animate-pulse rounded-2xl bg-muted lg:col-span-2 lg:row-span-2 lg:aspect-auto" />
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="hidden animate-pulse rounded-2xl bg-muted lg:block"
          />
        ))}
      </div>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="hidden h-60 animate-pulse rounded-2xl bg-muted lg:block" />
      </div>
    </article>
  );
}

export default async function RoomPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex-1 pb-28 lg:pb-16">
      <Suspense fallback={<RoomSkeleton />}>
        <RoomBody locale={locale} slug={slug} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}