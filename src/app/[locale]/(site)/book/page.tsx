import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BookingForm } from "@/components/site/booking-form";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    room?: string;
  }>;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

async function BookForm({
  searchParams,
}: {
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    room?: string;
  }>;
}) {
  const search = await searchParams;

  // Only accept well-formed ISO dates and a sane guest count from the URL.
  const checkIn =
    search.checkIn && ISO_DATE.test(search.checkIn) ? search.checkIn : "";
  const checkOut =
    search.checkOut && ISO_DATE.test(search.checkOut) ? search.checkOut : "";
  const guests = Number(search.guests);
  const initialGuests =
    Number.isInteger(guests) && guests >= 1 && guests <= 20 ? guests : 2;
  const roomSlug = search.room?.trim() ?? "";

  return (
    <BookingForm
      initialCheckIn={checkIn}
      initialCheckOut={checkOut}
      initialGuests={initialGuests}
      initialRoomSlug={roomSlug}
    />
  );
}

export default async function BookPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("book");

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

      <Suspense fallback={<BookingFormSkeleton />}>
        <section className="section-bento border-t border-border/40 bg-background">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* your page title and intro */}
            <div className="mt-10">
              <BookForm searchParams={searchParams} />
            </div>
          </div>
        </section>
      </Suspense>
    </main>
  );
}

function BookingFormSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="space-y-8">
        <div className="rounded-2xl border border-border/60 bg-card/70 p-6">
          <div className="h-6 w-40 rounded bg-muted/60 animate-pulse" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="h-12 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
      <div className="h-64 rounded-2xl border border-border/60 bg-card/70 animate-pulse" />
    </div>
  );
}

