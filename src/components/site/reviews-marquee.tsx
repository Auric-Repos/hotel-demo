import { QuoteIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type ReviewItem = {
  id: string;
  name: string;
  role: string;
  text: string;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Single testimonial card, shared by the static grid and the marquee. */
export function ReviewCard({
  review,
  focusable = true,
  className,
}: {
  review: ReviewItem;
  focusable?: boolean;
  className?: string;
}) {
  const initial = Array.from(review.name.trim())[0] ?? "";

  return (
    <figure
      tabIndex={focusable ? 0 : -1}
      className={cn(
        "group relative flex flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        focusRing,
        className,
      )}
    >
      <QuoteIcon aria-hidden className="size-6 text-primary/30 rtl:-scale-x-100" />

      <blockquote className="mt-4 flex-1">
        <p className="text-sm leading-relaxed text-pretty text-foreground sm:text-base">
          {review.text}
        </p>
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
        <span
          aria-hidden
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-full",
            "border border-primary/40 bg-primary/10 font-heading text-primary",
            "transition-colors duration-300 motion-reduce:transition-none",
            "group-hover:bg-primary group-hover:text-primary-foreground",
          )}
        >
          {initial}
        </span>
        <span className="flex min-w-0 flex-col">
          <cite className="text-sm font-medium text-foreground not-italic">
            {review.name}
          </cite>
          <span className="text-xs text-muted-foreground">{review.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

const COLUMNS = [
  { duration: "38s", className: "" },
  { duration: "48s", className: "hidden md:block" },
  { duration: "43s", className: "hidden lg:block" },
] as const;

/** Round-robin split into 3 columns; short columns are topped up to 3+ cards. */
function buildColumns(reviews: ReviewItem[]) {
  return COLUMNS.map((_, col) => {
    const real = reviews.filter((_, i) => i % COLUMNS.length === col);
    const items = real.map((review) => ({ review, filler: false }));
    for (let i = 0; real.length > 0 && items.length < 3; i++) {
      items.push({ review: real[i % real.length], filler: true });
    }
    return items;
  });
}

/** Vertical auto-scrolling wall. Pure CSS: needs `animate-marquee-y` in globals.css. */
export function ReviewsMarquee({ reviews }: { reviews: ReviewItem[] }) {
  const columns = buildColumns(reviews);

  return (
    <div
      className={cn(
        "relative mt-12 flex max-h-[680px] items-start justify-center gap-6 overflow-hidden",
        "[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]",
        "motion-reduce:max-h-none motion-reduce:overflow-visible motion-reduce:[mask-image:none]",
      )}
    >
      {columns.map((items, col) => (
        <div
          key={col}
          className={cn("min-h-0 w-full max-w-sm", COLUMNS[col].className)}
        >
          <ul
            style={{ "--marquee-duration": COLUMNS[col].duration } as React.CSSProperties}
            className={cn(
              "flex h-max flex-col gap-6 pb-6 animate-marquee-y",
              "hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]",
              "motion-reduce:animate-none",
            )}
          >
            {[0, 1].map((copy) =>
              items.map(({ review, filler }, i) => (
                <li
                  key={`${copy}-${i}-${review.id}`}
                  aria-hidden={copy === 1 ? true : undefined}
                  className={cn(
                    "shrink-0",
                    (copy === 1 || filler) && "motion-reduce:hidden",
                  )}
                >
                  <ReviewCard review={review} focusable={copy === 0 && !filler} />
                </li>
              )),
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}