import { Suspense } from "react";

import {
  ArrowRightIcon,
  BedDoubleIcon,
  RulerIcon,
  SearchXIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { getCurrentTenant } from "@/lib/tenant";
import { getRooms } from "@/server/queries/rooms";
import { Photo } from "@/components/site/photo";
import { GALLERY_IMAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    view?: string;
    guests?: string;
  }>;
};

type ViewFilter = "all" | "nile" | "garden" | "city";
type Search = { view?: string; guests?: string };

const VIEW_FILTERS: ViewFilter[] = ["all", "nile", "garden", "city"];
const GUEST_FILTERS = ["", "1", "2", "3", "4"];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function parseView(value?: string): ViewFilter {
  return VIEW_FILTERS.includes(value as ViewFilter)
    ? (value as ViewFilter)
    : "all";
}

function roomName(
  room: { nameEn: string; nameAr: string },
  locale: string,
) {
  return locale === "ar" ? room.nameAr : room.nameEn;
}

function roomPrice(room: { basePriceCents: number }) {
  return `$${Math.round(room.basePriceCents / 100)}`;
}

/** Merge a new value into the current search params so filters compose. */
function withSearchParam(current: Search, key: string, value: string) {
  const q = new URLSearchParams(
    current as Record<string, string>,
  );

  if (value === "") {
    q.delete(key);
  } else {
    q.set(key, value);
  }

  const query = q.toString();
  return query ? `?${query}` : "?";
}

function Ornament() {
  return (
    <div
      aria-hidden
      className="mb-5 flex items-center justify-center gap-3"
    >
      <span className="h-px w-12 bg-linear-to-r from-transparent to-primary/70" />
      <span className="size-1.5 rotate-45 bg-primary" />
      <span className="h-px w-12 bg-linear-to-l from-transparent to-primary/70" />
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80 rtl:tracking-normal">
        {label}
      </span>

      <nav
        aria-label={label}
        className={cn(
          "flex max-w-full flex-wrap items-center justify-center gap-1.5",
          "rounded-xl border border-border/70 bg-card/90 p-1.5",
          "shadow-sm shadow-black/[0.03] backdrop-blur-md",
        )}
      >
        {children}
      </nav>
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-10 items-center justify-center",
        "rounded-lg px-3.5 py-2 text-sm font-medium",
        "whitespace-nowrap",
        "transition-[background-color,color,box-shadow] duration-200",
        "motion-reduce:transition-none",
        focusRing,
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

/** Filter bar: plain links, no client JS. The page re-renders on the server. */
async function FilterBar({ search }: { search: Search }) {
  const t = await getTranslations();
  const activeView = parseView(search.view);
  const activeGuests = search.guests ?? "";

  return (
    <section
      className={cn(
        "mb-12 flex animate-appear flex-col items-center justify-center",
        "gap-6 md:flex-row md:items-start md:gap-10 lg:gap-14",
        "motion-reduce:animate-none",
      )}
      style={{ animationDelay: "80ms" }}
    >
      <FilterGroup label={t("rooms.filters.view")}>
        {VIEW_FILTERS.map((view) => (
          <FilterPill
            key={view}
            href={withSearchParam(search, "view", view)}
            active={activeView === view}
          >
            {view === "all"
              ? t("rooms.filters.allViews")
              : t(`rooms.view.${view}`)}
          </FilterPill>
        ))}
      </FilterGroup>

      <FilterGroup label={t("rooms.filters.guests")}>
        {GUEST_FILTERS.map((guests) => (
          <FilterPill
            key={guests}
            href={withSearchParam(search, "guests", guests)}
            active={activeGuests === guests}
          >
            {guests === ""
              ? t("rooms.filters.any")
              : t("rooms.filters.min", {
                  n: Number(guests),
                })}
          </FilterPill>
        ))}
      </FilterGroup>
    </section>
  );
}

function Spec({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-1.5">
      <Icon aria-hidden className="size-4 text-foreground/70" />
      {children}
    </li>
  );
}

function EmptyState({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <span
        aria-hidden
        className="grid size-14 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/30"
      >
        <Icon className="size-6 text-foreground" />
      </span>

      <p className="text-muted-foreground">{children}</p>
    </div>
  );
}

async function RoomsGrid({
  locale,
  search,
}: {
  locale: string;
  search: Search;
}) {
  const t = await getTranslations();
  const tenant = await getCurrentTenant();
  const roomsList = await getRooms(tenant.id);

  const view = parseView(search.view);
  const minGuests = Math.max(0, Number(search.guests) || 0);

  const filtered = roomsList.filter(
    (room) =>
      (view === "all" || room.view === view) &&
      room.capacity >= minGuests,
  );

  if (roomsList.length === 0) {
    return (
      <EmptyState icon={BedDoubleIcon}>
        {t("rooms.noRooms")}
      </EmptyState>
    );
  }

  if (filtered.length === 0) {
    return (
      <EmptyState icon={SearchXIcon}>
        {t("rooms.noMatch")}
      </EmptyState>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {filtered.map((room, index) => {
        const name = roomName(room, locale);
        const image = room.images[0] ?? GALLERY_IMAGES[0].src;

        return (
          <li
            key={room.id}
            className="animate-appear motion-reduce:animate-none"
            style={{
              animationDelay: `${160 + Math.min(index, 8) * 70}ms`,
            }}
          >
            <article
              className={cn(
                "group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm",
                "transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              )}
            >
              <Link
                href={`/rooms/${room.slug}`}
                aria-label={`${name} — ${t("rooms.bookRoom")}`}
                className={cn("flex h-full flex-col", focusRing)}
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Photo
                    src={image}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />

                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/40 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
                  />

                  <span className="absolute start-4 top-4 inline-flex items-center rounded-full border border-border/50 bg-background/85 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-md">
                    {t(`rooms.view.${room.view}`)}
                  </span>
                </div>

                {/* Body */}
                <div className="relative flex flex-1 flex-col p-6">
                  <span
                    aria-hidden
                    className="absolute inset-x-6 top-0 h-px origin-center scale-x-50 bg-linear-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-all duration-500 group-hover:scale-x-100 group-hover:opacity-100 motion-reduce:transition-none"
                  />

                  <h2 className="font-heading text-xl font-semibold text-ink">
                    {name}
                  </h2>

                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <Spec icon={UsersIcon}>
                      {t("rooms.capacity", { n: room.capacity })}
                    </Spec>

                    <Spec icon={BedDoubleIcon}>
                      {room.bedType}
                    </Spec>

                    <Spec icon={RulerIcon}>
                      {t("rooms.size", { sqm: room.sizeSqm })}
                    </Spec>
                  </ul>

                  <div className="mt-auto flex items-end justify-between gap-4 border-t border-border/40 pt-5">
                    <span className="mt-6 font-heading text-2xl font-bold text-ink">
                      {t("rooms.from", {
                        price: roomPrice(room),
                      })}
                    </span>

                    <span
                      aria-hidden
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-300 group-hover:scale-110 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/30 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    >
                      <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5 motion-reduce:transition-none" />
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

function RoomsSkeleton() {
  return (
    <div
      aria-hidden
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
    >
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="overflow-hidden rounded-2xl border border-border/40 bg-card"
        >
          <div className="aspect-[4/3] animate-pulse bg-muted" />

          <div className="space-y-3 p-6">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-56 animate-pulse rounded bg-muted" />
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function RoomsBody({
  locale,
  searchParams,
}: {
  locale: string;
  searchParams: Promise<Search>;
}) {
  const search = await searchParams;

  return (
    <>
      <FilterBar search={search} />
      <RoomsGrid locale={locale} search={search} />
    </>
  );
}

export default async function RoomsPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-16 sm:px-12 md:py-24">
      <header className="mb-12 animate-appear text-center motion-reduce:animate-none">
        <Ornament />

        <h1 className="font-heading text-3xl tracking-tight text-ink md:text-5xl">
          {t("rooms.title")}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          {t("rooms.subtitle")}
        </p>
      </header>

      <Suspense fallback={<RoomsSkeleton />}>
        <RoomsBody
          locale={locale}
          searchParams={searchParams}
        />
      </Suspense>
    </main>
  );
}