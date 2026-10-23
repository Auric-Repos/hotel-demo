import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { tenants, type Tenant } from "@/server/db/schema";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type DashboardAccess =
  | { status: "signed-out" }
  | { status: "no-access"; userId: string }
  | { status: "ok"; userId: string; tenant: Tenant };

/**
 * The single gate for every dashboard page and action. Signed in is not
 * enough: the user's public metadata must point at a real tenant. Server
 * actions must call this themselves, never trust that the page did.
 */
export async function getDashboardAccess(): Promise<DashboardAccess> {
  const { userId } = await auth();
  if (!userId) return { status: "signed-out" };

  const user = await currentUser();
  const tenantId = user?.publicMetadata?.tenantId;
  if (typeof tenantId !== "string" || !UUID_PATTERN.test(tenantId)) {
    return { status: "no-access", userId };
  }

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  return tenant
    ? { status: "ok", userId, tenant }
    : { status: "no-access", userId };
}