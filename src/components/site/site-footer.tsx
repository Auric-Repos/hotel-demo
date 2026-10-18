"use client";

import { useTranslations } from "next-intl";
import { CalendarDaysIcon, MessageCircleIcon } from "lucide-react";

import {
  CinematicFooter,
  type FooterAction,
} from "@/components/ui/motion-footer";
import { FOOTER_QUICK_LINKS, HIGHLIGHTS, SITE_CONFIG } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Hotel footer: booking + WhatsApp as primary CTAs, quick nav pills underneath.
 *
 * This module stays a Client Component because `icon` holds actual Lucide
 * components (forwardRef objects). `CinematicFooter` is a Client Component, so
 * handing it a component reference from a Server Component would throw
 * "Functions cannot be passed directly to Client Components" while prerendering.
 */
export function SiteFooter() {
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const tWhatsapp = useTranslations("whatsapp");

  // Localized hotel name from messages/{en,ar}.json (same source as <title>).
  const brand = tCommon("brandName");

  const actions: FooterAction[] = [
    {
      label: tNav("bookNow"),
      href: "/book",
      icon: CalendarDaysIcon,
    },
    {
      // Same prefilled WhatsApp handoff as WhatsAppButton; booking is
      // confirmed in WhatsApp per the flow in constants.ts (HOW_IT_WORKS step 3).
      label: tWhatsapp("label"),
      href: getWhatsAppUrl(tWhatsapp("prefill", { hotel: SITE_CONFIG.name })),
      icon: MessageCircleIcon,
    },
  ];

  return (
    <CinematicFooter
      brand={brand}
      giantText={brand.toUpperCase()}
      heading={tCommon("brandTagline")}
      marqueeItems={HIGHLIGHTS.map((highlight) => highlight.label)}
      actions={actions}
      links={FOOTER_QUICK_LINKS}
      // Hardcoded: `new Date()` is flagged as an unstable value in Client
      // Components under `cacheComponents` and fails `next build`.
      copyright={`© 2026 ${brand}`}
    />
  );
}

export default SiteFooter;

