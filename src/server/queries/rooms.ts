import "server-only";
import { and, eq, gte, notInArray, asc, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { rooms } from "@/server/db/schema";

export async function getRooms(tenantId: string) {
  return db
    .select()
    .from(rooms)
    .where(and(eq(rooms.tenantId, tenantId), eq(rooms.isActive, true)))
    .orderBy(asc(rooms.sortOrder));
}

export async function getRoomById(tenantId: string, roomId: string) {
  const [room] = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.tenantId, tenantId), eq(rooms.id, roomId)))
    .limit(1);
  return room ?? null;
}

export async function getRoomBySlug(tenantId: string, slug: string) {
  const [room] = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.tenantId, tenantId), eq(rooms.slug, slug)))
    .limit(1);
  return room ?? null;
}

export async function getAvailableRooms(
  tenantId: string,
  checkIn: string,
  checkOut: string,
  guests: number
) {
  const overlappingResult = await db.execute<{ room_id: string }>(
    sql`SELECT room_id FROM bookings
        WHERE tenant_id = ${tenantId}::uuid
          AND status IN ('confirmed', 'checked_in')
          AND check_in < ${checkOut}::date
          AND check_out > ${checkIn}::date`
  );

  const bookedRoomIds = overlappingResult.rows.map((row) => row.room_id);

  if (bookedRoomIds.length > 0) {
    return db
      .select()
      .from(rooms)
      .where(
        and(
          eq(rooms.tenantId, tenantId),
          eq(rooms.isActive, true),
          gte(rooms.capacity, guests),
          notInArray(rooms.id, bookedRoomIds)
        )
      )
      .orderBy(asc(rooms.sortOrder));
  }

  return db
    .select()
    .from(rooms)
    .where(
      and(
        eq(rooms.tenantId, tenantId),
        eq(rooms.isActive, true),
        gte(rooms.capacity, guests)
      )
    )
    .orderBy(asc(rooms.sortOrder));
}
