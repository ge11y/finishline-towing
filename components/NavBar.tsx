"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import type { PublicFactorySettings } from "@/lib/public-factory-settings";

type SearchSuggestion = {
  slug: string;
  displayName: string;
  fullName: string;
  strength: number | null;
  unit: string;
  collection: string;
  publicVisible?: boolean;
  archived?: boolean;
};

export function NavBar({ settings }: { settings: PublicFactorySettings }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const response = await fetch("/api/catalog-source", { cache: "no-store" });
        const result = (await response.json()) as { ok?: boolean; records?: SearchSuggestion[] };
        if (cancelled) return;
        const records = result.records ?? [];
        const matches = records
          .filter((record) => record.publicVisible !== false && !record.archived)
          .filter((record) => {
            const haystack = [
              record.displayName,
              record.fullName,
              record.collection,
              record.unit,
              `${record.strength ?? ""}${record.unit ?? ""}`,
              `${record.strength ?? ""} ${record.unit ?? ""}`,
            ]
              .join(" ")
              .toLowerCase();
            return haystack.includes(query);
          })
          .slice(0, 6);
        setSuggestions(matches);
        setSearchedQuery(query);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setSuggestionsLoading(false);
      }
    }, 40);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [searchOpen, searchQuery]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/products?group=candles&q=${encodeURIComponent(query)}`);
  }

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchIsWorking = Boolean(normalizedSearchQuery) && (suggestionsLoading || searchedQuery !== normalizedSearchQuery);
  const categoryLabels = settings.catalogSettings.categoryLabels;
  const showCustomerAccounts = settings.moduleSettings.customerAccounts;
  // Show an uploaded brand logo when present; otherwise fall back to a serif
  // wordmark of the business name (the design's default treatment). The bundled
  // demo placeholder logos count as "no logo" so a fresh store shows its name.
  const rawLogoSrc = settings.brandSettings.navLogoUrl || settings.brandSettings.logoUrl || '';
  const customLogoSrc = rawLogoSrc && !/\/brand\/demo-logo/.test(rawLogoSrc) ? rawLogoSrc : null;
  const isServiceMode = settings.catalogSettings.catalogMode === "services";
  const shopLinks = isServiceMode ? [
    { label: "Home", href: "/site" },
    { label: settings.catalogSettings.serviceLabel || "Services", href: "/site#services" },
  ] : [
    { label: categoryLabels.candles || "Candles", href: "/products?group=candles" },
    { label: categoryLabels.wax_melts || "Wax Melts", href: "/products?group=wax_melts" },
    { label: categoryLabels.room_sprays || "Room Sprays", href: "/products?group=room_sprays" },
    { label: categoryLabels.diffusers || "Reed Diffusers", href: "/products?group=diffusers" },
    { label: categoryLabels.gift_sets || "Gift Sets", href: "/products?group=gift_sets" },
    settings.moduleSettings.addOns
      ? { label: categoryLabels.accessories || settings.catalogSettings.addOnLabel || "Accessories", href: "/add-ons" }
      : null,
  ].filter((link): link is { label: string; href: string } => Boolean(link));
  const infoLinks = [
    settings.moduleSettings.documents ? { label: "Quality Reports", href: "/quality-reports" } : null,
    { label: "FAQ", href: "/faq" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    // /apply is the factory's own intake — it has no place on a client's service site.
    isServiceMode ? null : { label: "Apply", href: "/apply" },
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  return (
    <>
      <nav
        className="site-nav"
        style={{
          // Service clients render a solid header (utility band + nav); the
          // storefront keeps its nav floating over the hero.
          position: isServiceMode ? "static" : "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: "var(--site-nav-height, 68px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          backgroundColor: "var(--factory-nav-bg)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
          transition: "background-color 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease",
        }}
      >
        <style>{`
          @media (max-width: 980px) {
            .site-nav {
              padding: 0 14px !important;
            }
            .site-nav-logo {
              width: 150px !important;
              min-width: 150px !important;
            }
          }
          @media (max-width: 720px) {
            .site-nav {
              gap: 10px !important;
            }
            .site-nav-actions {
              gap: 8px !important;
            }
            .site-nav-shop-cta {
              min-height: 36px !important;
              padding: 0 12px !important;
              font-size: 11px !important;
            }
            .site-nav-action-button {
              width: 36px !important;
              height: 36px !important;
            }
          }
          @media (max-width: 420px) {
            .site-nav-logo {
              width: 116px !important;
              min-width: 116px !important;
            }
            .site-nav-shop-cta {
              display: none !important;
            }
            .site-nav-cart-label {
              display: none !important;
            }
          }
          @keyframes factory-search-pulse {
            0%, 80%, 100% { opacity: 0.28; transform: scale(0.82); }
            40% { opacity: 1; transform: scale(1); }
          }
        `}</style>
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="site-nav-action-button"
          onClick={() => {
            setMenuOpen((current) => !current);
            setSearchOpen(false);
          }}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "999px",
            border: menuOpen ? "1px solid var(--accent-400)" : "1px solid var(--border)",
            background: menuOpen ? "var(--factory-nav-active-bg)" : "var(--bg-card)",
            color: menuOpen ? "var(--accent-500)" : "var(--factory-nav-text)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "border-color 0.2s ease, background 0.2s ease, color 0.2s ease",
          }}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <Link
          href={isServiceMode ? "/site" : "/"}
          className="site-nav-logo"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            display: "inline-flex",
            alignItems: "center",
            maxWidth: "60vw",
            height: "50px",
            textDecoration: "none",
          }}
          aria-label={`${settings.businessName} home`}
        >
          {customLogoSrc && isServiceMode ? (
            /* Trade marks are usually round badges whose own lettering is
               unreadable at nav size — pair the mark with the wordmark. The
               fixed box plus object-fit keeps any logo aspect ratio honest. */
            <span className="site-nav-lockup">
              <span className="site-nav-mark">
                <Image src={customLogoSrc} alt="" fill sizes="96px" priority style={{ objectFit: "contain" }} />
              </span>
              <span className="site-nav-wordmark">{settings.businessName}</span>
            </span>
          ) : customLogoSrc ? (
            <Image
              src={customLogoSrc}
              alt={settings.businessName}
              width={1420}
              height={430}
              priority
              style={{ width: "168px", height: "auto", display: "block" }}
            />
          ) : (
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.4rem",
                lineHeight: 1,
                color: "var(--accent-400)",
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              {settings.businessName}
            </span>
          )}
        </Link>

        <div className="site-nav-actions" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {isServiceMode ? null : (
            <>
          <button
            type="button"
            aria-label={searchOpen ? "Close search" : "Open search"}
            aria-expanded={searchOpen}
            className="site-nav-action-button"
            onClick={() => {
              setSearchOpen((current) => !current);
              setMenuOpen(false);
            }}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "999px",
              border: searchOpen ? "1px solid var(--accent-400)" : "1px solid var(--border)",
              background: searchOpen ? "var(--factory-nav-active-bg)" : "var(--bg-card)",
              color: searchOpen ? "var(--accent-500)" : "var(--factory-nav-text)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "border-color 0.2s ease, background 0.2s ease, color 0.2s ease",
            }}
          >
            <Search size={16} />
          </button>
          <Link
            href="/cart"
            aria-label="Cart"
            title="Cart"
            className="site-nav-action-button"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "38px",
              height: "38px",
              borderRadius: "999px",
              border: pathname === "/cart" ? "1px solid var(--accent-400)" : "1px solid var(--border)",
              background: pathname === "/cart" ? "var(--factory-nav-active-bg)" : "var(--bg-card)",
              color: pathname === "/cart" ? "var(--accent-500)" : "var(--factory-nav-text)",
              textDecoration: "none",
              transition: "border-color 0.2s ease, background 0.2s ease, color 0.2s ease",
            }}
          >
            <ShoppingCart size={16} />
            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                minWidth: "18px",
                height: "18px",
                padding: "0 6px",
                borderRadius: "999px",
                background: itemCount > 0 ? "var(--accent-500)" : "var(--bg-elevated)",
                border: itemCount > 0 ? "1px solid var(--accent-500)" : "1px solid var(--border)",
                color: itemCount > 0 ? "#fff" : "var(--text-muted)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                lineHeight: 1,
              }}
            >
              {itemCount}
            </span>
          </Link>
            </>
          )}
        </div>
      </nav>
      {menuOpen || searchOpen ? (
        <div
          role="presentation"
          onClick={() => {
            setMenuOpen(false);
            setSearchOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 45,
            background: "rgba(13, 20, 36, 0.18)",
          }}
        />
      ) : null}
      <form
        role="search"
        aria-hidden={!searchOpen}
        onSubmit={submitSearch}
        style={{
          position: "fixed",
          top: "calc(var(--site-nav-height, 68px) + 10px)",
          right: "clamp(14px, 4vw, 40px)",
          zIndex: 60,
          width: "min(380px, calc(100vw - 28px))",
          borderRadius: "18px",
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          boxShadow: "0 18px 42px rgba(28, 35, 64, 0.16)",
          padding: "12px",
          display: "grid",
          gap: "10px",
          opacity: searchOpen ? 1 : 0,
          transform: searchOpen ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: searchOpen ? "auto" : "none",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search products"
            autoComplete="off"
            style={{
              minWidth: 0,
              flex: 1,
              height: "42px",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              padding: "0 12px",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            className="fm-btn-primary"
            style={{ height: "42px", padding: "0 14px", justifyContent: "center" }}
          >
            Search
          </button>
        </div>
        {searchQuery.trim() ? (
          <div
            style={{
              borderRadius: "14px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "9px 12px",
                borderBottom: "1px solid var(--border)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              {searchIsWorking ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  Searching
                  <span aria-hidden="true" style={{ display: "inline-flex", gap: "3px" }}>
                    {[0, 1, 2].map((index) => (
                      <span
                        key={index}
                        style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "999px",
                          background: "var(--accent-500)",
                          animation: "factory-search-pulse 0.9s ease-in-out infinite",
                          animationDelay: `${index * 0.12}s`,
                        }}
                      />
                    ))}
                  </span>
                </span>
              ) : suggestions.length > 0 ? "Matches" : "No matches yet"}
            </div>
            {suggestions.map((suggestion) => (
              <Link
                key={suggestion.slug}
                href={`/products/${suggestion.slug}`}
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                  setSuggestions([]);
                  setSearchedQuery("");
                }}
                style={{
                  display: "grid",
                  gap: "3px",
                  padding: "11px 12px",
                  borderBottom: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 700 }}>{suggestion.displayName}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                  {[suggestion.fullName, suggestion.strength ? `${suggestion.strength}${suggestion.unit}` : "", suggestion.collection]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </form>
      <div
        role="menu"
        aria-hidden={!menuOpen}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setMenuOpen(false);
        }}
        style={{
          position: "fixed",
          top: "calc(var(--site-nav-height, 68px) + 10px)",
          right: "clamp(14px, 4vw, 40px)",
          zIndex: 60,
          width: "min(360px, calc(100vw - 28px))",
          borderRadius: "18px",
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          boxShadow: "0 18px 42px rgba(28, 35, 64, 0.16)",
          padding: "14px",
          display: "grid",
          gap: "14px",
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}
      >
        <MenuSection title={isServiceMode ? (settings.catalogSettings.serviceLabel || "Services") : "Shop"}>
          {shopLinks.map((link) => (
            <MenuLink key={link.href} href={link.href}>
              {link.label}
            </MenuLink>
          ))}
        </MenuSection>
        <MenuSection title="Company">
          {infoLinks.map((link) => (
            <MenuLink key={link.href} href={link.href}>
              {link.label}
            </MenuLink>
          ))}
        </MenuSection>
        <div style={{ display: "grid", gridTemplateColumns: showCustomerAccounts ? "1fr 1fr" : "1fr", gap: "10px" }}>
          {showCustomerAccounts ? (
            <Link href="/account" className="fm-btn-outline" style={{ justifyContent: "center" }}>
              Account
            </Link>
          ) : null}
          {isServiceMode ? (
            <Link href="/contact" className="fm-btn-primary" style={{ justifyContent: "center" }}>
              Request an estimate
            </Link>
          ) : (
            <Link href="/cart" className="fm-btn-primary" style={{ justifyContent: "center" }}>
              Cart
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: "8px" }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          padding: "0 4px",
        }}
      >
        {title}
      </div>
      <div style={{ display: "grid", gap: "4px" }}>{children}</div>
    </div>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      role="menuitem"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: "40px",
        borderRadius: "12px",
        padding: "0 12px",
        color: "var(--text-primary)",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 600,
        background: "transparent",
      }}
    >
      <span>{children}</span>
      <span aria-hidden="true" style={{ color: "var(--text-muted)" }}>›</span>
    </Link>
  );
}
