import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function BookPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <h1 className="font-heading text-3xl text-ink">{t("bookNow")}</h1>
    </main>
  );
}

