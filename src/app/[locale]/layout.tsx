import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  IBM_Plex_Sans_Arabic,
  Inter,
  Noto_Naskh_Arabic,
} from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { arSA } from "@clerk/localizations";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_CONFIG } from "@/lib/constants";
import "../globals.css";
import { AppToaster } from "@/components/site/app-toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic-sans",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-arabic-serif",
  subsets: ["arabic"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    title: SITE_CONFIG.name,
    description: t("brandTagline"),
    alternates: {
      languages: { en: "/en", ar: "/ar" },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const isAr = locale === "ar";

  const fontVariables = [
    inter.variable,
    cormorant.variable,
    ibmPlexArabic.variable,
    notoNaskhArabic.variable,
  ].join(" ");

  return (
    <ClerkProvider localization={isAr ? arSA : undefined}>
      <html
        lang={locale}
        dir={isAr ? "rtl" : "ltr"}
        className={`${fontVariables} locale-${locale} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-sand text-ink">
          <NextIntlClientProvider messages={messages}>
            {children}
            <AppToaster />
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}