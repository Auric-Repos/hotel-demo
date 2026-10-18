import "server-only";
import { and, eq, asc } from "drizzle-orm";
import { db } from "@/server/db";
import { experiences } from "@/server/db/schema";

export async function listExperiences(tenantId: string) {
  return db
    .select()
    .from(experiences)
    .where(and(eq(experiences.tenantId, tenantId), eq(experiences.isActive, true)))
    .orderBy(asc(experiences.sortOrder));
}

