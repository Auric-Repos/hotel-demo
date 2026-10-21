"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChevronDownIcon, LanguagesIcon } from "lucide-react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Switches between en and ar while staying on the current page.
 * Shows "العربية" on the English site and "English" on the Arabic site.
 * Single glass-control pill, same height as the other header controls (h-9).
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const isEn = locale === routing.locales[0];
  const nextLocale = isEn ? routing.locales[1] : routing.locales[0];

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      aria-label={t("switchLanguage")}
      className={cn(
        "glass-control inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-sm text-foreground whitespace-nowrap",
        "transition-colors duration-200 hover:bg-accent active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "motion-reduce:transition-none",
        className
      )}
    >
      <LanguagesIcon aria-hidden="true" className="size-5" />
      <span>{t("switchLanguage")}</span>
      <ChevronDownIcon aria-hidden="true" className="size-4 opacity-70" />
    </button>
  );
}
