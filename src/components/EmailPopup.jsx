import { useState, useEffect, useRef, useCallback } from "react"
import { useLanguage } from "../context/LanguageContext"

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// Tune these without touching component logic.
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  // How far down the page (0–1) before popup triggers on desktop
  scrollDepthThreshold: 0.5,

  // How long before a dismissed popup can show again (days)
  dismissalExpiryDays: 60,

  // Delay after scroll threshold is hit before showing (ms) — prevents flash
  triggerDelay: 800,

  // Force show via URL: ?showpopup=1 (useful for design review)
  forceShowParam: "showpopup",

  // Analytics event names — swap for your actual analytics calls
  analytics: {
    shown:     "popup_shown",
    dismissed: "popup_dismissed",
    submitted: "popup_email_submitted",
    success:   "popup_email_success",
    error:     "popup_email_error",
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE HELPERS
// Uses timestamps so dismissals expire after CONFIG.dismissalExpiryDays
// ─────────────────────────────────────────────────────────────────────────────
const KEYS = {
  dismissed:  "pp_popup_dismissed_at",
  subscribed: "pp_subscribed",
}

function isDismissedRecently() {
  try {
    const ts = localStorage.getItem(KEYS.dismissed)
    if (!ts) return false
    const daysSince = (Date.now() - Number(ts)) / (1000 * 60 * 60 * 24)
    return daysSince < CONFIG.dismissalExpiryDays
  } catch { return false }
}

function isSubscribed() {
  try { return !!localStorage.getItem(KEYS.subscribed) } catch { return false }
}

function markDismissed() {
  try { localStorage.setItem(KEYS.dismissed, String(Date.now())) } catch {}
}

function markSubscribed() {
  try { localStorage.setItem(KEYS.subscribed, "true") } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS HELPER
// Fires to window.analytics (Segment/GTM) if present — safe no-op otherwise
// ─────────────────────────────────────────────────────────────────────────────
function track(event, props = {}) {
  try {
    if (typeof window !== "undefined" && window.analytics?.track) {
      window.analytics.track(event, props)
    }
    // Also fire as a CustomEvent for GTM dataLayer listeners
    window.dispatchEvent(new CustomEvent("pp_analytics", { detail: { event, ...props } }))
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// COPY
// ─────────────────────────────────────────────────────────────────────────────
const COPY = {
  en: {
    eyebrow:       "Welcome",
    headlineLine1: "A little something",
    headlineLine2: "for joining us.",
    offer:         "10% off your first order.",
    subline:       "Join the Pure Peel list for drink inspiration, hosting ideas, and early access to what's next.",
    consent:       "By subscribing you agree to receive marketing emails. Unsubscribe anytime.",
    success:       "You're on the list. Check your email for your code.",
    placeholder:   "your@email.com",
    claim:         "Claim 10% Off",
    error:         "Something went wrong. Please try again.",
    noThanks:      "No thanks",
    imageAlt:      "Pure Peel Co.",
  },
  fr: {
    eyebrow:       "Bienvenue",
    headlineLine1: "Un petit quelque chose",
    headlineLine2: "pour vous accueillir.",
    offer:         "10 % de réduction sur votre première commande.",
    subline:       "Rejoignez la liste Pure Peel pour des idées de cocktails, des conseils pour recevoir, et un accès anticipé à ce qui arrive ensuite.",
    consent:       "En vous abonnant, vous acceptez de recevoir des courriels marketing. Désabonnez-vous à tout moment.",
    success:       "Vous êtes sur la liste. Vérifiez votre courriel pour votre code.",
    placeholder:   "votre@email.com",
    claim:         "Obtenir 10 % de réduction",
    error:         "Une erreur est survenue. Veuillez réessayer.",
    noThanks:      "Non merci",
    imageAlt:      "Pure Peel Co.",
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS (matches rest of site)
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  serif:     "'Cormorant Garamond', Georgia, serif",
  sans:      "'Jost', sans-serif",
  dark:      "#0f0a04",
  cream:     "#faf7f2",
  gold:      "#e8c84a",
  orange:    "#c85a08",
  textLight: "rgba(15,10,4,0.38)",
  border:    "rgba(15,10,4,0.1)",
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function EmailPopup() {
  const [isVisible, setIsVisible]   = useState(false)
  const [isMobile, setIsMobile]     = useState(false)
  const [email, setEmail]           = useState("")
  const [status, setStatus]         = useState("idle") // idle | loading | success | error
  const [errorDetail, setErrorDetail] = useState("")
  const { language }                = useLanguage()
  const copy                        = COPY[language] || COPY.en
  const triggerTimerRef             = useRef(null)
  const hasTriggeredRef             = useRef(false)

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // ── TRIGGER LOGIC ──────────────────────────────────────────────────────────
  const show = useCallback(() => {
    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true
    setIsVisible(true)
    track(CONFIG.analytics.shown, { trigger: "scroll_depth", language })
  }, [language])

  useEffect(() => {
    // Force-show for testing/design review
    const forceShow = new URLSearchParams(window.location.search).get(CONFIG.forceShowParam) === "1"

    if (forceShow) {
      triggerTimerRef.current = setTimeout(() => show(), 500)
      return
    }

    // Never show if already subscribed or dismissed recently
    if (isSubscribed() || isDismissedRecently()) return

    // Desktop: scroll depth trigger (+ exit intent as bonus)
    // Mobile: scroll depth only (exit intent unreliable on touch)
    const handleScroll = () => {
      const scrolled  = window.scrollY + window.innerHeight
      const total     = document.documentElement.scrollHeight
      const depth     = scrolled / total
      if (depth >= CONFIG.scrollDepthThreshold) {
        clearTimeout(triggerTimerRef.current)
        triggerTimerRef.current = setTimeout(show, CONFIG.triggerDelay)
        window.removeEventListener("scroll", handleScroll)
      }
    }

    const handleExitIntent = (e) => {
      if (e.clientY <= 0 && !isMobile) {
        clearTimeout(triggerTimerRef.current)
        show()
        document.removeEventListener("mouseleave", handleExitIntent)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    document.addEventListener("mouseleave", handleExitIntent)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mouseleave", handleExitIntent)
      clearTimeout(triggerTimerRef.current)
    }
  }, [show, isMobile])

  // ── SCROLL LOCK ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isVisible) {
      // Save scroll position to prevent iOS jump
      const scrollY = window.scrollY
      document.body.style.position   = "fixed"
      document.body.style.top        = `-${scrollY}px`
      document.body.style.width      = "100%"
      document.body.style.overflow   = "hidden"
      return () => {
        document.body.style.position = ""
        document.body.style.top      = ""
        document.body.style.width    = ""
        document.body.style.overflow = ""
        window.scrollTo(0, scrollY)
      }
    }
  }, [isVisible])

  // ── DISMISS ────────────────────────────────────────────────────────────────
  const handleDismiss = useCallback(() => {
    setIsVisible(false)
    markDismissed()
    track(CONFIG.analytics.dismissed, { language })
  }, [language])

  // ── KEYBOARD CLOSE ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isVisible) return
    const onKey = (e) => { if (e.key === "Escape") handleDismiss() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isVisible, handleDismiss])

  // ── SUBMIT ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) return

    setStatus("loading")
    setErrorDetail("")
    track(CONFIG.analytics.submitted, { language })

    try {
      // IMPORTANT: on production, the backend is hosted separately (Render).
      // If `VITE_API_URL` isn't configured in the deployment, we must still hit the right backend.
      const API_URL = (import.meta.env.VITE_API_URL || "https://pure-peel-website.onrender.com").replace(/\/$/, "")
      const res = await fetch(`${API_URL}/api/subscribe`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        // language tells your backend which Klaviyo list / welcome flow to use
        body: JSON.stringify({ email: trimmed, language, source: "popup" }),
      })

      if (res.ok) {
        setStatus("success")
        markSubscribed()
        track(CONFIG.analytics.success, { language })
        // Auto-close after 3.5s on success
        setTimeout(() => setIsVisible(false), 3500)
      } else {
        setStatus("error")
        track(CONFIG.analytics.error, { language, httpStatus: res.status })
        // Surface backend error message for easier debugging.
        try {
          const data = await res.json().catch(() => null)
          setErrorDetail(data?.error || data?.message || `Request failed (${res.status})`)
        } catch {
          setErrorDetail(`Request failed (${res.status})`)
        }
      }
    } catch (err) {
      setStatus("error")
      track(CONFIG.analytics.error, { language, error: err?.message })
    }
  }

  if (!isVisible) return null

  // ── SHARED CONTENT ─────────────────────────────────────────────────────────
  const Content = (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: isMobile ? "28px 24px 32px" : "44px 44px 44px 48px", justifyContent: "center" }}>

      {/* Eyebrow */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
        <div style={{ height: "1px", width: "20px", background: "rgba(232,200,74,0.5)" }} />
        <span style={{ fontFamily: C.sans, fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(200,90,8,0.7)", fontWeight: 400 }}>
          {copy.eyebrow}
        </span>
        <div style={{ height: "1px", width: "20px", background: "rgba(232,200,74,0.5)" }} />
      </div>

      {/* Headline */}
      <h2 style={{ fontFamily: C.serif, fontSize: isMobile ? "clamp(1.7rem,7vw,2.2rem)" : "clamp(1.9rem,2.5vw,2.6rem)", fontWeight: 300, fontStyle: "italic", lineHeight: 1.1, color: C.dark, margin: "0 0 10px" }}>
        {copy.headlineLine1}<br />{copy.headlineLine2}
      </h2>

      {/* Offer */}
      <p style={{ fontFamily: C.serif, fontSize: "1.05rem", fontStyle: "italic", color: "rgba(200,90,8,0.85)", fontWeight: 300, margin: "0 0 8px" }}>
        {copy.offer}
      </p>

      {/* Subline */}
      <p style={{ fontFamily: C.sans, fontSize: "0.75rem", fontWeight: 300, lineHeight: 1.7, color: "rgba(15,10,4,0.45)", margin: "0 0 22px" }}>
        {copy.subline}
      </p>

      {/* Success state */}
      {status === "success" ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 18px", border: "1px solid rgba(232,200,74,0.35)", borderRadius: "100px", background: "rgba(232,200,74,0.06)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(200,90,8,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span style={{ fontFamily: C.sans, fontSize: "0.72rem", letterSpacing: "0.08em", color: "rgba(200,90,8,0.8)" }}>
            {copy.success}
          </span>
        </div>
      ) : (
        <>
          {/* Email input + CTA */}
          <div style={{ display: "flex", width: "100%", border: `1px solid ${C.border}`, borderRadius: "100px", background: "#fff", marginBottom: "10px" }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder={copy.placeholder}
              autoComplete="email"
              style={{
                flex: 1, background: "transparent", outline: "none",
                padding: "11px 16px", fontFamily: C.sans, fontSize: "0.78rem",
                fontWeight: 300, color: C.dark, minWidth: 0,
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              style={{
                background: "linear-gradient(135deg, #f5e6a3 0%, #e8c84a 55%, #d4a832 100%)",
                borderRadius: "100px", margin: "3px",
                padding: "9px 16px", flexShrink: 0,
                fontFamily: C.sans, fontSize: "0.54rem", fontWeight: 500,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: C.dark, border: "none", cursor: status === "loading" ? "not-allowed" : "pointer",
                whiteSpace: "nowrap", opacity: status === "loading" ? 0.7 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {status === "loading" ? "..." : copy.claim}
            </button>
          </div>

          {/* Error */}
          {status === "error" && (
            <>
              <p style={{ fontFamily: C.sans, fontSize: "0.65rem", color: "rgba(200,60,60,0.75)", margin: "0 0 4px 4px" }}>
                {copy.error}
              </p>
              {errorDetail && (
                <p style={{ fontFamily: C.sans, fontSize: "0.58rem", color: "rgba(200,60,60,0.9)", margin: "0 0 8px 4px" }}>
                  {errorDetail}
                </p>
              )}
            </>
          )}

          {/* CASL / GDPR consent line */}
          <p style={{ fontFamily: C.sans, fontSize: "0.58rem", fontWeight: 300, lineHeight: 1.5, color: C.textLight, margin: "0 0 14px 2px" }}>
            {copy.consent}
          </p>

          {/* No thanks */}
          <button
            onClick={handleDismiss}
            style={{ fontFamily: C.sans, fontSize: "0.58rem", letterSpacing: "0.12em", color: C.textLight, textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
          >
            {copy.noThanks}
          </button>
        </>
      )}
    </div>
  )

  // ── MOBILE: bottom sheet ───────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <style>{`
          @keyframes ppSheetUp {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
        `}</style>

        {/* Backdrop */}
        <div
          onClick={handleDismiss}
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,10,4,0.5)", backdropFilter: "blur(3px)" }}
        />

        {/* Sheet */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.headlineLine1}
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 51,
            background: C.cream,
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -8px 48px rgba(15,10,4,0.2)",
            animation: "ppSheetUp 0.38s cubic-bezier(0.22,1,0.36,1)",
            maxHeight: "90vh", overflowY: "auto",
          }}
        >
          {/* Drag handle */}
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
            <div style={{ width: "36px", height: "4px", borderRadius: "100px", background: "rgba(15,10,4,0.12)" }} />
          </div>

          {/* Close */}
          <button
            onClick={handleDismiss}
            aria-label="Close"
            style={{ position: "absolute", top: "16px", right: "16px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(15,10,4,0.06)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="rgba(15,10,4,0.45)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>

          {Content}
        </div>
      </>
    )
  }

  // ── DESKTOP: centered modal ────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes ppModalIn {
          from { opacity: 0; transform: translate(-50%, -47%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleDismiss}
        style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,10,4,0.55)", backdropFilter: "blur(4px)" }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.headlineLine1}
        style={{
          position: "fixed", top: "50%", left: "50%", zIndex: 51,
          transform: "translate(-50%, -50%)",
          width: "min(92vw, 780px)",
          display: "flex", overflow: "hidden",
          borderRadius: "20px",
          boxShadow: "0 32px 80px rgba(15,10,4,0.38)",
          animation: "ppModalIn 0.38s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Left — content */}
        <div style={{ flex: 1, background: C.cream, minWidth: 0 }}>
          {Content}
        </div>

        {/* Right — image (hidden on narrow viewports via width) */}
        <div style={{ width: "280px", flexShrink: 0, position: "relative" }}>
          <img
            src="/images/driedcitrusbanner.jpg"
            alt={copy.imageAlt}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
          {/* Subtle left-edge fade so content bleeds nicely */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(250,247,242,0.2) 0%, transparent 35%)" }} />
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          aria-label="Close"
          style={{ position: "absolute", top: "12px", right: "12px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(250,247,242,0.88)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#fff"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(250,247,242,0.88)"}
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="rgba(15,10,4,0.5)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </button>
      </div>
    </>
  )
}