"use client";

import { useEffect, useRef, useState } from "react";

export const APP_URL = "https://app.tatak.tech";

export const CONTACT_EMAIL = "srivathsanvenkateswaran@gmail.com";

type NavItem = {
  href: string;
  label: string;
  external?: boolean;
  route?: boolean;
};

export const navigation: NavItem[] = [
  { href: "#why", label: "Why Tatak" },
  { href: "#journey", label: "Sample journey" },
  { href: "#signals", label: "Data clarity" },
  { href: "#workflow", label: "How it works" },
  { href: "https://app.tatak.tech/stickers.html", label: "Test QR codes", external: true },
  { href: "/mcp/", label: "MCP server", route: true },
  { href: "/emission/", label: "Emission method", route: true },
  { href: "/sample-users/", label: "Sample users", route: true },
  { href: "/contact/", label: "Contact", route: true },
];

export const publicAsset = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

// Hash links (e.g. "#why") only resolve on the page that owns that id. From
// any page other than the one-page home, they need to point home first.
function homeHref(hash: string, isHome: boolean) {
  return isHome ? hash : `${publicAsset("/")}${hash}`;
}

function navItemHref(item: NavItem, isHome: boolean) {
  if (item.external) return item.href;
  if (item.route) return publicAsset(item.href);
  return homeHref(item.href, isHome);
}

function navItemTargetProps(item: NavItem) {
  return item.external ? { target: "_blank" as const, rel: "noreferrer" } : {};
}

export function useRevealAnimations() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    document.documentElement.classList.add("reveal-ready");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add("is-in-view");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.08, rootMargin: "0px 0px -5%" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

export function Brand({ className = "", href = "#top" }: { className?: string; href?: string }) {
  return (
    <a className={`brand ${className}`.trim()} href={href} aria-label="Tatak home">
      <span className="brand-mark kn" aria-hidden="true">ತ</span>
      <span className="brand-name">Tatak</span>
      <span className="brand-kn kn" lang="kn">ತಟಕ್</span>
    </a>
  );
}

export function AppLink({
  className = "",
  label = "Try Tatak",
  tabIndex,
}: {
  className?: string;
  label?: string;
  tabIndex?: number;
}) {
  return (
    <a
      className={className}
      href={APP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      tabIndex={tabIndex}
    >
      <span>{label}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

export function SiteHeader({ isHome = false }: { isHome?: boolean }) {
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      navRef.current?.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen]);

  return (
    <header ref={navRef} className="site-nav">
      <Brand href={homeHref("#top", isHome)} />
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navigation.map((item) => (
          <a key={item.href} href={navItemHref(item, isHome)} {...navItemTargetProps(item)}>
            {item.label}
          </a>
        ))}
      </nav>
      <AppLink className="nav-cta" />
      <button
        type="button"
        className="menu-toggle"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span /><span />
      </button>
      <nav
        id="mobile-navigation"
        className={`mobile-nav ${menuOpen ? "is-open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        {navigation.map((item, index) => (
          <a
            key={item.href}
            href={navItemHref(item, isHome)}
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
            {...navItemTargetProps(item)}
          >
            {item.label}<span>0{index + 1}</span>
          </a>
        ))}
        <AppLink
          className="mobile-app-link"
          label="Open Tatak"
          tabIndex={menuOpen ? 0 : -1}
        />
      </nav>
    </header>
  );
}

export function SiteFooter({ isHome = false }: { isHome?: boolean }) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div><Brand className="footer-brand" href={homeHref("#top", isHome)} /><p>One calm answer for a city in motion.</p></div>
        <nav aria-label="Footer navigation">
          <span>Explore</span>
          {navigation.map((item) => (
            <a key={item.href} href={navItemHref(item, isHome)} {...navItemTargetProps(item)}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="footer-product">
          <span>Product</span>
          <AppLink className="footer-app-link" label="Try Tatak" />
          <a href={homeHref("#top", isHome)}>Back to top ↑</a>
        </div>
      </div>
      <div className="footer-legal">
        <p>Tatak is an independent hackathon prototype. It is not affiliated with, endorsed by or operated by BMTC, BMRCL or any government body. Tickets shown in the prototype are specimens and are not valid for travel. Two of the five test QR codes are deliberate no-duty cases: scan one to see Tatak ask you to name the route instead of guessing it.</p>
        <div className="footer-meta">
          <span className="footer-credit">
            Built with <span aria-hidden="true">♥</span> by{" "}
            <a href="https://vathsan.vercel.app/" target="_blank" rel="noreferrer">Vathsan</a>
          </span>
          <span>© 2026 Tatak · Bengaluru</span>
        </div>
      </div>
    </footer>
  );
}
