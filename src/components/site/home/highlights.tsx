import { getTranslations, setRequestLocale } from "next-intl/server";

import { HIGHLIGHTS } from "@/lib/constants";

/** Quiet strip of four promises; icons live in constants, labels in messages. */
export async function Highlights({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <section className="border-y border-border/60 bg-sand">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-6 gap-y-5 px-4 py-8 sm:px-6 md:grid-cols-4 md:py-10 lg:px-8">
        {HIGHLIGHTS.map(({ key, icon: Icon }) => (
          <div key={key} className="flex items-center gap-3">
            <Icon aria-hidden className="size-5 shrink-0 text-gold" />
            <span className="text-sm text-ink md:text-base">{t(key)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
