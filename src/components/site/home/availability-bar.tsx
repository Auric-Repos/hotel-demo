"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { AlertTriangleIcon } from "lucide-react";

/** "Today" in the hotel's timezone, as YYYY-MM-DD (en-CA formats ISO-like). */
function todayInCairo(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(
    new Date(),
  );
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

const fieldClass =
  "mt-1 h-12 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

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
  const [error, setError] = useState<ErrorCode | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const checkIn = String(data.get("checkIn") ?? "");
    const checkOut = String(data.get("checkOut") ?? "");
    const guests = String(data.get("guests") ?? "2");

    // Date strings are ISO, so lexicographic comparison is chronological.
    const now = today || todayInCairo();
    if (!checkIn || !checkOut) {
      setError("dates");
      return;
    }
    if (checkIn < now) {
      setError("past");
      return;
    }
    if (checkOut <= checkIn) {
      setError("order");
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
      className="w-full max-w-3xl rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-lg text-foreground"
    >
      <div className="grid gap-3 md:grid-cols-4 md:items-end">
        <div>
          <label
            htmlFor="availability-check-in"
            className="block text-xs font-medium text-muted-foreground"
          >
            {t("checkIn")}
          </label>
          <input
            id="availability-check-in"
            name="checkIn"
            type="date"
            min={today || undefined}
            required
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor="availability-check-out"
            className="block text-xs font-medium text-muted-foreground"
          >
            {t("checkOut")}
          </label>
          <input
            id="availability-check-out"
            name="checkOut"
            type="date"
            min={today || undefined}
            required
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor="availability-guests"
            className="block text-xs font-medium text-muted-foreground"
          >
            {t("guests")}
          </label>
          <select
            id="availability-guests"
            name="guests"
            defaultValue="2"
            className={fieldClass}
          >
            {GUEST_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="inline-flex w-full h-12 items-center justify-center rounded-xl px-2 font-semibold bg-primary text-primary-foreground shadow-md hover:opacity-80 active:scale-95 duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none text-xs"
        >
          {t("submit")}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-destructive">
          <AlertTriangleIcon aria-hidden className="size-4 shrink-0 me-2" />
          {t(ERROR_KEYS[error])}
        </p>
      )}
    </form>
  );
}
