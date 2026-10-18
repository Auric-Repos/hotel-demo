import "server-only";
import { and, eq, sql, desc, or, ilike, notInArray } from "drizzle-orm";
import { db } from "@/server/db";
import { bookings, type BookingStatus } from "@/server/db/schema";

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
