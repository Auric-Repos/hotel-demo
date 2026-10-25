export const DEFAULT_TENANT_SLUG = "demo-hotel";
export const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Returns the active tenant identifier.
 * In multi-tenant deployments, this resolves from subdomain, custom domain, or session.
 */
export async function getCurrentTenantId(): Promise<string> {
  return DEMO_TENANT_ID;
}

export async function getCurrentTenant() {
  return {
    id: DEMO_TENANT_ID,
    slug: DEFAULT_TENANT_SLUG,
    name: "Auric Hotel Aswan",
    whatsappNumber: "201104328077",
    contactEmail: "auricdevs@gmail.com",
    defaultLocale: "en" as const,
    currency: "USD",
    timezone: "Africa/Cairo",
  };
}
