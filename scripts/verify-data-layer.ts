import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { sql, eq } from "drizzle-orm";
import { db } from "../src/server/db";
import { bookings, rooms } from "../src/server/db/schema";
import { DEMO_TENANT_ID } from "../src/lib/tenant";
import { getRooms, getAvailableRooms } from "../src/server/queries/rooms";
import { listBookings } from "../src/server/queries/bookings";
import { listExperiences } from "../src/server/queries/experiences";
import { createBooking, setBookingStatus } from "../src/server/actions/bookings";

function getTodayCairo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
  }).format(new Date());
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function verify() {
  console.log("=== Starting Data Layer Verification ===");
  let hasFailure = false;

  const today = getTodayCairo();

  const [testRoom] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.tenantId, DEMO_TENANT_ID))
    .limit(1);

  if (!testRoom) {
    console.error("[FAIL] Prerequisites: Demo room not found. Did you run seed?");
    process.exit(1);
  }

  try {
    // 1. Tenant Isolation
    const randomTenantId = "99999999-9999-9999-9999-999999999999";
    const [isoRooms, isoBookings, isoExps] = await Promise.all([
      getRooms(randomTenantId),
      listBookings(randomTenantId),
      listExperiences(randomTenantId),
    ]);

    if (
      isoRooms.length === 0 &&
      isoBookings.length === 0 &&
      isoExps.length === 0
    ) {
      console.log("[PASS] Tenant isolation: queries with random tenantId return nothing");
    } else {
      console.error("[FAIL] Tenant isolation: data leaked for random tenantId");
      hasFailure = true;
    }

    // 2. Overlap Protection
    const checkInA = addDays(today, 25);
    const checkOutA = addDays(today, 30);
    const checkInB = addDays(today, 27);
    const checkOutB = addDays(today, 32);

    // Direct insert to set custom TEST- reference and avoid pre-check
    const [bA] = await db
      .insert(bookings)
      .values({
        tenantId: DEMO_TENANT_ID,
        roomId: testRoom.id,
        reference: "TEST-OVL-A",
        checkIn: checkInA,
        checkOut: checkOutA,
        adults: 2,
        guestName: "Test Guest A",
        guestPhone: "+10000000001",
        status: "pending",
        totalPriceCents: 5 * testRoom.basePriceCents,
      })
      .returning();

    const [bB] = await db
      .insert(bookings)
      .values({
        tenantId: DEMO_TENANT_ID,
        roomId: testRoom.id,
        reference: "TEST-OVL-B",
        checkIn: checkInB,
        checkOut: checkOutB,
        adults: 2,
        guestName: "Test Guest B",
        guestPhone: "+10000000002",
        status: "pending",
        totalPriceCents: 5 * testRoom.basePriceCents,
      })
      .returning();

    const confirmA = await setBookingStatus(DEMO_TENANT_ID, bA.id, "confirmed");
    const confirmB = await setBookingStatus(DEMO_TENANT_ID, bB.id, "confirmed");

    if (
      confirmA.ok === true &&
      confirmB.ok === false &&
      confirmB.error === "dates_unavailable"
    ) {
      console.log(
        "[PASS] Overlap protection: confirming two overlapping bookings on one room returns dates_unavailable"
      );
    } else {
      console.error(
        "[FAIL] Overlap protection: expected dates_unavailable on overlapping confirmation, got:",
        confirmB
      );
      hasFailure = true;
    }

    // 3. Availability check
    // bA is confirmed for [today+25, today+30)
    const availDuringA = await getAvailableRooms(
      DEMO_TENANT_ID,
      addDays(today, 26),
      addDays(today, 29),
      1
    );
    const roomIsExcluded = !availDuringA.some((r) => r.id === testRoom.id);

    const availOutsideA = await getAvailableRooms(
      DEMO_TENANT_ID,
      addDays(today, 35),
      addDays(today, 38),
      1
    );
    const roomIsIncluded = availOutsideA.some((r) => r.id === testRoom.id);

    if (roomIsExcluded && roomIsIncluded) {
      console.log(
        "[PASS] Availability: room with confirmed stay is excluded for those dates, included otherwise"
      );
    } else {
      console.error(
        "[FAIL] Availability: room availability check failed. Excluded:",
        roomIsExcluded,
        "Included:",
        roomIsIncluded
      );
      hasFailure = true;
    }

    // 4. Price Integrity
    // Client sends fake price (100 cents = $1.00)
    const createRes = await createBooking(DEMO_TENANT_ID, {
      roomId: testRoom.id,
      checkIn: addDays(today, 45),
      checkOut: addDays(today, 48), // 3 nights
      adults: 2,
      guestName: "Price Integrity Tester",
      guestPhone: "+10000000003",
      clientPrice: 100, // should be ignored
    });

    if (createRes.ok === true) {
      const expectedTotal = 3 * testRoom.basePriceCents;
      if (createRes.booking.totalPriceCents === expectedTotal) {
        console.log(
          "[PASS] Price integrity: createBooking computes total from room base price, ignoring client price"
        );
        // Rename reference to TEST- for cleanup
        await db
          .update(bookings)
          .set({ reference: "TEST-PRC-" + createRes.booking.id.slice(0, 8) })
          .where(eq(bookings.id, createRes.booking.id));
      } else {
        console.error(
          `[FAIL] Price integrity: expected ${expectedTotal}, got ${createRes.booking.totalPriceCents}`
        );
        hasFailure = true;
      }
    } else {
      console.error("[FAIL] Price integrity: createBooking failed:", createRes);
      hasFailure = true;
    }

    // 5. Status Transitions
    const [bTrans] = await db
      .insert(bookings)
      .values({
        tenantId: DEMO_TENANT_ID,
        roomId: testRoom.id,
        reference: "TEST-TRANS",
        checkIn: addDays(today, 55),
        checkOut: addDays(today, 58),
        adults: 2,
        guestName: "Transition Tester",
        guestPhone: "+10000000004",
        status: "pending",
        totalPriceCents: 3 * testRoom.basePriceCents,
      })
      .returning();

    // Transition pending -> declined (valid)
    const decRes = await setBookingStatus(DEMO_TENANT_ID, bTrans.id, "declined");
    // Transition declined -> confirmed (invalid: not allowed)
    const confFromDecRes = await setBookingStatus(
      DEMO_TENANT_ID,
      bTrans.id,
      "confirmed"
    );

    if (
      decRes.ok === true &&
      confFromDecRes.ok === false &&
      confFromDecRes.error === "invalid_transition"
    ) {
      console.log(
        "[PASS] Transitions: invalid status transition (declined -> confirmed) is rejected"
      );
    } else {
      console.error(
        "[FAIL] Transitions: expected declined->confirmed to be rejected, got:",
        confFromDecRes
      );
      hasFailure = true;
    }
  } finally {
    // Clean up ONLY rows starting with TEST-
    await db.delete(bookings).where(sql`reference LIKE 'TEST-%'`);
    console.log("Cleaned up test bookings (TEST-*).");
  }

  if (hasFailure) {
    console.error("=== Verification Failed ===");
    process.exit(1);
  } else {
    console.log("=== All Verification Checks Passed ===");
    process.exit(0);
  }
}

verify().catch((err) => {
  console.error("Verification crashed:", err);
  process.exit(1);
});

