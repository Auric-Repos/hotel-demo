import { getTranslations } from "next-intl/server";
import { LockIcon } from "lucide-react";

export async function NoAccessCard({ userId }: { userId: string }) {
  const t = await getTranslations("dashboard");

  return (
    <div className="relative mx-auto max-w-md rounded-3xl border border-border/60 bg-card/80 p-8 text-center shadow-xl shadow-primary/10 backdrop-blur-xl">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
      />
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/30">
        <LockIcon aria-hidden className="size-6 text-foreground" />
      </span>
      <h1 className="mt-5 font-heading text-2xl text-foreground">
        {t("noAccess.title")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {t("noAccess.body")}
      </p>
      <p className="mt-6 text-xs text-muted-foreground">{t("noAccess.userId")}</p>
      <p
        dir="ltr"
        className="mt-1.5 select-all break-all rounded-lg bg-background/70 px-3 py-2 font-mono text-xs text-foreground ring-1 ring-border/50"
      >
        {userId}
      </p>
    </div>
  );
}