import { ArrowRightIcon, ClockIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Photo } from "@/components/site/photo";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

type Props = {
  href: string;
  name: string;
  image: string;
  durationLabel: string;
  priceLabel: string;
  /** Larger tile in the bento layout (desktop only). */
  featured?: boolean;
  className?: string;
};

/** Image-led card: the text sits on the photo, unlike the room cards. */
export function ExperienceCard({
  href,
  name,
  image,
  durationLabel,
  priceLabel,
  featured = false,
  className,
}: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-border/60 bg-secondary shadow-sm",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/15",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        focusRing,
        className,
      )}
    >
      <Photo
        src={image}
        alt={name}
        fill
        sizes={
          featured
            ? "(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 80vw"
            : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw"
        }
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />

      {/* Readability gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/85 via-ink/25 to-transparent transition-opacity duration-300 group-hover:from-ink/90"
      />

      {/* Duration (start) and price (end) */}
      <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-md">
          <ClockIcon aria-hidden className="size-3.5 text-muted-foreground" />
          {durationLabel}
        </span>
        <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
          {priceLabel}
        </span>
      </div>

      {/* Title + arrow */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
        <h3
          className={cn(
            "font-heading leading-snug text-balance text-sand",
            featured ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl",
          )}
        >
          {name}
        </h3>
        <span
          aria-hidden
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-full",
            "border border-sand/40 bg-sand/10 text-sand backdrop-blur-md rtl:-scale-x-100",
            "transition-all duration-300",
            "group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground",
            "motion-reduce:transition-none",
          )}
        >
          <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
        </span>
      </div>
    </Link>
  );
}