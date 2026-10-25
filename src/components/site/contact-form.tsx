"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const fieldClass = cn(
  "w-full rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground",
  "placeholder:text-muted-foreground/70 transition-all duration-200",
  "hover:border-primary/40 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "motion-reduce:transition-none",
);

export function ContactForm({
  whatsappDigits,
  hotelName,
}: {
  whatsappDigits: string;
  hotelName: string;
}) {
  const t = useTranslations("contact.form");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanMessage) {
      setError(true);
      return;
    }
    setError(false);

    const text = t("prefill", {
      hotel: hotelName,
      name: cleanName,
      message: cleanMessage,
    });
    window.open(
      `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="contact-name"
          className="mb-1.5 block text-sm text-muted-foreground"
        >
          {t("name")}
        </label>
        <input
          id="contact-name"
          dir="auto"
          autoComplete="name"
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={error && !name.trim()}
          className={fieldClass}
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-sm text-muted-foreground"
        >
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          dir="auto"
          rows={5}
          maxLength={1000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={error && !message.trim()}
          className={cn(fieldClass, "resize-none")}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {t("required")}
        </p>
      )}

      <button
        type="submit"
        className={cn(
          "group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/30",
          "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:translate-y-0 active:scale-[0.98]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/2 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[300%] rtl:translate-x-full rtl:group-hover:-translate-x-[300%] motion-reduce:hidden"
        />
        <MessageCircleIcon aria-hidden className="relative size-4" />
        <span className="relative">{t("send")}</span>
      </button>
    </form>
  );
}