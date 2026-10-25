import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { tenantContact } from "@/server/db/schema";

export async function getTenantContact(tenantId: string) {
  const [row] = await db
    .select()
    .from(tenantContact)
    .where(eq(tenantContact.tenantId, tenantId))
    .limit(1);
  return row ?? null;
}