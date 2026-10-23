import { z } from "zod";

/** Real calendar date in YYYY-MM-DD (rejects "", 2026-02-31, 2026-13-45). */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "errors.invalidDate")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "errors.invalidDate");

/** The stay part of the form. Shared by the browser and the Server Action. */
const bookingStayFields = z.object({
  checkIn: isoDate,
  checkOut: isoDate,
  adults: z.coerce
    .number({ error: "errors.adultsRequired" })
    .int("errors.adultsInvalid")
    .min(1, "errors.adultsRequired")
    .max(20, "errors.adultsInvalid"),
  children: z.coerce
    .number({ error: "errors.childrenInvalid" })
    .int("errors.childrenInvalid")
    .min(0, "errors.childrenInvalid")
    .max(10, "errors.childrenInvalid"),
});

export const bookingStaySchema = bookingStayFields.refine(
  (data) => data.checkOut > data.checkIn,
  { message: "errors.checkOutOrder", path: ["checkOut"] },
);

/** Guest details step. Also validated alone in the browser. */
export const bookingGuestSchema = z.object({
  guestName: z
    .string()
    .trim()
    .min(2, "errors.nameRequired")
    .max(120, "errors.nameTooLong"),
  guestPhone: z
    .string()
    .trim()
    .min(1, "errors.phoneRequired")
    .max(20, "errors.phoneInvalid")
    .regex(/^\+?[\d ]+$/, "errors.phoneInvalid")
    .refine((value) => {
      const digits = value.replace(/\D/g, "").length;
      return digits >= 7 && digits <= 15;
    }, "errors.phoneInvalid"),
  guestEmail: z.union([z.email("errors.emailInvalid"), z.literal("")]),
  guestCountry: z.string().trim().max(80, "errors.countryTooLong").optional(),
  notes: z.string().trim().max(500, "errors.notesTooLong").optional(),
});

export const bookingFormSchema = bookingStayFields
  .extend({
    roomId: z.guid("errors.roomRequired"),
    ...bookingGuestSchema.shape,
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "errors.checkOutOrder",
    path: ["checkOut"],
  });

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const BOOKING_FORM_FIELDS = [
  "checkIn",
  "checkOut",
  "adults",
  "children",
  "roomId",
  "guestName",
  "guestPhone",
  "guestEmail",
  "guestCountry",
  "notes",
] as const;

export type BookingFormField = (typeof BOOKING_FORM_FIELDS)[number];