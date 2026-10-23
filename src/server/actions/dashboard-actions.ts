"use server";

import { getDashboardAccess } from "@/lib/dashboard-auth";
import { setBookingStatus } from "@/server/actions/bookings";
import type { BookingStatus } from "@/server/db/schema";

export type BookingAction = "confirm" | "decline" | "cancel";

// The client sends an action name, never a status: only these three exist.
const TARGET: Record<BookingAction, BookingStatus> = {
  confirm: "confirmed",
  decline: "declined",
  cancel: "cancelled",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BookingActionResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "noAccess"
        | "notFound"
        | "invalidTransition"
        | "datesUnavailable"
        | "unknown";
    };

export async function updateBookingStatusAction(
  bookingId: string,
  action: BookingAction,
): Promise<BookingActionResult> {
  if (!Object.hasOwn(TARGET, action) || !UUID_PATTERN.test(bookingId)) {
    return { ok: false, error: "unknown" };
  }

  // Re-check the user here. Never rely on the page having done it.
  const access = await getDashboardAccess();
  if (access.status !== "ok") return { ok: false, error: "noAccess" };

  try {
    // setBookingStatus is scoped to the tenant and validates the transition.
    const result = await setBookingStatus(
      access.tenant.id,
      bookingId,
      TARGET[action],
    );
    if (result.ok) return { ok: true };

    switch (result.error) {
      case "booking_not_found":
        return { ok: false, error: "notFound" };
      case "invalid_transition":
        return { ok: false, error: "invalidTransition" };
      case "dates_unavailable":
        return { ok: false, error: "datesUnavailable" };
      default:
        return { ok: false, error: "unknown" };
    }
  } catch {
    return { ok: false, error: "unknown" };
  }
}