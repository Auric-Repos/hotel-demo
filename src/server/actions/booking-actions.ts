"use server";

import { redirect } from "next/navigation";
import { flattenError } from "zod";
import { getCurrentTenant } from "@/lib/tenant";
import { createBooking } from "@/server/actions/bookings";
import { getAvailableRooms } from "@/server/queries/rooms";
import { bookingFormSchema, bookingStaySchema } from "@/lib/schemas/booking-form";
import {
  initialBookingState,
  type AvailabilityState,
  type AvailableRoom,
  type BookingErrorKey,
  type BookingSubmitState,
} from "@/lib/booking-state";

/** Server-side mapping from createBooking error codes to i18n keys under `book`. */
const BOOKING_ERROR_KEYS: Record<string, BookingErrorKey> = {
  invalid_dates: "errors.checkOutOrder",
  past_date: "errors.pastDate",
  room_not_found: "errors.roomNotFound",
  over_capacity: "errors.overCapacity",
  dates_unavailable: "errors.datesUnavailable",
  reference_generation_failed: "errors.referenceFailed",
  validation_failed: "errors.validationFailed",
};

// Bots that fill the honeypot get sent here. It matches no booking, so the
// confirmation page shows its friendly not-found state.
const FAKE_REFERENCE = "AUR-222222";

function todayInCairo(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(
    new Date(),
  );
}

function confirmationPath(
  localeInput: FormDataEntryValue | null,
  reference: string,
): string {
  const locale = localeInput === "ar" ? "ar" : "en";
  return `/${locale}/book/confirmation?ref=${encodeURIComponent(reference)}`;
}

/** Looks up rooms available for the given stay and party size. */
export async function checkAvailability(
  _prev: AvailabilityState,
  formData: FormData,
): Promise<AvailabilityState> {
  const parsed = bookingStaySchema.safeParse({
    checkIn: String(formData.get("checkIn") ?? ""),
    checkOut: String(formData.get("checkOut") ?? ""),
    adults: formData.get("adults"),
    children: formData.get("children"),
  });

  if (!parsed.success) {
    const key = (parsed.error.issues[0]?.message ??
      "errors.invalidDates") as BookingErrorKey;
    return { ok: false, rooms: [], formError: key };
  }

  const { checkIn, checkOut, adults, children } = parsed.data;

  if (checkIn < todayInCairo()) {
    return { ok: false, rooms: [], formError: "errors.pastDate" };
  }

  const guests = adults + children;

  try {
    const tenant = await getCurrentTenant();
    const rows = await getAvailableRooms(tenant.id, checkIn, checkOut, guests);

    const rooms: AvailableRoom[] = rows.map((room) => ({
      id: room.id,
      slug: room.slug,
      nameEn: room.nameEn,
      nameAr: room.nameAr,
      view: room.view,
      capacity: room.capacity,
      bedType: room.bedType,
      sizeSqm: room.sizeSqm,
      basePriceCents: room.basePriceCents,
    }));

    return { ok: true, rooms, checkIn, checkOut, guests };
  } catch {
    return { ok: false, rooms: [], formError: "errors.unknown" };
  }
}

/** Creates a booking request, then redirects to the confirmation page. */
export async function submitBooking(
  _prev: BookingSubmitState,
  formData: FormData,
): Promise<BookingSubmitState> {
  // Honeypot: real guests never see or fill this field.
  if (String(formData.get("website") ?? "").trim() !== "") {
    redirect(confirmationPath(formData.get("locale"), FAKE_REFERENCE));
  }

  const parsed = bookingFormSchema.safeParse({
    checkIn: String(formData.get("checkIn") ?? ""),
    checkOut: String(formData.get("checkOut") ?? ""),
    adults: formData.get("adults"),
    children: formData.get("children"),
    roomId: String(formData.get("roomId") ?? ""),
    guestName: String(formData.get("guestName") ?? ""),
    guestPhone: String(formData.get("guestPhone") ?? ""),
    guestEmail: String(formData.get("guestEmail") ?? ""),
    guestCountry: String(formData.get("guestCountry") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });

  if (!parsed.success) {
    const { fieldErrors } = flattenError(parsed.error);
    return { ...initialBookingState, fieldErrors };
  }

  const data = parsed.data;
  let reference: string;

  try {
    const tenant = await getCurrentTenant();
    const result = await createBooking(tenant.id, {
      roomId: data.roomId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      adults: data.adults,
      children: data.children,
      guestName: data.guestName,
      guestPhone: data.guestPhone,
      guestEmail: data.guestEmail || null,
      guestCountry: data.guestCountry || null,
      notes: data.notes || null,
      source: "website",
    });

    if (!result.ok) {
      const key = BOOKING_ERROR_KEYS[result.error] ?? "errors.unknown";
      return { ...initialBookingState, formError: key };
    }
    reference = result.booking.reference;
  } catch {
    return { ...initialBookingState, formError: "errors.unknown" };
  }

  // Outside try/catch on purpose: redirect() works by throwing.
  redirect(confirmationPath(formData.get("locale"), reference));
}