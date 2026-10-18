import { z } from "zod";

export const createBookingSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  adults: z.number().int().min(1, "At least 1 adult required"),
  children: z.number().int().min(0).default(0),
  guestName: z.string().min(2, "Guest name is required"),
  guestPhone: z.string().min(5, "Guest phone number is required"),
  guestEmail: z.string().email("Invalid email address").optional().nullable(),
  guestCountry: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  source: z.string().default("website"),
  clientPrice: z.number().optional(), // Must be ignored by server computation
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

