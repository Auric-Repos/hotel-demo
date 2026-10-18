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
} as const;

export const HIGHLIGHTS: { label: string; icon: LucideIcon }[] = [
  { label: "Nile Views", icon: WavesIcon },
  { label: "Daily Breakfast", icon: CoffeeIcon },
  { label: "Airport Transfer", icon: CarIcon },
  { label: "Local Experiences", icon: CompassIcon },
];

/**
 * DEMO PLACEHOLDERS: replace with the hotel's real numbers before presenting
 * them as fact. Never show invented statistics as real to a client's guests.
 */
export const GALLERY_STATS = [
  { value: "6", label: "Rooms and suites" },
  { value: "6", label: "Curated experiences" },
  { value: "4.8/5", label: "Guest rating" },
] as const;

/** Use photos you own or have written permission to use (the hotel's own, or licensed stock). */
export const GALLERY_IMAGES = [
  { src: "/gallery-1.jpg", alt: "Nile-view suite at sunset" },
  { src: "/gallery-2.jpg", alt: "Rooftop terrace overlooking the river" },
  { src: "/gallery-3.jpg", alt: "Felucca sailing at golden hour" },
  { src: "/gallery-4.jpg", alt: "Breakfast served in the hotel courtyard" },
] as const;

/**
 * Local files in /public/videos. Keep each loop short and compressed (a few MB),
 * and add a poster image so the hero never loads blank on slow connections.
 */
export const HERO_VIDEO_SRC_PC = "/videos/hero-desktop.mp4";
export const HERO_VIDEO_SRC_MP = "/videos/hero-mobile.mp4";

export const SHOWCASE_BG_VIDEO_SRC = "/videos/showcase.mp4";

/**
 * Hrefs have no locale prefix on purpose: render them with the locale-aware
 * Link from src/i18n/navigation so /en and /ar are added automatically.
 */
export const CENTER_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms", chevron: true },
  { label: "Experiences", href: "/experiences" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_QUICK_LINKS = [
  { label: "Rooms", href: "/rooms" },
  { label: "Experiences", href: "/experiences" },
  { label: "Book Now", href: "/book" },
  { label: "Contact", href: "/contact" },
  // /policies is a V1 page: create a simple stub or remove this link for the demo.
  { label: "Policies", href: "/policies" },
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
  text: string;
  image: string;
  name: string;
  role: string;
};

/**
 * DEMO PLACEHOLDERS: these are sample reviews, not real guests. Before a client
 * goes live, replace them with real reviews (Google, TripAdvisor) with permission,
 * or remove the section. Remote avatars need images.unsplash.com in
 * next.config images.remotePatterns if you render them with next/image.
 */
export const TESTIMONIALS: MarketingTestimonial[] = [
  {
    text: "We woke up to the Nile every morning. The room was quiet, spotless, and exactly as pictured.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    name: "Hannah Keller",
    role: "Honeymoon stay, Germany",
  },
  {
    text: "Booking was effortless. We sent a request and had a confirmation on WhatsApp within the hour.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    name: "Omar Fathy",
    role: "Weekend getaway, Cairo",
  },
  {
    text: "The felucca at sunset was the highlight of our trip, and the hotel arranged everything for us.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    name: "Claire Dubois",
    role: "Three nights, France",
  },
  {
    text: "The early transfer to Abu Simbel was handled perfectly. The driver was on time and very professional.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    name: "James Whitaker",
    role: "Abu Simbel day trip, United Kingdom",
  },
  {
    text: "Warm, attentive staff who never made us feel rushed. It felt like staying with family.",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80",
    name: "Yasmin Adel",
    role: "Family stay, Alexandria",
  },
  {
    text: "Breakfast on the terrace with the river in front of us is something we will remember for years.",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80",
    name: "Elena Rossi",
    role: "Five nights, Italy",
  },
  {
    text: "Clear information before arrival, a smooth check-in, and a room that matched the photos.",
    image:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=200&q=80",
    name: "Daniel Novak",
    role: "Solo traveller, Canada",
  },
  {
    text: "A calm, beautiful place in the middle of a busy trip. The Nubian village visit was a lovely extra.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    name: "Mariam Hassan",
    role: "Long weekend, Cairo",
  },
  {
    text: "Great value for the location. Easy to reach the temples, the Corniche, and the train station.",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    name: "Lucas Pereira",
    role: "Four nights, Brazil",
  },
];

export const TESTIMONIAL_COLUMNS = [
  TESTIMONIALS.slice(0, 3),
  TESTIMONIALS.slice(3, 6),
  TESTIMONIALS.slice(6, 9),
];

export type HowItWorksStep = {
  step: string;
  title: string;
  body: string;
  icon: LucideIcon;
  featured?: boolean;
};

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: "Step 1",
    title: "Choose your dates",
    body: "Tell us when you arrive and how many guests are travelling. No account and no payment needed to start.",
    icon: CalendarDaysIcon,
  },
  {
    step: "Step 2",
    title: "Pick your room",
    body: "Browse Nile-view and garden rooms, add a sunset felucca or a temple visit, and send your request in a minute.",
    icon: BedDoubleIcon,
  },
  {
    step: "Step 3",
    title: "Confirm on WhatsApp",
    body: "Our reception reviews your request and confirms it directly on WhatsApp, with your reference number and arrival details.",
    icon: MessageCircleIcon,
    featured: true,
  },
];