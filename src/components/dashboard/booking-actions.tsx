"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AlertTriangleIcon, CheckIcon, Loader2Icon, XIcon } from "lucide-react";

import {
  updateBookingStatusAction,
  type BookingAction,
} from "@/server/actions/dashboard-actions";
import { cn } from "@/lib/utils";

type Status =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "declined"
  | "no_show";

// Which actions make sense for each status.
const ACTIONS: Partial<Record<Status, BookingAction[]>> = {
  pending: ["confirm", "decline"],
  confirmed: ["cancel"],
};

const buttonBase = cn(
  "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium",
  "transition-all duration-200 motion-reduce:transition-none",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "disabled:pointer-events-none disabled:opacity-60",
);

const outlineDanger = cn(
  buttonBase,
  "border border-border/70 bg-background/60 text-foreground",
  "hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive",
);

export function BookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: Status;
}) {
  const t = useTranslations("dashboard.actions");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [asking, setAsking] = useState<BookingAction | null>(null);
  const noRef = useRef<HTMLButtonElement>(null);

  // Put focus on the safe option so a stray Enter can't confirm a cancellation.
  useEffect(() => {
    if (asking) noRef.current?.focus();
  }, [asking]);

  const available = ACTIONS[status];
  if (!available) return null;

  const run = (action: BookingAction) => {
    startTransition(async () => {
      try {
        const result = await updateBookingStatusAction(bookingId, action);
        if (result.ok) {
          toast.success(t(`done.${action}`));
          router.refresh();
        } else {
          toast.error(t(`errors.${result.error}`));
        }
      } catch {
        toast.error(t("errors.unknown"));
      }
      setAsking(null);
    });
  };

  // Inline "are you sure?" for the actions that are hard to take back.
  if (asking) {
    return (
      <div
        role="group"
        aria-label={t(`ask.${asking}`)}
        className="flex w-full flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 sm:w-auto sm:flex-row sm:items-center"
      >
        <span className="flex items-center gap-2 text-sm text-foreground">
          <AlertTriangleIcon aria-hidden className="size-4 shrink-0 text-destructive" />
          {t(`ask.${asking}`)}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(asking)}
            className={cn(
              buttonBase,
              "flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:flex-none",
            )}
          >
            {isPending && <Loader2Icon aria-hidden className="size-4 animate-spin" />}
            {t("yes")}
          </button>
          <button
            ref={noRef}
            type="button"
            disabled={isPending}
            onClick={() => setAsking(null)}
            className={cn(
              buttonBase,
              "flex-1 border border-border/70 bg-background text-foreground hover:bg-primary/5 sm:flex-none",
            )}
          >
            {t("no")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {available.includes("confirm") && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run("confirm")}
          className={cn(
            buttonBase,
            "btn-shine bg-primary text-primary-foreground shadow-sm",
            "hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/30",
            "active:translate-y-0 active:scale-[0.98] motion-reduce:hover:translate-y-0",
          )}
        >
          {isPending ? (
            <Loader2Icon aria-hidden className="size-4 animate-spin" />
          ) : (
            <CheckIcon aria-hidden className="size-4" />
          )}
          {t("confirm")}
        </button>
      )}
      {available.includes("decline") && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setAsking("decline")}
          className={outlineDanger}
        >
          <XIcon aria-hidden className="size-4" />
          {t("decline")}
        </button>
      )}
      {available.includes("cancel") && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setAsking("cancel")}
          className={outlineDanger}
        >
          <XIcon aria-hidden className="size-4" />
          {t("cancel")}
        </button>
      )}
    </div>
  );
}