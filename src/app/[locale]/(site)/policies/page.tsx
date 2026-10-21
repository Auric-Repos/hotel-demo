import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

/** Minimal V1 stub so the footer "Policies" link does not 404. */
export default async function PoliciesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("policies");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      <h1 className="font-heading text-3xl text-ink md:text-4xl">{t("title")}</h1>
      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        {t("intro")}
      </p>
    </div>
  );
}
