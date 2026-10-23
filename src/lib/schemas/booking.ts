import { z } from "zod";

export const createBookingSchema = z.object({
  roomId: z.guid("Invalid room ID"),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  adults: z.number().int().min(1, "At least 1 adult required"),
  children: z.number().int().min(0).default(0),
  guestName: z.string().trim().min(2, "Guest name is required").max(120),
  guestPhone: z
    .string()
    .trim()
    .regex(/^\+?[\d ]+$/, "Invalid phone number")
    .min(7, "Invalid phone number")
    .max(20, "Invalid phone number"),
  guestEmail: z.string().email("Invalid email address").max(254).optional().nullable(),
  guestCountry: z.string().max(80).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  source: z.string().default("website"),
  clientPrice: z.number().optional(), // Must be ignored by server computation
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

