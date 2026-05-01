import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"
import OptimizedImage from "./OptimizedImage"

const S = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans:  "'Jost', sans-serif",
  dark:  "#0f0a04",
  gold:  "#e8c84a",
  orange:"#c85a08",
}

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen]         = useState(false)
  const [isScrolled, setIsScrolled]         = useState(true)
  const [isShopOpen, setIsShopOpen]         = useState(false)
  const [isLangOpen, setIsLangOpen]         = useState(false)
  const [badgeUpdated, setBadgeUpdated]     = useState(false)
  const [navHeight, setNavHeight]           = useState(72)
  const [currentPath, setCurrentPath]       = useState(window.location.pathname)

  const { cartCount, setIsCartOpen }        = useCart()
  const { language, setLanguage }           = useLanguage()

  // Nav height
  useEffect(() => {
    const nav = document.querySelector("nav")
    if (!nav) return
    const update = () => {
      const h = nav.offsetHeight
      setNavHeight(h)
      document.documentElement.style.setProperty("--nav-height", `${h}px`)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  // Scroll state
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Body lock when mobile menu open
  useEffect(() => {
    document.body.classList.toggle("menu-open", isMenuOpen)
    return () => document.body.classList.remove("menu-open")
  }, [isMenuOpen])

  // Cart badge bounce
  useEffect(() => {
    if (cartCount > 0) {
      setBadgeUpdated(true)
      const t = setTimeout(() => setBadgeUpdated(false), 300)
      return () => clearTimeout(t)
    }
  }, [cartCount])

  // Reset on mount
  useEffect(() => {
    setIsMenuOpen(false)
    setIsLangOpen(false)
    setIsShopOpen(false)
  }, [])

  // Track current path reactively
  useEffect(() => {
    const update = () => setCurrentPath(window.location.pathname)
    window.addEventListener("popstate", update)
    window.addEventListener("hashchange", update)
    return () => {
      window.removeEventListener("popstate", update)
      window.removeEventListener("hashchange", update)
    }
  }, [])

  const closeMenu = () => setIsMenuOpen(false)
  const closeAll  = () => { setIsShopOpen(false); setIsLangOpen(false) }

  const handleLinkClick = (e, targetId) => {
    e.preventDefault()
    closeMenu(); closeAll()
    const path = window.location.pathname.replace(/\/$/, "")
    if (path !== "/" && path !== "") {
      window.history.pushState({ page: "/" }, "", "/")
      window.dispatchEvent(new Event("hashchange"))
    }
    setTimeout(() => {
      const el = document.getElementById(targetId)
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - navHeight - 20, behavior: "smooth" })
    }, 100)
  }

  const transparent = false

  const navBg    = "bg-[#faf8f5]/96 backdrop-blur-md border-black/6 shadow-sm"
  const linkColor = "rgba(15,10,4,0.65)"
  const linkHover = S.dark

  const linkStyle = (extra = {}) => ({
    fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 300,
    letterSpacing: "0.16em", textTransform: "uppercase",
    color: linkColor, textDecoration: "none",
    transition: "color 0.2s",
    background: "none", border: "none", cursor: "pointer", padding: 0,
    ...extra,
  })

  return (
    <>
      <nav className={`sticky top-0 left-0 right-0 z-50 h-[72px] border-b transition-all duration-300 overflow-visible ${navBg}`}>
        <div className="h-full max-w-[1400px] mx-auto px-8 flex items-center justify-between relative">

          {/* ── LEFT: desktop links ── */}
          <div className="hidden md:flex items-center gap-8">

            {/* Shop dropdown */}
            <div
              className="relative"
              onMouseEnter={() => { setIsShopOpen(true); setIsLangOpen(false) }}
              onMouseLeave={() => setIsShopOpen(false)}
            >
              <button style={linkStyle({ display: "flex", alignItems: "center", gap: "5px" })}
                onMouseEnter={e => e.currentTarget.style.color = linkHover}
                onMouseLeave={e => e.currentTarget.style.color = linkColor}
              >
                {getTranslation(language, "nav.shop")}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  style={{ stroke: linkColor, transition: "transform 0.2s", transform: isShopOpen ? "rotate(180deg)" : "none" }}>
                  <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Outer div = invisible bridge that keeps hover alive */}
              <div style={{
                position: "absolute", top: "100%", left: "0%",
                transform: isShopOpen ? "translateY(0)" : "translateY(-8px)",
                paddingTop: "12px",
                opacity: isShopOpen ? 1 : 0,
                pointerEvents: isShopOpen ? "auto" : "none",
                transition: "opacity 0.2s ease, transform 0.2s ease",
                zIndex: 100,
              }}>
                {/* Inner div = visible card */}
                <div style={{
                  background: "#faf8f5", borderRadius: "14px",
                  border: "1px solid rgba(15,10,4,0.08)",
                  boxShadow: "0 16px 48px rgba(15,10,4,0.12)",
                  padding: "20px 24px", minWidth: "220px",
                }}>
                  <div style={{ fontFamily: S.sans, fontSize: "0.55rem", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(200,90,8,0.55)", marginBottom: "10px" }}>
                    Citrus Collection
                  </div>
                  {[
                    { href: "/orange",      label: getTranslation(language, "products.orange.name") },
                    { href: "/pink-orange", label: getTranslation(language, "products.pinkOrange.name") },
                    { href: "/lime",        label: getTranslation(language, "products.lime.name") },
                    { href: "/lemon",       label: getTranslation(language, "products.lemon.name") },
                  ].map(item => (
                    <a key={item.href} href={item.href} style={{
                      display: "block", padding: "7px 0",
                      fontFamily: S.sans, fontSize: "0.8rem", fontWeight: 300,
                      color: "rgba(15,10,4,0.65)", textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = S.dark}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(15,10,4,0.65)"}
                    >{item.label}</a>
                  ))}

                  <div style={{ height: "1px", background: "rgba(15,10,4,0.07)", margin: "12px 0" }} />

                  <div style={{ fontFamily: S.sans, fontSize: "0.55rem", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(200,90,8,0.55)", marginBottom: "10px" }}>
                    Fruit Collection
                  </div>
                  {[
                    { href: "/apple", label: getTranslation(language, "products.apple.name") },
                    { href: "/pineapple", label: getTranslation(language, "products.pineapple.name") },
                  ].map(item => (
                    <a key={item.href} href={item.href} style={{
                      display: "block", padding: "7px 0",
                      fontFamily: S.sans, fontSize: "0.8rem", fontWeight: 300,
                      color: "rgba(15,10,4,0.65)", textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = S.dark}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(15,10,4,0.65)"}
                    >{item.label}</a>
                  ))}
                </div>
              </div>
            </div>

            {/* About */}
            <a href="/about" style={linkStyle()}
              onMouseEnter={e => e.currentTarget.style.color = linkHover}
              onMouseLeave={e => e.currentTarget.style.color = linkColor}
            >
              {getTranslation(language, "nav.about")}
            </a>

          </div>

          {/* ── CENTER: Logo ── */}
          <a href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center no-underline z-10"
            style={{ transition: "opacity 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            onClick={e => e.preventDefault()}
          >
            <img
              src="/images/logo.png"
              alt="Pure Peel Co."
              className="h-[48px] md:h-[56px] w-auto block object-contain pointer-events-none"
              width="176" height="181"
              loading="eager"
            />
          </a>

          {/* ── RIGHT: utilities ── */}
          <div className="flex items-center gap-2 md:gap-4">

            <div className="hidden md:flex items-center" aria-label="Prices in Canadian dollars">
              <span style={linkStyle({ cursor: "default" })}>CAD</span>
            </div>

            {/* Language — desktop only */}
            <div className="relative hidden md:block">
              <button
                onClick={() => { setIsLangOpen(p => !p); setIsShopOpen(false) }}
                style={linkStyle({ display: "flex", alignItems: "center", gap: "4px" })}
                onMouseEnter={e => e.currentTarget.style.color = linkHover}
                onMouseLeave={e => e.currentTarget.style.color = linkColor}
              >
                {language === "en" ? "EN" : "FR"}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  style={{ stroke: linkColor, transition: "transform 0.2s", transform: isLangOpen ? "rotate(180deg)" : "none" }}>
                  <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 12px)",
                    background: "#faf8f5", borderRadius: "12px",
                    border: "1px solid rgba(15,10,4,0.08)",
                    boxShadow: "0 12px 36px rgba(15,10,4,0.1)",
                    padding: "8px", minWidth: "140px", zIndex: 100,
                  }}>
                    {[{ val: "en", label: "English" }, { val: "fr", label: "Français" }].map(l => (
                      <button key={l.val} onClick={() => { setLanguage(l.val); setIsLangOpen(false) }}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "9px 14px", borderRadius: "8px", border: "none",
                          background: language === l.val ? "rgba(200,90,8,0.06)" : "transparent",
                          fontFamily: S.sans, fontSize: "0.76rem", fontWeight: language === l.val ? 500 : 300,
                          color: language === l.val ? S.orange : "rgba(15,10,4,0.65)",
                          cursor: "pointer", transition: "background 0.15s",
                        }}
                        onMouseEnter={e => { if (language !== l.val) e.currentTarget.style.background = "rgba(15,10,4,0.04)" }}
                        onMouseLeave={e => { if (language !== l.val) e.currentTarget.style.background = "transparent" }}
                      >{l.label}</button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => { setIsCartOpen(true); closeMenu() }}
              aria-label={`Open cart${cartCount > 0 ? ` (${cartCount} items)` : ""}`}
              style={{
                position: "relative", width: "36px", height: "36px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none", cursor: "pointer",
                borderRadius: "50%", transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(15,10,4,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                style={{ stroke: "rgba(15,10,4,0.7)", strokeWidth: 1.5 }}
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: "-2px", right: "-2px",
                  minWidth: "18px", height: "18px", padding: "0 4px",
                  background: S.orange, color: "#fff",
                  fontSize: "10px", fontFamily: S.sans, fontWeight: 500,
                  borderRadius: "100px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  pointerEvents: "none",
                  transition: "transform 0.3s",
                  transform: badgeUpdated ? "scale(1.2)" : "scale(1)",
                }}>
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger — only on small screens */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg"
              onClick={() => setIsMenuOpen(p => !p)}
              aria-label="Toggle menu"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(15,10,4,0.7)" }}
            >
              {isMenuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU ── */}
      {isMenuOpen && <div className="fixed inset-0 bg-black/40 z-40" onClick={closeMenu} />}
      <div style={{
        position: "fixed", top: "72px", left: 0, right: 0,
        background: "#faf8f5",
        maxHeight: isMenuOpen ? "calc(100vh - 72px)" : "0",
        overflow: "hidden",
        transition: "max-height 0.35s cubic-bezier(0.22,1,0.36,1)",
        zIndex: 50,
        boxShadow: isMenuOpen ? "0 16px 48px rgba(15,10,4,0.12)" : "none",
      }}>
        <div style={{ padding: "28px 32px 40px" }}>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginBottom: "28px" }}>
            <span
              aria-label="Prices in Canadian dollars"
              style={{
                padding: "6px 12px", borderRadius: "100px",
                border: "1px solid rgba(200,90,8,0.25)",
                background: "rgba(200,90,8,0.06)",
                fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500,
                letterSpacing: "0.12em", color: S.orange,
              }}
            >
              CAD
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              {[{ val: "en", label: "EN" }, { val: "fr", label: "FR" }].map(o => (
                <button key={o.val} type="button" onClick={() => setLanguage(o.val)} style={{
                  padding: "6px 12px", borderRadius: "100px",
                  border: `1px solid ${language === o.val ? "rgba(200,90,8,0.4)" : "rgba(15,10,4,0.1)"}`,
                  background: language === o.val ? "rgba(200,90,8,0.06)" : "transparent",
                  fontFamily: S.sans, fontSize: "0.65rem", fontWeight: language === o.val ? 500 : 300,
                  letterSpacing: "0.1em", color: language === o.val ? S.orange : "rgba(15,10,4,0.5)",
                  cursor: "pointer",
                }}>{o.label}</button>
              ))}
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(15,10,4,0.07)", marginBottom: "24px" }} />

          {/* Citrus */}
          <div style={{ fontFamily: S.sans, fontSize: "0.55rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(200,90,8,0.55)", marginBottom: "14px" }}>
            Citrus Collection
          </div>
          {[
            { href: "/orange",      label: getTranslation(language, "products.orange.name") },
            { href: "/pink-orange", label: getTranslation(language, "products.pinkOrange.name") },
            { href: "/lime",        label: getTranslation(language, "products.lime.name") },
            { href: "/lemon",       label: getTranslation(language, "products.lemon.name") },
          ].map(item => (
            <a key={item.href} href={item.href}
              onClick={e => { e.preventDefault(); closeMenu() }}
              style={{ display: "block", padding: "10px 0", fontFamily: S.sans, fontSize: "1rem", fontWeight: 300, color: S.dark, textDecoration: "none", borderBottom: "1px solid rgba(15,10,4,0.05)" }}
            >{item.label}</a>
          ))}

          <div style={{ fontFamily: S.sans, fontSize: "0.55rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(200,90,8,0.55)", margin: "20px 0 14px" }}>
            Fruit Collection
          </div>
          {[
            { href: "/apple", label: getTranslation(language, "products.apple.name") },
            { href: "/pineapple", label: getTranslation(language, "products.pineapple.name") },
          ].map(item => (
            <a key={item.href} href={item.href}
              onClick={e => { e.preventDefault(); closeMenu() }}
              style={{ display: "block", padding: "10px 0", fontFamily: S.sans, fontSize: "1rem", fontWeight: 300, color: S.dark, textDecoration: "none", borderBottom: "1px solid rgba(15,10,4,0.05)" }}
            >{item.label}</a>
          ))}

          <div style={{ height: "1px", background: "rgba(15,10,4,0.07)", margin: "24px 0" }} />

          {[
            { href: "/about",     label: getTranslation(language, "nav.about") },
            { href: "/contact",   label: getTranslation(language, "nav.contact") },
          ].map(item => (
            <a key={item.href} href={item.href}
              onClick={e => { e.preventDefault(); closeMenu() }}
              style={{ display: "block", padding: "12px 0", fontFamily: S.sans, fontSize: "1rem", fontWeight: 300, color: S.dark, textDecoration: "none", borderBottom: "1px solid rgba(15,10,4,0.05)" }}
            >{item.label}</a>
          ))}
        </div>
      </div>
    </>
  )
}