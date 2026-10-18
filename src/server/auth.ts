import "server-only";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCurrentTenant } from "@/lib/tenant";

export async function requireStaff(): Promise<{ userId: string; tenantId: string }> {
  const { userId } = await auth();

  if (!userId) {
    redirect({ href: "/sign-in", locale: routing.defaultLocale });
  }

  const tenant = await getCurrentTenant();

  // TODO: User-to-tenant mapping is required before a second client.
  return {
    userId: userId!,
    tenantId: tenant.id,
  };
}
