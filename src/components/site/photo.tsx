"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

/**
 * next/image wrapper for every photo on the public site.
 * Photos do not exist yet: if the file fails to load, render a sand-colored
 * block (#f1e8d6) with the alt text in muted charcoal instead of a broken image.
 */
export function Photo({ className, alt, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-gold-soft p-4 text-center text-sm text-charcoal/70",
          className,
        )}
      >
        {alt}
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
