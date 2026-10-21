"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

import { Link, usePathname } from "@/i18n/navigation";
import { CENTER_NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/site/language-switcher";

const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const motionSafe = "motion-reduce:transition-none";

const ctaClass =
  "bg-primary text-primary-foreground font-semibold " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(0,0,0,0.2)] " +
  "transition-all duration-300 hover:opacity-90 active:scale-95";

export function SiteHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const rawPathname = usePathname();
  const pathname = rawPathname.replace(/^\/(en|ar)(?=\/|$)/, "") || "/";

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(
    null,
  );

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const navLinks = CENTER_NAV_LINKS.map((link) => {
    const href = link.href;
    const path = href.split("#")[0] || "/";
    return {
      ...link,
      label: t(link.key),
      active:
        path === "/"
          ? pathname === "/" && href === "/"
          : pathname === path || pathname.startsWith(`${path}/`),
    };
  });

  const activeIndex = navLinks.findIndex((link) => link.active);
  const targetIndex = hovered ?? activeIndex;

  // Sliding glass indicator (desktop)
  useLayoutEffect(() => {
    const update = () => {
      const nav = navRef.current;
      const item = itemRefs.current[targetIndex];
      if (!nav || !item || targetIndex < 0) {
        setPill(null);
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      setPill({ left: itemRect.left - navRect.left, width: itemRect.width });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [targetIndex, pathname, locale]);

  useLayoutEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-5 z-50",
        "flex justify-center px-3 sm:top-4 sm:px-4",
      )}
    >
      {/* Main bar */}
      <div
        className={cn(
          "glass-surface pointer-events-auto flex w-full items-center justify-between",
          "gap-2 rounded-xl px-3 sm:gap-4 sm:px-4",
          "transition-[max-width,height,background-color,box-shadow] duration-500",
          EASE,
          motionSafe,
          scrolled
            ? "h-12 max-w-4xl [--glass-bg:var(--glass-bg-strong)]"
            : "h-14 max-w-6xl",
        )}
      >
        {/* Brand */}
        <Link
          href="/"
          onClick={handleNavClick}
          className={cn(
            "text-foreground shrink-0 pl-1 font-heading text-lg tracking-wide",
            "transition-opacity duration-300 hover:opacity-70 sm:pl-2 sm:text-xl",
            focusRing,
            motionSafe,
          )}
        >
          {SITE_CONFIG.name}
        </Link>

        {/* Desktop navigation */}
        <nav
          ref={navRef}
          aria-label={t("nav.menu")}
          onMouseLeave={() => setHovered(null)}
          className="relative hidden items-center md:flex"
        >
          <span
            aria-hidden="true"
            className={cn(
              "glass-accent pointer-events-none absolute inset-y-0 rounded-xl",
              "transition-[left,width,opacity] duration-500",
              "ease-[cubic-bezier(0.34,1.4,0.64,1)]",
              motionSafe,
              pill ? "opacity-100" : "opacity-0",
            )}
            style={{ left: pill?.left ?? 0, width: pill?.width ?? 0 }}
          />

          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              onMouseEnter={() => setHovered(i)}
              onClick={handleNavClick}
              aria-current={link.active ? "page" : undefined}
              className={cn(
                "relative z-10 inline-flex items-center gap-1",
                "rounded-xl px-3 py-1.5 text-sm lg:px-4",
                "transition-colors duration-300",
                focusRing,
                motionSafe,
                i === targetIndex ? "text-foreground" : "text-muted-foreground",
                link.active && "font-medium",
              )}
            >
              {link.label}
              {"chevron" in link && link.chevron ? (
                <ChevronDownIcon
                  aria-hidden="true"
                  className="size-3.5 opacity-70"
                />
              ) : null}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher
            className={cn(
              "glass-control text-foreground rounded-xl",
              "transition-all duration-300 hover:bg-accent active:scale-95",
              focusRing,
              motionSafe,
            )}
          />

          <Show when="signed-out">
            <SignInButton mode="modal" fallbackRedirectUrl="/account">
              <Button
                className={cn(
                  "glass-control text-foreground h-10 rounded-xl px-3 text-sm font-medium md:h-9 md:px-4",
                  "transition-all duration-300 hover:bg-accent active:scale-95",
                  focusRing,
                  motionSafe,
                )}
              >
                {t("nav.signIn")}
              </Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>

          <Link
            href="/book"
            className={cn(
              ctaClass,
              "hidden items-center justify-center rounded-xl px-4 py-1.5 text-sm md:inline-flex",
              focusRing,
              motionSafe,
            )}
          >
            {t("nav.bookNow")}
          </Link>

          {/* Mobile menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              className={cn(
                "glass-control text-foreground inline-flex size-9 items-center justify-center",
                "rounded-xl transition-all duration-300 active:scale-95 md:hidden",
                focusRing,
                motionSafe,
              )}
            >
              {menuOpen ? (
                <XIcon aria-hidden="true" className="size-5" />
              ) : (
                <MenuIcon aria-hidden="true" className="size-5" />
              )}
            </SheetTrigger>

            <SheetContent
              side={locale === "ar" ? "left" : "right"}
              showCloseButton={false}
              className="border-border/40 bg-background/80 text-foreground backdrop-blur-2xl backdrop-saturate-150"
            >
              <SheetHeader>
                <SheetTitle className="font-heading text-foreground text-2xl">
                  {SITE_CONFIG.name}
                </SheetTitle>
              </SheetHeader>

              <SheetClose
                aria-label={t("nav.closeMenu")}
                className={cn(
                  "glass-control text-foreground absolute end-4 top-4 inline-flex size-9",
                  "items-center justify-center rounded-xl transition-all active:scale-95",
                  focusRing,
                  motionSafe,
                )}
              >
                <XIcon aria-hidden="true" className="size-5" />
              </SheetClose>

              <nav
                aria-label={t("nav.menu")}
                className="flex flex-col gap-1 px-4"
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleNavClick}
                    aria-current={link.active ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-4 py-3 text-base",
                      "transition-colors duration-200",
                      focusRing,
                      motionSafe,
                      link.active
                        ? "glass-accent text-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {link.label}
                    {"chevron" in link && link.chevron ? (
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="size-4 opacity-70"
                      />
                    ) : null}
                  </Link>
                ))}
              </nav>

              <div className="border-border/40 mx-4 mt-4 flex flex-col gap-4 border-t pt-4">
                <LanguageSwitcher
                  className={cn(
                    "glass-control text-foreground self-start rounded-xl",
                    focusRing,
                    motionSafe,
                  )}
                />

                <Show when="signed-out">
                  <SignInButton mode="modal" fallbackRedirectUrl="/account">
                    <Button
                      onClick={handleNavClick}
                      className={cn(
                        "glass-control text-foreground h-10 rounded-xl text-sm font-medium",
                        "transition-all duration-300 active:scale-95",
                        focusRing,
                        motionSafe,
                      )}
                    >
                      {t("nav.signIn")}
                    </Button>
                  </SignInButton>
                </Show>

                <Show when="signed-in">
                  <UserButton />
                </Show>

                <Link
                  href="/book"
                  onClick={handleNavClick}
                  className={cn(
                    ctaClass,
                    "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm",
                    focusRing,
                    motionSafe,
                  )}
                >
                  {t("nav.bookNow")}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}