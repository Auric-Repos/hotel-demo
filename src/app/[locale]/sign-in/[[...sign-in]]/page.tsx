import { SignIn } from "@clerk/nextjs";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SITE_CONFIG } from "@/lib/constants";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Clerk's <SignIn /> reads cookies/headers at render time, which prevents
// static prerendering under `cacheComponents`. Opt this route into
// blocking (on-demand) rendering instead of failing the build.
export const instant = false;

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SignInPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-sand px-4 py-12">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <p className="font-heading text-3xl text-ink">{t("signInTitle", { hotel: SITE_CONFIG.name })}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("signInSubtitle")}
          </p>
        </header>

        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#b8975a",
              colorBackground: "#fbf8f2",
              colorDanger: "#a33c2e",
              borderRadius: "0.5rem",
            },
            elements: {
              rootBox: "mx-auto w-full justify-center",
              card: "w-full border border-border bg-card shadow-none",
              headerTitle: "font-heading text-ink",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "border-border bg-background text-ink",
              formButtonPrimary: "bg-gold text-ink hover:bg-gold/90",
              footerActionLink: "text-gold hover:text-gold/80",
            },
          }}
        />

        <p className="mt-6 text-center text-sm">
          <Link
            href="/"
            className="text-gold underline-offset-4 hover:underline"
          >
            {t("backToSite")}
          </Link>
        </p>
      </div>
    </main>
  );
}

