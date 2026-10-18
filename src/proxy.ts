import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing, type Locale } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

/** Paths (relative to the locale prefix) that require a signed-in user. */
const PROTECTED_PREFIXES = ["/dashboard", "/platform"];

/**
 * Splits the pathname into the detected locale and the remaining path.
 * Handles both prefixed (/en/dashboard) and unprefixed (/dashboard) forms.
 */
function splitLocale(pathname: string): { locale: Locale; rest: string } {
  const [, first, ...rest] = pathname.split("/");
  if ((routing.locales as readonly string[]).includes(first)) {
    return { locale: first as Locale, rest: `/${rest.join("/")}` };
  }
  return { locale: routing.defaultLocale, rest: pathname };
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;
  const { locale, rest } = splitLocale(pathname);

  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => rest === prefix || rest.startsWith(`${prefix}/`)
  );

  if (needsAuth) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL(`/${locale}/sign-in`, request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return handleI18nRouting(request);
});

export const config = {
  matcher: [
    "/((?!api|_next|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};