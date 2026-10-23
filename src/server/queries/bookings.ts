import "server-only";
import { and, eq, sql, desc, or, ilike, notInArray, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import { bookings, type BookingStatus, rooms } from "@/server/db/schema";

export async function listBookings(
  tenantId: string,
  options?: { status?: BookingStatus; search?: string; limit?: number }
) {
  const conditions = [eq(bookings.tenantId, tenantId)];

  if (options?.status) {
    conditions.push(eq(bookings.status, options.status));
  }

  if (options?.search) {
    const term = `%${options.search}%`;
    conditions.push(
      or(
        ilike(bookings.guestName, term),
        ilike(bookings.reference, term),
        ilike(bookings.guestPhone, term)
      )!
    );
  }

  let query = db
    .select()
    .from(bookings)
    .where(and(...conditions))
    .orderBy(desc(bookings.createdAt));

  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }

  return query;
}

export async function getBooking(tenantId: string, bookingIdOrRef: string) {
  const [booking] = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.tenantId, tenantId),
        or(eq(bookings.id, bookingIdOrRef), eq(bookings.reference, bookingIdOrRef))
      )
    )
    .limit(1);
  return booking ?? null;
}

export async function listCalendarBookings(
  tenantId: string,
  from: string,
  to: string
) {
  return db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.tenantId, tenantId),
        notInArray(bookings.status, ["cancelled", "declined"]),
        sql`${bookings.checkIn} < ${to}::date`,
        sql`${bookings.checkOut} > ${from}::date`
      )
    )
    .orderBy(bookings.checkIn);
}

export async function getDashboardSummary(tenantId: string) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
  }).format(new Date());

  const [
    arrivalsRes,
    departuresRes,
    pendingRes,
    occupiedRes,
    totalRoomsRes,
    inquiriesRes,
  ] = await Promise.all([
    db.execute<{ count: number }>(
      sql`SELECT count(*)::int as count FROM bookings
          WHERE tenant_id = ${tenantId}::uuid
            AND check_in = ${today}::date
            AND status IN ('confirmed', 'checked_in')`
    ),
    db.execute<{ count: number }>(
      sql`SELECT count(*)::int as count FROM bookings
          WHERE tenant_id = ${tenantId}::uuid
            AND check_out = ${today}::date
            AND status IN ('confirmed', 'checked_in')`
    ),
    db.execute<{ count: number }>(
      sql`SELECT count(*)::int as count FROM bookings
          WHERE tenant_id = ${tenantId}::uuid
            AND status = 'pending'`
    ),
    db.execute<{ count: number }>(
      sql`SELECT count(DISTINCT room_id)::int as count FROM bookings
          WHERE tenant_id = ${tenantId}::uuid
            AND status IN ('confirmed', 'checked_in')
            AND check_in <= ${today}::date
            AND check_out > ${today}::date`
    ),
    db.execute<{ count: number }>(
      sql`SELECT count(*)::int as count FROM rooms
          WHERE tenant_id = ${tenantId}::uuid
            AND is_active = true`
    ),
    db.execute<{ count: number }>(
      sql`SELECT count(*)::int as count FROM inquiries
          WHERE tenant_id = ${tenantId}::uuid
            AND status = 'new'`
    ),
  ]);

  const arrivalsToday = arrivalsRes.rows[0]?.count ?? 0;
  const departuresToday = departuresRes.rows[0]?.count ?? 0;
  const pendingCount = pendingRes.rows[0]?.count ?? 0;
  const occupiedTonight = occupiedRes.rows[0]?.count ?? 0;
  const totalActiveRooms = totalRoomsRes.rows[0]?.count ?? 0;
  const newInquiriesCount = inquiriesRes.rows[0]?.count ?? 0;

  const occupancyPercent =
    totalActiveRooms > 0
      ? Math.round((occupiedTonight / totalActiveRooms) * 100)
      : 0;

  return {
    arrivalsToday,
    departuresToday,
    pendingCount,
    occupancyPercent,
    newInquiriesCount,
  };
}

// Matches generateReference(): "AUR-" + 6 chars from the unambiguous alphabet.
const REFERENCE_PATTERN = /^AUR-[2-9A-HJ-NP-Z]{6}$/;

export type BookingConfirmation = {
  reference: string;
  roomNameEn: string;
  roomNameAr: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  firstName: string;
};

/**
 * Returns only what the confirmation page needs. Never exposes phone, email,
 * notes, price or status. Always scoped to the tenant.
 */
export async function getBookingByReference(
  tenantId: string,
  reference: string,
): Promise<BookingConfirmation | null> {
  const ref = reference.trim().toUpperCase();
  if (!REFERENCE_PATTERN.test(ref)) return null;

  const [row] = await db
    .select({
      reference: bookings.reference,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      adults: bookings.adults,
      children: bookings.children,
      guestName: bookings.guestName,
      roomNameEn: rooms.nameEn,
      roomNameAr: rooms.nameAr,
    })
    .from(bookings)
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .where(and(eq(bookings.tenantId, tenantId), eq(bookings.reference, ref)))
    .limit(1);

  if (!row) return null;

  const nights = Math.round(
    (new Date(`${row.checkOut}T00:00:00Z`).getTime() -
      new Date(`${row.checkIn}T00:00:00Z`).getTime()) /
      86_400_000,
  );

  return {
    reference: row.reference,
    roomNameEn: row.roomNameEn,
    roomNameAr: row.roomNameAr,
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    nights,
    guests: row.adults + row.children,
    firstName: row.guestName.trim().split(/\s+/)[0] ?? "",
  };
}

export type DashboardBooking = {
  id: string;
  reference: string;
  status: BookingStatus;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  guestCountry: string | null;
  notes: string | null;
  totalPriceCents: number;
  createdAt: Date;
  roomNameEn: string;
  roomNameAr: string;
};

/** Bookings with room names for the owner dashboard, newest first. */
export async function listBookingsForDashboard(
  tenantId: string,
  statuses?: BookingStatus[],
  limit = 100,
): Promise<DashboardBooking[]> {
  const conditions = [eq(bookings.tenantId, tenantId)];
  if (statuses?.length) conditions.push(inArray(bookings.status, statuses));

  return db
    .select({
      id: bookings.id,
      reference: bookings.reference,
      status: bookings.status,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      adults: bookings.adults,
      children: bookings.children,
      guestName: bookings.guestName,
      guestPhone: bookings.guestPhone,
      guestEmail: bookings.guestEmail,
      guestCountry: bookings.guestCountry,
      notes: bookings.notes,
      totalPriceCents: bookings.totalPriceCents,
      createdAt: bookings.createdAt,
      roomNameEn: rooms.nameEn,
      roomNameAr: rooms.nameAr,
    })
    .from(bookings)
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .where(and(...conditions))
    .orderBy(desc(bookings.createdAt))
    .limit(limit);
}