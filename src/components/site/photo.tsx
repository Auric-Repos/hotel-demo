"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

type PhotoProps = Omit<
  ImageProps,
  "onError" | "width" | "height" | "fill"
> &
  (
    | {
        fill: true;
        width?: never;
        height?: never;
      }
    | {
        fill?: false;
        width: number;
        height: number;
      }
  );

/**
 * Reusable image wrapper for public-facing photos.
 *
 * - Supports explicit dimensions or fill layouts.
 * - Displays an accessible fallback when an image fails to load.
 * - Resets the fallback automatically when the image source changes.
 * - Preserves custom styling and image loading options.
 */
export function Photo(props: PhotoProps) {
  const [failedSrc, setFailedSrc] = useState<
    ImageProps["src"] | null
  >(null);

  const {
    className,
    alt,
    src,
    fill,
    width,
    height,
    style,
    ...imageProps
  } = props;

  const failed = failedSrc === src;

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center overflow-hidden",
          "bg-gold-soft p-4 text-center text-sm text-charcoal/70",
          fill && "absolute inset-0",
          className,
        )}
        style={
          fill
            ? style
            : {
                ...style,
                width,
                height,
              }
        }
      >
        {alt || "Image unavailable"}
      </div>
    );
  }

  return (
    <Image
      {...imageProps}
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...(fill ? { fill: true as const } : { width, height })}
      onError={() => setFailedSrc(src)}
    />
  );
}
