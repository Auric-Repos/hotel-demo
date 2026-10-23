/**
 * Serialisable state shared by the booking Server Actions and the client form.
 * Kept out of the `"use server"` module so the file only exports async
 * functions (a Next.js requirement).
 */
export type BookingFieldErrors = Partial<Record<string, string[]>>;

/** I18n keys under the `book` namespace. */
export type BookingErrorKey =
  | "errors.invalidDate"
  | "errors.adultsRequired"
  | "errors.adultsInvalid"
  | "errors.childrenInvalid"
  | "errors.roomRequired"
  | "errors.nameRequired"
  | "errors.nameTooLong"
  | "errors.phoneRequired"
  | "errors.phoneInvalid"
  | "errors.emailInvalid"
  | "errors.countryTooLong"
  | "errors.notesTooLong"
  | "errors.checkOutOrder"
  | "errors.invalidDates"
  | "errors.pastDate"
  | "errors.roomNotFound"
  | "errors.overCapacity"
  | "errors.datesUnavailable"
  | "errors.referenceFailed"
  | "errors.validationFailed"
  | "errors.unknown";

export type BookingSubmitState = {
  ok: boolean;
  /** Field-level messages (i18n keys under `book`). */
  fieldErrors: BookingFieldErrors;
  /** Form-level message (i18n key under `book`). */
  formError?: BookingErrorKey;
  /** Booking reference, set on success. */
  reference?: string;
};

export const initialBookingState: BookingSubmitState = {
  ok: false,
  fieldErrors: {},
};

export type AvailableRoom = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  view: string;
  capacity: number;
  bedType: string;
  sizeSqm: number;
  basePriceCents: number;
};

export type AvailabilityState = {
  ok: boolean;
  rooms: AvailableRoom[];
  formError?: BookingErrorKey;
  /** The stay the rooms were searched for, used to detect a stale list. */
  checkIn?: string;
  checkOut?: string;
  guests?: number;
};

export const initialAvailabilityState: AvailabilityState = {
  ok: false,
  rooms: [],
};
