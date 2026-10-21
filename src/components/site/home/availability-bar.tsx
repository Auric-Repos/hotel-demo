"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** "Today" in the hotel's timezone, as YYYY-MM-DD (en-CA formats ISO-like). */
function todayInCairo(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(
    new Date(),
  );
}

/** The day after an ISO date (UTC math, so no timezone drift). */
function nextDay(iso: string): string | undefined {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return undefined;
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// The date never needs a subscription: it only changes at midnight, and the
// snapshot is read on render. This keeps SSR/hydration on the same empty value.
const subscribe = () => () => {};
const getTodaySnapshot = () => todayInCairo();
const getServerTodaySnapshot = () => "";

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

const ERROR_KEYS = {
  dates: "errorDates",
  past: "errorPast",
  order: "errorOrder",
} as const;

type ErrorCode = keyof typeof ERROR_KEYS;

const fieldClass = cn(
  "h-12 w-full cursor-pointer rounded-xl border border-border/70 bg-background/80 ps-10 pe-3",
  "text-start text-sm text-foreground",
  "transition-[border-color,box-shadow,background-color] duration-200",
  "hover:border-primary/60 hover:bg-background",
  "focus-visible:border-primary focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/15",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/10",
  "motion-reduce:transition-none",
);

// Date inputs: the native picker icon is stretched over the whole field and
// made invisible, so a click anywhere opens the picker. The last class fixes
// iOS Safari centering the date text.
const dateClass = cn(
  fieldClass,
  "relative invalid:text-muted-foreground",
  "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0",
  "[&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full",
  "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
  "[&::-webkit-date-and-time-value]:text-start",
);

function Field({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 block px-1 text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <div className="group relative">
        <Icon
          aria-hidden
          className="pointer-events-none absolute start-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground"
        />
        {children}
      </div>
    </div>
  );
}

/**
 * Date + guests form in the hero. Validates locally (no API call) and navigates
 * to /book with the chosen values. "Today" is resolved in Africa/Cairo; it is
 * empty during SSR and filled in on the client so the markup matches.
 */
export function AvailabilityBar() {
  const t = useTranslations("home.availability");
  const router = useRouter();
  // Empty during SSR/first render, then the real Cairo date (no hydration gap).
  const today = useSyncExternalStore(
    subscribe,
    getTodaySnapshot,
    getServerTodaySnapshot,
  );

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [error, setError] = useState<ErrorCode | null>(null);

  const checkOutMin = checkIn
    ? nextDay(checkIn)
    : today
      ? nextDay(today)
      : undefined;

  const invalidIn = error === "dates" ? !checkIn : error === "past";
  const invalidOut = error === "dates" ? !checkOut : error === "order";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const focusField = (name: string) =>
      (form.elements.namedItem(name) as HTMLElement | null)?.focus();

    // Date strings are ISO, so lexicographic comparison is chronological.
    const now = today || todayInCairo();
    if (!checkIn || !checkOut) {
      setError("dates");
      focusField(!checkIn ? "checkIn" : "checkOut");
      return;
    }
    if (checkIn < now) {
      setError("past");
      focusField("checkIn");
      return;
    }
    if (checkOut <= checkIn) {
      setError("order");
      focusField("checkOut");
      return;
    }

    setError(null);
    router.push(
      `/book?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(
        checkOut,
      )}&guests=${encodeURIComponent(guests)}`,
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        "relative w-full rounded-2xl border border-border/60 bg-card/75 p-3 text-start text-foreground",
        "shadow-xl shadow-primary/10 backdrop-blur-xl sm:p-4",
      )}
    >
      {/* Gold hairline along the top edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
      />

      <div className="grid items-end gap-3 sm:grid-cols-2 md:grid-cols-[1fr_1fr_8rem_auto]">
        <Field id="availability-check-in" label={t("checkIn")} icon={CalendarDaysIcon}>
          <input
            id="availability-check-in"
            name="checkIn"
            type="date"
            value={checkIn}
            min={today || undefined}
            required
            aria-invalid={invalidIn || undefined}
            aria-describedby={invalidIn ? "availability-error" : undefined}
            onChange={(e) => {
              const value = e.target.value;
              setCheckIn(value);
              if (checkOut && value && checkOut <= value) setCheckOut("");
              setError(null);
            }}
            className={dateClass}
          />
        </Field>

        <Field id="availability-check-out" label={t("checkOut")} icon={CalendarDaysIcon}>
          <input
            id="availability-check-out"
            name="checkOut"
            type="date"
            value={checkOut}
            min={checkOutMin}
            required
            aria-invalid={invalidOut || undefined}
            aria-describedby={invalidOut ? "availability-error" : undefined}
            onChange={(e) => {
              setCheckOut(e.target.value);
              setError(null);
            }}
            className={dateClass}
          />
        </Field>

        <div className="sm:col-span-2 md:col-span-1">
          <Field id="availability-guests" label={t("guests")} icon={UsersIcon}>
            <select
              id="availability-guests"
              name="guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className={cn(fieldClass, "appearance-none pe-9")}
            >
              {GUEST_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden
              className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </Field>
        </div>

        <button
          type="submit"
          className={cn(
            "btn-shine group inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2",
            "rounded-xl bg-primary px-6 text-sm font-semibold whitespace-nowrap text-primary-foreground shadow-md",
            "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30",
            "active:translate-y-0 active:scale-[0.98]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
            "sm:col-span-2 md:col-span-1 md:w-auto",
          )}
        >
          <span>{t("submit")}</span>
          <span className="inline-flex rtl:-scale-x-100" aria-hidden>
            <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
          </span>
        </button>
      </div>

      {error && (
        <p
          id="availability-error"
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertTriangleIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          {t(ERROR_KEYS[error])}
        </p>
      )}
    </form>
  );
}