"use client";

import { useLocale, useTranslations } from "next-intl";
import { LanguagesIcon } from "lucide-react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Switches between en and ar while staying on the current page
 * (and keeping its query string, e.g. ?tab=pending).
 * Shows "العربية" on the English site and "English" on the Arabic site.
 */
export function LanguageSwitcher({
  className,
  collapseOnMobile = false,
}: {
  className?: string;
  /** Icon-only below `sm`. Use in tight headers like the dashboard's. */
  collapseOnMobile?: boolean;
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const isEn = locale === routing.locales[0];
  const nextLocale = isEn ? routing.locales[1] : routing.locales[0];

  function switchLocale() {
    // Read at click time: no useSearchParams, so no Suspense requirement.
    const query = Object.fromEntries(
      new URLSearchParams(window.location.search),
    );
    router.replace({ pathname, query }, { locale: nextLocale });
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={t("switchLanguage")}
      className={cn(
        "glass-control inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-sm text-foreground whitespace-nowrap",
        "transition-all duration-200 hover:bg-accent active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        className,
      )}
    >
      <LanguagesIcon aria-hidden="true" className="size-4" />
      <span
        lang={nextLocale}
        className={cn(collapseOnMobile && "sr-only sm:not-sr-only")}
      >
        {t("switchLanguage")}
      </span>
    </button>
  );
}