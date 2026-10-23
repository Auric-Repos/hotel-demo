"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BabyIcon,
  BedDoubleIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronDownIcon,
  GlobeIcon,
  InfoIcon,
  Loader2Icon,
  MailIcon,
  MessageCircleIcon,
  MinusIcon,
  PhoneIcon,
  PlusIcon,
  SendIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { checkAvailability, submitBooking } from "@/server/actions/booking-actions";
import {
  initialAvailabilityState,
  initialBookingState,
  type AvailabilityState,
  type AvailableRoom,
  type BookingSubmitState,
} from "@/lib/booking-state";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { bookingGuestSchema, bookingStaySchema } from "@/lib/schemas/booking-form";
import { cn } from "@/lib/utils";

/* ---------- helpers ---------- */

/** "Today" in the hotel's timezone, as YYYY-MM-DD. */
function todayInCairo(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(
    new Date(),
  );
}

// Empty on the server so SSR and client markup match on the first paint.
const subscribe = () => () => {};
const getTodaySnapshot = () => todayInCairo();
const getServerTodaySnapshot = () => "";

const nextDay = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

const nightsBetween = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(`${checkIn}T00:00:00Z`).getTime();
  const b = new Date(`${checkOut}T00:00:00Z`).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
};

const formatPrice = (cents: number, locale: string): string =>
  new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);

const formatNumber = (n: number, locale: string): string =>
  new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(n);

const formatDate = (iso: string, locale: string): string => {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

function issuesToErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !next[key]) next[key] = issue.message;
  }
  return next;
}

const aria = (id: string, error: string | null) => ({
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : undefined,
});

/* ---------- styles ---------- */

const fieldClass = cn(
  "h-12 w-full rounded-xl border border-border/70 bg-background/80 px-3 text-start text-sm text-foreground",
  "transition-[border-color,box-shadow,background-color] duration-200",
  "hover:border-primary/60 hover:bg-background",
  "focus-visible:border-primary focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/15",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/10",
  "motion-reduce:transition-none",
);

// Fields with a leading icon.
const iconField = cn(fieldClass, "ps-10");

// Date inputs: the native picker icon is stretched over the whole field and
// hidden, so a click anywhere opens the picker. The last class fixes iOS
// Safari centering the date text.
const dateField = cn(
  iconField,
  "relative cursor-pointer invalid:text-muted-foreground",
  "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0",
  "[&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full",
  "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
  "[&::-webkit-date-and-time-value]:text-start",
);

const labelClass = "mb-1.5 block px-1 text-xs font-medium text-muted-foreground";

const primaryBtn = cn(
  "btn-shine group inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md",
  "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30",
  "active:translate-y-0 active:scale-[0.98]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto",
);

const secondaryBtn = cn(
  "group inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/60 px-6 text-sm font-medium text-foreground",
  "transition-all duration-200 hover:border-primary/60 hover:bg-primary/5",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none sm:w-auto",
);

const footerClass = "mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center";

const surface =
  "relative rounded-3xl border border-border/60 bg-card/80 shadow-xl shadow-primary/10 backdrop-blur-xl";

/* ---------- small components ---------- */

/** Gold hairline along the top edge of a card. */
function Hairline() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
    />
  );
}

/** Arrow that slides on hover and mirrors correctly in RTL. */
function Arrow({ dir = "next" }: { dir?: "next" | "back" }) {
  const Icon = dir === "next" ? ArrowRightIcon : ArrowLeftIcon;
  return (
    <span aria-hidden className="inline-flex rtl:-scale-x-100">
      <Icon
        className={cn(
          "size-4 transition-transform duration-300 motion-reduce:transition-none",
          dir === "next"
            ? "group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
            : "group-hover:-translate-x-1 motion-reduce:group-hover:translate-x-0",
        )}
      />
    </span>
  );
}

function Field({
  id,
  label,
  error,
  icon: Icon,
  className,
  children,
}: {
  id: string;
  label: string;
  error: string | null;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="group relative">
        {Icon && (
          <Icon
            aria-hidden
            className="pointer-events-none absolute start-3 top-4 z-10 size-4 text-muted-foreground transition-colors group-focus-within:text-foreground"
          />
        )}
        {children}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 px-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Number input with − / + helpers. The input stays fully usable by keyboard and
 * screen readers (typing, arrow keys), so the buttons are pointer helpers only.
 */
function Counter({
  id,
  name,
  label,
  icon,
  value,
  min,
  max,
  required,
  error,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  icon: LucideIcon;
  value: string;
  min: number;
  max: number;
  required?: boolean;
  error: string | null;
  onChange: (next: string) => void;
}) {
  const n = Number(value) || 0;
  const bump = (delta: number) =>
    onChange(String(Math.min(max, Math.max(min, n + delta))));
  const btn = cn(
    "grid size-8 cursor-pointer place-items-center rounded-lg border border-border/70 bg-card text-foreground",
    "transition-colors hover:border-primary/60 hover:bg-primary/10",
    "disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none",
  );

  return (
    <Field id={id} label={label} error={error} icon={icon}>
      <input
        id={id}
        name={name}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          iconField,
          "pe-[5.5rem] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        )}
        {...aria(id, error)}
      />
      <div className="absolute end-1.5 top-2 flex gap-1">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => bump(-1)}
          disabled={n <= min}
          className={btn}
        >
          <MinusIcon className="size-4" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => bump(1)}
          disabled={n >= max}
          className={btn}
        >
          <PlusIcon className="size-4" />
        </button>
      </div>
    </Field>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-end text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function Stepper({
  current,
  labels,
  caption,
  locale,
}: {
  current: number;
  labels: string[];
  caption: string;
  locale: string;
}) {
  return (
    <div>
      <ol className="flex items-center">
        {labels.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          const isLast = i === labels.length - 1;
          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-all duration-300 motion-reduce:transition-none",
                    active &&
                      "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20",
                    done && "border-primary/50 bg-primary/10 text-foreground",
                    !active && !done && "border-border bg-background text-muted-foreground",
                  )}
                >
                  {done ? (
                    <CheckIcon aria-hidden className="size-4" />
                  ) : (
                    formatNumber(n, locale)
                  )}
                </span>
                <span
                  className={cn(
                    "hidden text-sm sm:inline",
                    active ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </span>
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "mx-3 h-px flex-1 transition-colors duration-300 motion-reduce:transition-none",
                    done ? "bg-primary/50" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: caption + thin progress bar */}
      <div className="mt-4 sm:hidden">
        <p className="text-sm text-muted-foreground">{caption}</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${(current / labels.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Wraps the Server Action so a network failure becomes a normal error state
 * instead of crashing the page. redirect() surfaces as a NEXT_REDIRECT error
 * and must be passed through untouched.
 */
async function submitSafely(
  prev: BookingSubmitState,
  formData: FormData,
): Promise<BookingSubmitState> {
  try {
    return await submitBooking(prev, formData);
  } catch (error) {
    const digest = String((error as { digest?: unknown })?.digest ?? "");
    if (digest.startsWith("NEXT_REDIRECT")) throw error;
    return { ...initialBookingState, formError: "errors.unknown" };
  }
}

/* ---------- main component ---------- */

type Props = {
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  /** Slug of a room to preselect once the availability search returns. */
  initialRoomSlug?: string;
};

export function BookingForm({
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests = 2,
  initialRoomSlug = "",
}: Props) {
  const t = useTranslations("book");
  const tRooms = useTranslations("rooms");
  const locale = useLocale();

  const today = useSyncExternalStore(
    subscribe,
    getTodaySnapshot,
    getServerTodaySnapshot,
  );

  const [step, setStep] = useState(1);
  const [navigated, setNavigated] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move keyboard focus to the step heading after the guest navigates.
  useEffect(() => {
    if (navigated) headingRef.current?.focus();
  }, [step, navigated]);

  const goTo = (next: number) => {
    setNavigated(true);
    setStep(next);
  };

  // Stay
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [adults, setAdults] = useState(String(initialGuests));
  const [children, setChildren] = useState("0");

  // Room
  const [roomId, setRoomId] = useState("");

  // Guest (controlled, so nothing is lost when steps change)
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestCountry, setGuestCountry] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const err = (name: string) => (errors[name] ? t(errors[name]) : null);
  const clearError = (name: string) =>
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });

  const [availability, setAvailability] = useState<AvailabilityState>(
    initialAvailabilityState,
  );
  const [searching, startSearch] = useTransition();
  const [booking, bookingAction, bookingPending] = useActionState<
    BookingSubmitState,
    FormData
  >(submitSafely, initialBookingState);


    // Announce each server result once. The ref guard keeps re-renders from
  // repeating a toast.
  const handledResult = useRef<BookingSubmitState | null>(null);
  useEffect(() => {
    if (handledResult.current === booking) return;
    handledResult.current = booking;

    const key = booking.formError ?? Object.values(booking.fieldErrors)[0]?.[0];
    if (!key) return;

    if (key === "errors.datesUnavailable") {
      // Stays until dismissed and offers the fix.
      toast.error(t(key), {
        id: "booking-error",
        duration: Infinity,
        action: {
          label: t("review.changeDates"),
          onClick: () => {
            setNavigated(true);
            setStep(1);
          },
        },
      });
    } else {
      toast.error(t(key), { id: "booking-error" });
    }
  }, [booking, t]);

  // Don't let an error toast follow the guest to the confirmation page.
  useEffect(
    () => () => {
      toast.dismiss("booking-error");
    },
    [],
  );
  // Derived selection: an explicit choice wins, then the ?room= slug,
  // then the first available room.
  const manualRoom = availability.rooms.find((room) => room.id === roomId);
  const preselectedRoom = availability.rooms.find(
    (room) => room.slug === initialRoomSlug,
  );
  const effectiveRoomId =
    manualRoom?.id ?? preselectedRoom?.id ?? availability.rooms[0]?.id ?? "";
  const selectedRoom: AvailableRoom | undefined = availability.rooms.find(
    (room) => room.id === effectiveRoomId,
  );

  const totalGuests = (Number(adults) || 0) + (Number(children) || 0);
  const nights = nightsBetween(checkIn, checkOut);
  const totalPriceCents = selectedRoom ? nights * selectedRoom.basePriceCents : 0;
  const roomName = selectedRoom
    ? locale === "ar"
      ? selectedRoom.nameAr
      : selectedRoom.nameEn
    : "";
  const totalLabel =
    totalPriceCents > 0 && step >= 2 ? formatPrice(totalPriceCents, locale) : "—";

  /* ----- validation ----- */

  const validateStay = (): boolean => {
    const parsed = bookingStaySchema.safeParse({ checkIn, checkOut, adults, children });
    if (!parsed.success) {
      setErrors(issuesToErrors(parsed.error.issues));
      toast.error(t("errors.checkFields"), { id: "validation" });
      return false;
    }
    if (today && checkIn < today) {
      setErrors({ checkIn: "errors.pastDate" });
      toast.error(t("errors.pastDate"), { id: "validation" });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateGuest = (): boolean => {
    const parsed = bookingGuestSchema.safeParse({
      guestName,
      guestPhone,
      guestEmail,
      guestCountry,
      notes,
    });
    if (!parsed.success) {
      setErrors(issuesToErrors(parsed.error.issues));
      toast.error(t("errors.checkFields"), { id: "validation" });
      return false;
    }
    setErrors({});
    return true;
  };

  /* ----- step handlers ----- */

    const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStay()) return;
    const formData = new FormData(event.currentTarget);
    startSearch(async () => {
      try {
        const result = await checkAvailability(availability, formData);
        setAvailability(result);
        if (result.ok) goTo(2);
        else if (result.formError) toast.error(t(result.formError));
      } catch {
        toast.error(t("errors.unknown"));
      }
    });
  };

  const onRoomNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (effectiveRoomId) goTo(3);
  };

  const onGuestNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateGuest()) goTo(4);
  };

  /* ----- render ----- */

  const labels = [t("steps.stay"), t("steps.room"), t("steps.guest"), t("steps.review")];
  const headings = [t("stay.title"), t("room.title"), t("guest.title"), t("review.title")];
  const caption = `${t("steps.progress", {
    current: formatNumber(step, locale),
    total: formatNumber(4, locale),
  })} · ${labels[step - 1]}`;

  // Shared by the mobile accordion and the desktop sidebar.
  const summaryRows = (
    <>
      <Row label={t("stay.checkIn")} value={formatDate(checkIn, locale)} />
      <Row label={t("stay.checkOut")} value={formatDate(checkOut, locale)} />
      <Row label={t("summary.guests")} value={formatNumber(totalGuests, locale)} />
      <Row label={t("summary.nights")} value={formatNumber(nights, locale)} />
      {selectedRoom && step >= 2 && <Row label={t("summary.room")} value={roomName} />}
    </>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-8">
      {/* Mobile summary (the sidebar below is desktop only) */}
      <details className={cn(surface, "group/summary lg:hidden")}>
        <summary
          className={cn(
            "flex cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-5 py-4",
            "[&::-webkit-details-marker]:hidden",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          <span className="font-heading text-base text-foreground">
            {t("summary.title")}
          </span>
          <span className="flex items-center gap-3">
            <span className="font-heading text-base text-foreground">{totalLabel}</span>
            <ChevronDownIcon
              aria-hidden
              className="size-4 text-muted-foreground transition-transform duration-300 group-open/summary:rotate-180 motion-reduce:transition-none"
            />
          </span>
        </summary>
        <div className="border-t border-border/40 px-5 pb-4">
          <dl className="divide-y divide-border/40">{summaryRows}</dl>
          <p className="mt-3 text-xs text-muted-foreground">{t("summary.disclaimer")}</p>
        </div>
      </details>

      <div className={cn(surface, "p-5 sm:p-8")}>
        <Hairline />
        <Stepper current={step} labels={labels} caption={caption} locale={locale} />

        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-8 font-heading text-2xl leading-snug text-foreground outline-none sm:text-3xl"
        >
          {headings[step - 1]}
        </h2>

        <div key={step} className="animate-appear motion-reduce:animate-none">
          {/* Step 1: stay */}
          {step === 1 && (
            <form onSubmit={onSearch} noValidate aria-busy={searching}>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  id="booking-check-in"
                  label={t("stay.checkIn")}
                  error={err("checkIn")}
                  icon={CalendarDaysIcon}
                >
                  <input
                    id="booking-check-in"
                    name="checkIn"
                    type="date"
                    required
                    value={checkIn}
                    min={today || undefined}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCheckIn(value);
                      clearError("checkIn");
                      clearError("checkOut");
                      if (checkOut && value && checkOut <= value) setCheckOut("");
                    }}
                    className={dateField}
                    {...aria("booking-check-in", err("checkIn"))}
                  />
                </Field>

                <Field
                  id="booking-check-out"
                  label={t("stay.checkOut")}
                  error={err("checkOut")}
                  icon={CalendarDaysIcon}
                >
                  <input
                    id="booking-check-out"
                    name="checkOut"
                    type="date"
                    required
                    value={checkOut}
                    min={checkIn ? nextDay(checkIn) : today ? nextDay(today) : undefined}
                    onChange={(e) => {
                      setCheckOut(e.target.value);
                      clearError("checkOut");
                    }}
                    className={dateField}
                    {...aria("booking-check-out", err("checkOut"))}
                  />
                </Field>

                <Counter
                  id="booking-adults"
                  name="adults"
                  label={t("stay.adults")}
                  icon={UsersIcon}
                  min={1}
                  max={20}
                  required
                  value={adults}
                  error={err("adults")}
                  onChange={(next) => {
                    setAdults(next);
                    clearError("adults");
                  }}
                />

                <Counter
                  id="booking-children"
                  name="children"
                  label={t("stay.children")}
                  icon={BabyIcon}
                  min={0}
                  max={10}
                  value={children}
                  error={err("children")}
                  onChange={(next) => {
                    setChildren(next);
                    clearError("children");
                  }}
                />
              </div>

              <div className={cn(footerClass, "sm:justify-end")}>
                <button type="submit" disabled={searching} className={primaryBtn}>
                  {searching ? (
                    <Loader2Icon aria-hidden className="size-4 animate-spin" />
                  ) : (
                    <CalendarDaysIcon aria-hidden className="size-4" />
                  )}
                  {searching ? t("stay.searching") : t("stay.search")}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: room */}
          {step === 2 && (
            <form onSubmit={onRoomNext} noValidate>
              {availability.rooms.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border bg-background/60 p-8 text-center">
                  <p className="text-sm text-muted-foreground">{t("room.none")}</p>
                  <a
                    href={getWhatsAppUrl(
                      t("room.askMessage", {
                        checkIn: formatDate(checkIn, locale),
                        checkOut: formatDate(checkOut, locale),
                        guests: totalGuests,
                      }),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(primaryBtn, "mt-5")}
                  >
                    <MessageCircleIcon aria-hidden className="size-4" />
                    {t("room.askHotel")}
                  </a>
                </div>
              ) : (
                <fieldset className="mt-6 space-y-3">
                  <legend className="sr-only">{t("room.title")}</legend>
                  {availability.rooms.map((room) => {
                    const name = locale === "ar" ? room.nameAr : room.nameEn;
                    const selected = room.id === effectiveRoomId;
                    return (
                      <label
                        key={room.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-4 rounded-2xl border p-4 sm:p-5",
                          "transition-all duration-200 motion-reduce:transition-none",
                          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                          selected
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-border/60 bg-background/50 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-background hover:shadow-sm motion-reduce:hover:translate-y-0",
                        )}
                      >
                        <input
                          type="radio"
                          name="room"
                          value={room.id}
                          checked={selected}
                          onChange={() => setRoomId(room.id)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden
                          className={cn(
                            "mt-1 grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background",
                          )}
                        >
                          {selected && <CheckIcon className="size-3" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <span className="font-heading text-lg leading-snug text-foreground">
                              {name}
                            </span>
                            <span className="text-sm font-semibold text-foreground">
                              {tRooms("from", {
                                price: formatPrice(room.basePriceCents, locale),
                              })}
                            </span>
                          </span>
                          <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <UsersIcon aria-hidden className="size-3.5" />
                              {t("room.capacity", { n: room.capacity })}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <BedDoubleIcon aria-hidden className="size-3.5" />
                              {room.bedType}
                            </span>
                            <span>{tRooms("size", { sqm: room.sizeSqm })}</span>
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              )}

              <div className={cn(footerClass, "sm:justify-between")}>
                {availability.rooms.length > 0 && (
                  <button type="submit" className={primaryBtn}>
                    {t("nav.next")}
                    <Arrow />
                  </button>
                )}
                <button type="button" onClick={() => goTo(1)} className={secondaryBtn}>
                  <Arrow dir="back" />
                  {t("nav.back")}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: guest details */}
          {step === 3 && (
            <form onSubmit={onGuestNext} noValidate>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  id="booking-guest-name"
                  label={t("guest.name")}
                  error={err("guestName")}
                  icon={UserIcon}
                >
                  <input
                    id="booking-guest-name"
                    type="text"
                    required
                    maxLength={120}
                    autoComplete="name"
                    value={guestName}
                    onChange={(e) => {
                      setGuestName(e.target.value);
                      clearError("guestName");
                    }}
                    className={iconField}
                    {...aria("booking-guest-name", err("guestName"))}
                  />
                </Field>

                <Field
                  id="booking-guest-phone"
                  label={t("guest.phone")}
                  error={err("guestPhone")}
                  icon={PhoneIcon}
                >
                  <input
                    id="booking-guest-phone"
                    type="tel"
                    inputMode="tel"
                    required
                    maxLength={20}
                    autoComplete="tel"
                    dir="ltr"
                    value={guestPhone}
                    onChange={(e) => {
                      setGuestPhone(e.target.value);
                      clearError("guestPhone");
                    }}
                    className={iconField}
                    {...aria("booking-guest-phone", err("guestPhone"))}
                  />
                </Field>

                <Field
                  id="booking-guest-email"
                  label={t("guest.email")}
                  error={err("guestEmail")}
                  icon={MailIcon}
                >
                  <input
                    id="booking-guest-email"
                    type="email"
                    maxLength={254}
                    autoComplete="email"
                    dir="ltr"
                    value={guestEmail}
                    onChange={(e) => {
                      setGuestEmail(e.target.value);
                      clearError("guestEmail");
                    }}
                    className={iconField}
                    {...aria("booking-guest-email", err("guestEmail"))}
                  />
                </Field>

                <Field
                  id="booking-guest-country"
                  label={t("guest.country")}
                  error={err("guestCountry")}
                  icon={GlobeIcon}
                >
                  <input
                    id="booking-guest-country"
                    type="text"
                    maxLength={80}
                    autoComplete="country-name"
                    value={guestCountry}
                    onChange={(e) => {
                      setGuestCountry(e.target.value);
                      clearError("guestCountry");
                    }}
                    className={iconField}
                    {...aria("booking-guest-country", err("guestCountry"))}
                  />
                </Field>

                <Field
                  id="booking-notes"
                  label={t("guest.notes")}
                  error={err("notes")}
                  className="sm:col-span-2"
                >
                  <textarea
                    id="booking-notes"
                    rows={3}
                    maxLength={500}
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      clearError("notes");
                    }}
                    className={cn(fieldClass, "h-auto py-2.5")}
                    {...aria("booking-notes", err("notes"))}
                  />
                </Field>
              </div>

              <div className={cn(footerClass, "sm:justify-between")}>
                <button type="submit" className={primaryBtn}>
                  {t("nav.next")}
                  <Arrow />
                </button>
                <button type="button" onClick={() => goTo(2)} className={secondaryBtn}>
                  <Arrow dir="back" />
                  {t("nav.back")}
                </button>
              </div>
            </form>
          )}

          {/* Step 4: review and submit */}
          {step === 4 && (
            <form action={bookingAction} noValidate className="relative" aria-busy={bookingPending}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="checkIn" value={checkIn} />
              <input type="hidden" name="checkOut" value={checkOut} />
              <input type="hidden" name="adults" value={adults} />
              <input type="hidden" name="children" value={children} />
              <input type="hidden" name="roomId" value={effectiveRoomId} />
              <input type="hidden" name="guestName" value={guestName} />
              <input type="hidden" name="guestPhone" value={guestPhone} />
              <input type="hidden" name="guestEmail" value={guestEmail} />
              <input type="hidden" name="guestCountry" value={guestCountry} />
              <input type="hidden" name="notes" value={notes} />

              {/* Honeypot: hidden from people, tab order and screen readers. */}
              <div
                aria-hidden
                className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
              >
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              <dl className="mt-6 divide-y divide-border/40 overflow-hidden rounded-2xl border border-border/60 bg-background/60 px-5">
                <Row label={t("summary.room")} value={roomName} />
                <Row label={t("stay.checkIn")} value={formatDate(checkIn, locale)} />
                <Row label={t("stay.checkOut")} value={formatDate(checkOut, locale)} />
                <Row label={t("summary.nights")} value={formatNumber(nights, locale)} />
                <Row label={t("summary.guests")} value={formatNumber(totalGuests, locale)} />
                <Row label={t("guest.name")} value={guestName} />
                <Row
                  label={t("guest.phone")}
                  value={<span dir="ltr">{guestPhone}</span>}
                />
                {guestEmail && (
                  <Row label={t("guest.email")} value={<span dir="ltr">{guestEmail}</span>} />
                )}
                {guestCountry && <Row label={t("guest.country")} value={guestCountry} />}
                <div className="-mx-5 flex items-baseline justify-between gap-4 bg-primary/10 px-5 py-4">
                  <dt className="text-sm font-semibold text-foreground">
                    {t("review.estimatedTotal")}
                  </dt>
                  <dd className="font-heading text-2xl text-foreground">
                    {totalPriceCents > 0 ? formatPrice(totalPriceCents, locale) : "—"}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 flex items-start gap-3 rounded-xl bg-primary/5 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-foreground" />
                {t("review.request")}
              </p>

              <div className={cn(footerClass, "sm:justify-between")}>
                <button type="submit" disabled={bookingPending} className={primaryBtn}>
                  {bookingPending ? (
                    <Loader2Icon aria-hidden className="size-4 animate-spin" />
                  ) : (
                    <SendIcon aria-hidden className="size-4 rtl:-scale-x-100" />
                  )}
                  {bookingPending ? t("guest.submitting") : t("guest.submit")}
                </button>
                <button type="button" onClick={() => goTo(3)} className={secondaryBtn}>
                  <Arrow dir="back" />
                  {t("nav.back")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Desktop summary */}
      <aside className={cn(surface, "hidden h-fit p-6 lg:sticky lg:top-24 lg:block")}>
        <Hairline />
        <div aria-hidden className="mb-4 flex items-center gap-3">
          <span className="size-1.5 rotate-45 bg-primary" />
          <span className="h-px w-12 bg-linear-to-r from-primary/70 to-transparent rtl:bg-linear-to-l" />
        </div>
        <h2 className="font-heading text-xl text-foreground">{t("summary.title")}</h2>
        <dl className="mt-3 divide-y divide-border/40">
          {summaryRows}
          <div className="-mx-6 mt-2 flex items-baseline justify-between gap-4 bg-primary/10 px-6 py-4">
            <dt className="text-sm font-semibold text-foreground">{t("summary.total")}</dt>
            <dd className="font-heading text-xl text-foreground">{totalLabel}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          {t("summary.disclaimer")}
        </p>
      </aside>
    </div>
  );
}