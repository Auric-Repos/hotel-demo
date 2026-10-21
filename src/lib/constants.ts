import type { LucideIcon } from "lucide-react";
import {
  BedDoubleIcon,
  CalendarDaysIcon,
  CarIcon,
  CompassIcon,
  CoffeeIcon,
  MessageCircleIcon,
  WavesIcon,
} from "lucide-react";

/**
 * Single source of truth for hotel identity. Swap these per client/prospect.
 * WhatsApp number: digits only, with country code, no "+" (used in wa.me links).
 */
export const SITE_CONFIG = {
  name: "Demo Hotel Aswan",
  tagline: "A quiet stay on the Nile",
  whatsappNumber: "201000000000", // TODO: replace with the hotel's real number
  email: "reservations@example.com", // TODO: replace
  address: "", // TODO: replace with the hotel's street address
  mapsUrl: "", // TODO: replace with the hotel's Google Maps share link
  facebookUrl: "", // TODO: replace with the hotel's Facebook page
  instagramUrl: "", // TODO: replace with the hotel's Instagram profile
} as const;

/** Labels are message keys: resolve them with getTranslations/useTranslations. */
export const HIGHLIGHTS: { key: string; icon: LucideIcon }[] = [
  { key: "highlights.nileViews", icon: WavesIcon },
  { key: "highlights.dailyBreakfast", icon: CoffeeIcon },
  { key: "highlights.airportTransfer", icon: CarIcon },
  { key: "highlights.localExperiences", icon: CompassIcon },
];

/**
 * DEMO PLACEHOLDERS: replace with the hotel's real numbers before presenting
 * them as fact. Never show invented statistics as real to a client's guests.
 */
export const GALLERY_STATS = [
  { value: "6", key: "gallery.stats.rooms" },
  { value: "6", key: "gallery.stats.experiences" },
  { value: "4.8/5", key: "gallery.stats.rating" },
] as const;

/** Use photos you own or have written permission to use (the hotel's own, or licensed stock). */
export const GALLERY_IMAGES = [
  { src: "/gallery-1.jpg", key: "gallery.images.g1" },
  { src: "/gallery-2.jpg", key: "gallery.images.g2" },
  { src: "/gallery-3.jpg", key: "gallery.images.g3" },
  { src: "/gallery-4.jpg", key: "gallery.images.g4" },
] as const;

/* Local files in /public/videos. Keep each loop short and compressed (a few MB). */
export const SHOWCASE_BG_VIDEO_SRC = "/videos/showcase.mp4";

/**
 * Hrefs have no locale prefix on purpose: render them with the locale-aware
 * Link from src/i18n/navigation so /en and /ar are added automatically.
 */
export const CENTER_NAV_LINKS = [
  { key: "nav.home", href: "/" },
  { key: "nav.rooms", href: "/rooms", chevron: true },
  { key: "nav.experiences", href: "/experiences" },
  { key: "nav.contact", href: "/contact" },
] as const;

export const FOOTER_QUICK_LINKS = [
  { key: "nav.rooms", href: "/rooms" },
  { key: "nav.experiences", href: "/experiences" },
  { key: "nav.bookNow", href: "/book" },
  { key: "nav.contact", href: "/contact" },
  // /policies is a minimal stub page created in phase 3A.
  { key: "nav.policies", href: "/policies" },
] as const;

/**
 * Name kept for component compatibility with the original file. It now holds
 * featured experiences; rename to FEATURED_EXPERIENCES when convenient.
 */
export const FEATURED_STYLES = [
  "Felucca Sunset",
  "Philae Temple",
  "Abu Simbel Day Trip",
  "Nubian Village",
] as const;

export const WORKFLOW_STYLE_PREVIEW = [
  FEATURED_STYLES[0],
  FEATURED_STYLES[1],
  FEATURED_STYLES[2],
] as const;

export type MarketingTestimonial = {
  /** Message key namespace: text and role live in messages under `key`. */
  key: string;
  image: string;
  name: string;
};

/**
 * DEMO PLACEHOLDERS: these are sample reviews, not real guests. Before a client
 * goes live, replace them with real reviews (Google, TripAdvisor) with permission,
 * or remove the section. Remote avatars need images.unsplash.com in
 * next.config images.remotePatterns if you render them with next/image.
 */
export const TESTIMONIALS: MarketingTestimonial[] = [
  {
    key: "home.reviews.r1",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    name: "Hannah Keller",
  },
  {
    key: "home.reviews.r2",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    name: "Omar Fathy",
  },
  {
    key: "home.reviews.r3",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    name: "Claire Dubois",
  },
  {
    key: "home.reviews.r4",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    name: "James Whitaker",
  },
  {
    key: "home.reviews.r5",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80",
    name: "Yasmin Adel",
  },
  {
    key: "home.reviews.r6",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80",
    name: "Elena Rossi",
  },
  {
    key: "home.reviews.r7",
    image:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=200&q=80",
    name: "Daniel Novak",
  },
  {
    key: "home.reviews.r8",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    name: "Mariam Hassan",
  },
  {
    key: "home.reviews.r9",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    name: "Lucas Pereira",
  },
];

export const TESTIMONIAL_COLUMNS = [
  TESTIMONIALS.slice(0, 3),
  TESTIMONIALS.slice(3, 6),
  TESTIMONIALS.slice(6, 9),
];

export type HowItWorksStep = {
  stepKey: string;
  titleKey: string;
  bodyKey: string;
  icon: LucideIcon;
  featured?: boolean;
};

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    stepKey: "home.steps.s1.step",
    titleKey: "home.steps.s1.title",
    bodyKey: "home.steps.s1.body",
    icon: CalendarDaysIcon,
  },
  {
    stepKey: "home.steps.s2.step",
    titleKey: "home.steps.s2.title",
    bodyKey: "home.steps.s2.body",
    icon: BedDoubleIcon,
  },
  {
    stepKey: "home.steps.s3.step",
    titleKey: "home.steps.s3.title",
    bodyKey: "home.steps.s3.body",
    icon: MessageCircleIcon,
    featured: true,
  },
];