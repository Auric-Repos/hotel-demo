import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { bookings, rooms, type Booking, type BookingStatus } from "@/server/db/schema";
import { createBookingSchema } from "@/lib/schemas/booking";
import { randomInt } from "node:crypto";

const REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateReference(): string {
  let ref = "AUR-";
  for (let i = 0; i < 6; i++) {
        const idx = randomInt(REFERENCE_ALPHABET.length);
    ref += REFERENCE_ALPHABET[idx];
  }
  return ref;
}

export type CreateBookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; error: string; message?: string };

export async function createBooking(
  tenantId: string,
  input: unknown
): Promise<CreateBookingResult> {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "validation_failed",
      message: parsed.error.issues[0]?.message || "Validation failed",
    };
  }

  const data = parsed.data;

  // Validate checkOut > checkIn
  if (data.checkOut <= data.checkIn) {
    return {
      ok: false,
      error: "invalid_dates",
      message: "Check-out date must be strictly after check-in date",
    };
  }

  // Reject past dates relative to Africa/Cairo
  const todayInCairo = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
  }).format(new Date());

  if (data.checkIn < todayInCairo) {
    return {
      ok: false,
      error: "past_date",
      message: "Check-in date cannot be in the past",
    };
  }

  // Fetch room to verify tenant ownership and capacity
  const [room] = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.tenantId, tenantId), eq(rooms.id, data.roomId)))
    .limit(1);

  if (!room) {
    return {
      ok: false,
      error: "room_not_found",
      message: "Room not found for this hotel",
    };
  }

  if (data.adults + data.children > room.capacity) {
    return {
      ok: false,
      error: "over_capacity",
      message: `Total guests exceed room capacity of ${room.capacity}`,
    };
  }

  // Refuse if the room has an overlapping confirmed or checked_in stay
  const overlapCheck = await db.execute<{ count: number }>(
    sql`SELECT count(*)::int as count FROM bookings
        WHERE tenant_id = ${tenantId}::uuid
          AND room_id = ${data.roomId}::uuid
          AND status IN ('confirmed', 'checked_in')
          AND check_in < ${data.checkOut}::date
          AND check_out > ${data.checkIn}::date`
  );

  if ((overlapCheck.rows[0]?.count ?? 0) > 0) {
    return {
      ok: false,
      error: "dates_unavailable",
      message: "Room is already booked for the selected dates",
    };
  }

  // Compute nights and total price on the server (ignore any client price)
  const dIn = new Date(data.checkIn + "T00:00:00Z");
  const dOut = new Date(data.checkOut + "T00:00:00Z");
  const nights = Math.round(
    (dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPriceCents = nights * room.basePriceCents;

  let insertedBooking: Booking | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = generateReference();
    try {
      const [row] = await db
        .insert(bookings)
        .values({
          tenantId,
          roomId: data.roomId,
          reference,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          adults: data.adults,
          children: data.children,
          guestName: data.guestName,
          guestPhone: data.guestPhone,
          guestEmail: data.guestEmail,
          guestCountry: data.guestCountry,
          notes: data.notes,
          source: data.source ?? "website",
          status: "pending",
          totalPriceCents,
        })
        .returning();
      insertedBooking = row;
      break;
    } catch (err: unknown) {
      const error = err as { code?: string; constraint?: string };
      if (error.code === "23505" && error.constraint?.includes("reference")) {
        continue;
      }
      throw err;
    }
  }

  if (!insertedBooking) {
    return {
      ok: false,
      error: "reference_generation_failed",
      message: "Could not generate unique booking reference",
    };
  }

  return { ok: true, booking: insertedBooking };
}

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "declined", "cancelled"],
  confirmed: ["checked_in", "cancelled", "no_show"],
  checked_in: ["checked_out"],
  checked_out: [],
  cancelled: [],
  declined: [],
  no_show: [],
};

export type SetBookingStatusResult =
  | { ok: true; booking: Booking }
  | { ok: false; error: string; message?: string };

export async function setBookingStatus(
  tenantId: string,
  bookingId: string,
  newStatus: BookingStatus
): Promise<SetBookingStatusResult> {
  const [current] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.tenantId, tenantId), eq(bookings.id, bookingId)))
    .limit(1);

  if (!current) {
    return { ok: false, error: "booking_not_found" };
  }

  const allowed = VALID_TRANSITIONS[current.status] || [];
  if (!allowed.includes(newStatus)) {
    return {
      ok: false,
      error: "invalid_transition",
      message: `Cannot transition status from '${current.status}' to '${newStatus}'`,
    };
  }

  try {
    const [updated] = await db
      .update(bookings)
      .set({
        status: newStatus,
        confirmedAt: newStatus === "confirmed" ? new Date() : current.confirmedAt,
        updatedAt: new Date(),
      })
      .where(and(eq(bookings.tenantId, tenantId), eq(bookings.id, bookingId)))
      .returning();

    return { ok: true, booking: updated };
  } catch (err: unknown) {
    const error = err as { code?: string; cause?: { code?: string } };
    const errorCode = error.code || error.cause?.code;
    if (errorCode === "23P01") {
      return { ok: false, error: "dates_unavailable" };
    }
    throw err;
  }
}

