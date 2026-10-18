import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({
      status: "ok",
      db: true,
    });
  } catch {
    return NextResponse.json(
      { status: "error", db: false },
      { status: 500 }
    );
  }
}
