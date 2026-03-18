import { useEffect, useState } from "react"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [ripples, setRipples] = useState({})
  const { language } = useLanguage()

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)

    // Parallax scroll
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })

    // WebP support + image preload
    const checkWebP = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 1
      canvas.height = 1
      return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0
    }

    const imageUrl = checkWebP()
      ? "/images/driedcitrusbanner.webp"
      : "/images/driedcitrusbanner.jpg"

    const bgDiv = document.querySelector(".hero-bg")
    if (bgDiv) bgDiv.style.backgroundImage = `url('${imageUrl}')`

    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const createRipple = (e, buttonId) => {
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    setRipples(prev => ({ ...prev, [buttonId]: { x, y, size } }))
    setTimeout(() => {
      setRipples(prev => {
        const next = { ...prev }
        delete next[buttonId]
        return next
      })
    }, 600)
  }

  const handleShopNow = (e) => {
    createRipple(e, "shop")
    setTimeout(() => {
      const el = document.querySelector("#products") || document.querySelector(".products-section")
      if (el) el.scrollIntoView({ behavior: "smooth" })
    }, 150)
  }

  const handleLearnMore = (e) => {
    createRipple(e, "learn")
    setTimeout(() => {
      const el = document.querySelector("#about-teaser") || document.querySelector(".about-teaser-section")
      if (el) {
        const offsetPosition = el.getBoundingClientRect().top + window.pageYOffset - 10
        window.scrollTo({ top: offsetPosition, behavior: "smooth" })
      }
    }, 150)
  }

  return (
    <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden">

      {/* Background image with parallax */}
      <div
        className="hero-bg absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          transform: `translateY(${scrollY * 0.22}px) scale(1.08)`,
          transition: "transform 0.05s linear",
        }}
      />

      {/* Gradient overlay — lighter so citrus colours breathe */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-black/65" />

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.62) 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-5xl px-6 sm:px-10 flex flex-col items-center justify-center min-h-[85vh] sm:min-h-[92vh] text-center text-white pt-16 pb-24">

        {/* Eyebrow badge */}
        <div
          className={`
            inline-flex items-center gap-2.5 px-5 py-1.5 mb-10
            border border-brand-gold/30 rounded-full
            text-[0.6rem] font-sans font-light tracking-[0.22em] uppercase
            text-brand-gold/85 backdrop-blur-sm
            transition-all duration-700
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
          style={{
            background: "rgba(232,200,74,0.07)",
            transitionDelay: "100ms",
          }}
        >
          <span className="w-1 h-1 rounded-full bg-brand-gold opacity-80" />
          Handcrafted in Canada
          <span className="w-1 h-1 rounded-full bg-brand-gold opacity-80" />
        </div>

        {/* Main headline */}
        <h1
          className={`
            font-serif font-light italic text-white leading-[0.98]
            tracking-[-0.02em] mb-4
            drop-shadow-[0_4px_48px_rgba(0,0,0,0.45)]
            transition-all duration-700
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
          `}
          style={{
            fontSize: "clamp(3.8rem, 9.5vw, 8rem)",
            transitionDelay: "250ms",
          }}
        >
          Pure Peel Co.
        </h1>

        {/* Gold divider */}
        <div
          className={`
            h-px mx-auto mb-7
            transition-all duration-700
            ${isVisible ? "opacity-100 w-32" : "opacity-0 w-0"}
          `}
          style={{
            background: "linear-gradient(90deg, transparent, rgba(232,200,74,), transparent)",
            transitionDelay: "600ms",
          }}
        />

        {/* Tagline */}
        <p
          className={`
            font-serif font-light text-white/90 leading-relaxed
            max-w-[540px] mb-5
            drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)]
            transition-all duration-700
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
          `}
          style={{
            fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            transitionDelay: "420ms",
          }}
        >
          {getTranslation(language, "hero.tagline")}
        </p>

        {/* Feature strip */}
        <p
          className={`
            font-sans font-light tracking-[0.2em] uppercase
            text-white/90 mb-14
            transition-all duration-700
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
          `}
          style={{
            fontSize: "clamp(0.65rem, 1.8vw, 0.82rem)",
            transitionDelay: "560ms",
          }}
        >
          {getTranslation(language, "hero.features")}
        </p>

        {/* CTA Buttons */}
        <div
          className={`
            flex flex-col sm:flex-row gap-3.5 justify-center
            transition-all duration-700
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
          `}
          style={{ transitionDelay: "700ms" }}
        >
          {/* Primary — gold */}
          <button
            onClick={handleShopNow}
            className="
            relative overflow-hidden
            min-w-[200px] px-12 py-3 rounded-full border-0
            font-sans font-medium text-[0.68rem] tracking-[0.2em] uppercase
            text-brand-dark cursor-pointer
            shadow-[0_8px_32px_rgba(232,200,74,0.28),0_2px_8px_rgba(0,0,0,0.28)]
            transition-all duration-300
            hover:-translate-y-[2px]
            hover:shadow-[0_12px_36px_rgba(232,200,74,0.38),0_3px_12px_rgba(0,0,0,0.32)]
            active:scale-[0.98]
            "
            style={{ background: "linear-gradient(135deg, #f5e6a3 0%, #e8c84a 55%, #d4a832 100%)" }}
          >
            {getTranslation(language, "hero.shopNow")}
            {ripples.shop && (
              <span
                className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
                style={{
                  left: `${ripples.shop.x}px`,
                  top: `${ripples.shop.y}px`,
                  width: `${ripples.shop.size}px`,
                  height: `${ripples.shop.size}px`,
                }}
              />
            )}
          </button>

          {/* Secondary — ghost */}
          <button
            onClick={handleLearnMore}
            className="
            relative overflow-hidden
            min-w-[200px] px-12 py-3 rounded-full
            border border-white/40
            font-sans font-light text-[0.68rem] tracking-[0.2em] uppercase
            text-white/82 backdrop-blur-md cursor-pointer
            transition-all duration-300
            hover:-translate-y-[3px]
            hover:bg-white/14 hover:border-white/68
            hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]
            active:scale-[0.98]
          "
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            {getTranslation(language, "hero.learnMore")}
            {ripples.learn && (
              <span
                className="absolute rounded-full bg-white/25 pointer-events-none animate-ripple"
                style={{
                  left: `${ripples.learn.x}px`,
                  top: `${ripples.learn.y}px`,
                  width: `${ripples.learn.size}px`,
                  height: `${ripples.learn.size}px`,
                }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Scroll indicator — SVG chevron */}
      <div
        className={`
          absolute bottom-9 left-1/2 -translate-x-1/2 z-10
          flex flex-col items-center gap-2
          transition-opacity duration-700
          ${isVisible ? "opacity-70" : "opacity-0"}
        `}
        style={{ transitionDelay: "1200ms" }}
      >
        <span className="text-[0.55rem] tracking-[0.28em] uppercase text-white/50 font-sans font-light">
          Scroll
        </span>
        <svg
          className="animate-bounce"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>

    </section>
  )
}