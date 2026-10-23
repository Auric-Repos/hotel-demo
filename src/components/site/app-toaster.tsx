"use client";

import type { CSSProperties } from "react";
import { Toaster } from "sonner";
import { useLocale } from "next-intl";

export function AppToaster() {
  const locale = useLocale();

  return (
    <Toaster
      position="top-center"
      dir={locale === "ar" ? "rtl" : "ltr"}
      closeButton
      duration={6000}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1rem",
        } as CSSProperties
      }
    />
  );
}