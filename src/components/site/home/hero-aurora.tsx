"use client";

import { useEffect, useRef, useState } from "react";

const MAX_OFFSET = 110;
const LERP = 0.12;

// Sizes and offsets are inline styles (never Tailwind arbitrary values), so
// they can't be dropped by the class scanner and never resolve to 0.
const BLOBS = [
  { id: "a", color: "bg-aurora-gold", opacity: "opacity-60", anim: "animate-aurora-a", delay: "-2s",  size: "clamp(280px, 50vw, 760px)", x: "-4vw", y: "-4vh", follow: true,  hide: false },
  { id: "b", color: "bg-aurora-teal", opacity: "opacity-50", anim: "animate-aurora-b", delay: "-7s",  size: "clamp(260px, 46vw, 700px)", x: "4vw",  y: "4vh",  follow: false, hide: false },
  { id: "c", color: "bg-aurora-gold", opacity: "opacity-55", anim: "animate-aurora-c", delay: "-13s", size: "clamp(300px, 52vw, 780px)", x: "-4vw", y: "5vh",  follow: false, hide: true  },
  { id: "d", color: "bg-aurora-sand", opacity: "opacity-45", anim: "animate-aurora-d", delay: "-19s", size: "clamp(280px, 44vw, 660px)", x: "4vw",  y: "-5vh", follow: false, hide: true  },
];

const MASK =
  "linear-gradient(to bottom, transparent 0%, rgb(0 0 0) 8%, rgb(0 0 0) 75%, transparent 100%)";

export function HeroAurora() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const followRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const visibleRef = useRef(true);
  const hiddenRef = useRef(false);
  const pausedRef = useRef(false);
  const startRef = useRef<() => void>(() => {});

  const [pointerEnabled, setPointerEnabled] = useState(false);
  const [paused, setPaused] = useState(false);

  // Fine pointer only, and never under reduced motion.
  useEffect(() => {
    const mqHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const check = () => setPointerEnabled(mqHover.matches && !mqReduce.matches);
    check();
    mqHover.addEventListener("change", check);
    mqReduce.addEventListener("change", check);
    return () => {
      mqHover.removeEventListener("change", check);
      mqReduce.removeEventListener("change", check);
    };
  }, []);

  // Pause CSS animations (and the pointer loop) when off-screen or tab hidden.
  // Always cleans up, regardless of pointer support.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const apply = () => {
      const next = !visibleRef.current || hiddenRef.current;
      if (next === pausedRef.current) return;
      pausedRef.current = next;
      setPaused(next);
      if (!next) startRef.current();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries[0]?.isIntersecting ?? true;
        apply();
      },
      { threshold: 0 },
    );
    observer.observe(el);

    const onVisibility = () => {
      hiddenRef.current = document.visibilityState === "hidden";
      apply();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Pointer-follow loop (imperative, no React state per frame).
  useEffect(() => {
    if (!pointerEnabled) return;

    const loop = () => {
      const node = followRef.current;
      if (!node || pausedRef.current) {
        frameRef.current = null;
        return;
      }
      const p = posRef.current;
      const t = targetRef.current;
      p.x += (t.x - p.x) * LERP;
      p.y += (t.y - p.y) * LERP;
      node.style.transform = `translate3d(${p.x}px,${p.y}px,0)`;

      // Stop the loop once it has settled; pointermove restarts it.
      if (Math.abs(t.x - p.x) < 0.05 && Math.abs(t.y - p.y) < 0.05) {
        frameRef.current = null;
        return;
      }
      frameRef.current = requestAnimationFrame(loop);
    };

    const start = () => {
      if (pausedRef.current || frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(loop);
    };
    startRef.current = start;

    const onPointerMove = (e: PointerEvent) => {
      // Relative to the viewport, so scrolling can't make it stale.
      const nx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const ny = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      targetRef.current.x = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, nx * MAX_OFFSET));
      targetRef.current.y = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, ny * MAX_OFFSET));
      start();
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      startRef.current = () => {};
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [pointerEnabled]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-aurora-paused={paused ? "true" : undefined}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ maskImage: MASK, WebkitMaskImage: MASK }}
    >
      {BLOBS.map((b) => {
        const blob = (
          <div
            className={`aurora-blob absolute rounded-full will-change-transform blur-2xl md:blur-3xl motion-reduce:animate-none ${b.color} ${b.opacity} ${b.anim} ${b.hide ? "hidden md:block" : ""}`}
            style={{
              width: b.size,
              height: b.size,
              marginLeft: `calc(${b.size} / -2)`,
              marginTop: `calc(${b.size} / -2)`,
              animationDelay: b.delay,
            }}
          />
        );

        return (
          // Zero-size anchor pinned to the exact hero center, plus a small
          // fixed offset in vw/vh. Never animated.
          <div
            key={b.id}
            className="absolute top-1/2 left-1/2 h-0 w-0"
            style={{ transform: `translate(${b.x}, ${b.y})` }}
          >
            {b.follow ? (
              // Driven by the rAF loop. The blob inside keeps its CSS keyframes.
              <div ref={followRef} className="absolute top-0 left-0 h-0 w-0 will-change-transform">
                {blob}
              </div>
            ) : (
              blob
            )}
          </div>
        );
      })}

      {/* Fine film grain to prevent gradient banding. */}
      <div aria-hidden className="absolute inset-0 bg-grain" />
    </div>
  );
}