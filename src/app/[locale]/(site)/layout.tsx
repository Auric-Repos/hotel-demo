import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppButton } from "@/components/site/whatsapp-button";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function SiteLayout({ children, params }: Props) {
  const { locale } = await params;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {/* `locale` lets SiteFooter call setRequestLocale before reading
          translations, same as every page — otherwise next-intl falls back
          to headers() and blocks prerendering under cacheComponents. */}
      <SiteFooter locale={locale} />
      <WhatsAppButton />
    </>
  );
}
