import { useState, useEffect } from "react"
import { useLanguage } from "../context/LanguageContext"

export default function EmailPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle")
  const { language } = useLanguage()

  const copy = language === "fr"
    ? {
        eyebrow: "Bienvenue",
        headlineLine1: "Un petit quelque chose",
        headlineLine2: "pour vous accueillir.",
        offer: "10 % de réduction sur votre première commande.",
        subline: "Rejoignez la liste Pure Peel pour des idees de cocktails, des conseils pour recevoir, et un acces anticipe a ce qui arrive ensuite - directement dans votre boite de reception.",
        success: "Vous êtes sur la liste. Vérifiez votre courriel pour votre code.",
        placeholder: "votre@email.com",
        claim: "Obtenir 10 % de réduction",
        error: "Une erreur est survenue. Veuillez réessayer.",
        noThanks: "Non merci",
        imageAlt: "Pure Peel Co."
      }
    : {
        eyebrow: "Welcome",
        headlineLine1: "A little something",
        headlineLine2: "for joining us.",
        offer: "10% off your first order.",
        subline: "Join the Pure Peel list for drink inspiration, hosting ideas, and early access to what's next.",
        success: "You're on the list. Check your email for your code.",
        placeholder: "your@email.com",
        claim: "Claim 10% Off",
        error: "Something went wrong. Please try again.",
        noThanks: "No thanks",
        imageAlt: "Pure Peel Co."
      }

  // Popup trigger logic
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const forceShow = urlParams.get("showpopup") === "1"

    if (!forceShow) {
      const dismissed = localStorage.getItem("pp_popup_dismissed")
      const subscribed = localStorage.getItem("pp_subscribed")
      if (dismissed || subscribed) return
    }

    const handleExitIntent = (e) => {
      if (e.clientY <= 0) setIsVisible(true)
    }
    const timer = setTimeout(() => setIsVisible(true), forceShow ? 500 : 35000)

    document.addEventListener("mouseleave", handleExitIntent)
    return () => {
      document.removeEventListener("mouseleave", handleExitIntent)
      clearTimeout(timer)
    }
  }, [])

  // Scroll lock
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isVisible])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("pp_popup_dismissed", "true")
  }

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return
    setStatus("loading")
    try {
      const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "")
      const res = await fetch(`${API_URL}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language })
      })
      if (res.ok) {
        setStatus("success")
        localStorage.setItem("pp_subscribed", "true")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(15,10,4,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={handleDismiss}
      />

      {/* Popup */}
      <div
        className="fixed z-50 flex overflow-hidden"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(90vw, 780px)',
          borderRadius: '20px',
          boxShadow: '0 32px 80px rgba(15,10,4,0.4)',
          animation: 'popupFadeIn 0.4s ease'
        }}
      >
        <style>{`
          @keyframes popupFadeIn {
            from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
            to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
        `}</style>

        {/* Left — Content */}
        <div
          className="flex flex-col justify-center px-6 sm:px-10 py-10 sm:py-12 flex-1"
          style={{ background: '#faf7f2' }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <div className="h-px w-6" style={{ background: 'rgba(232,200,74,0.5)' }} />
            <span
              className="uppercase"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '0.58rem',
                letterSpacing: '0.28em',
                color: 'rgba(200,90,8,0.7)'
              }}
            >
              {copy.eyebrow}
            </span>
            <div className="h-px w-6" style={{ background: 'rgba(232,200,74,0.5)' }} />
          </div>

          {/* Headline */}
          <h2
            className="italic font-light leading-tight mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              fontWeight: 300,
              color: '#0f0a04'
            }}
          >
            {copy.headlineLine1}<br />{copy.headlineLine2}
          </h2>

          {/* Offer */}
          <p
            className="mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1.1rem',
              fontStyle: 'italic',
              color: 'rgba(200,90,8,0.85)',
              fontWeight: 300
            }}
          >
            {copy.offer}
          </p>

          {/* Subtext */}
          <p
            className="mb-8"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '0.78rem',
              fontWeight: 300,
              lineHeight: 1.7,
              color: 'rgba(15,10,4,0.45)'
            }}
          >
            {copy.subline}
          </p>

          {/* Input */}
          {status === "success" ? (
            <div
              className="flex items-center gap-3 px-5 py-3.5"
              style={{
                border: '1px solid rgba(232,200,74,0.35)',
                borderRadius: '100px',
                background: 'rgba(232,200,74,0.06)'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(200,90,8,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                color: 'rgba(200,90,8,0.8)'
              }}>
                {copy.success}
              </span>
            </div>
          ) : (
            <>
              <div
                className="flex w-full mb-3"
                style={{
                  border: '1px solid rgba(15,10,4,0.12)',
                  borderRadius: '100px',
                  background: '#fff'
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder={copy.placeholder}
                  className="flex-1 bg-transparent outline-none px-5 py-3 text-stone-800 placeholder-stone-400"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '0.8rem',
                    fontWeight: 300
                  }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  className="px-4 py-3 shrink-0 transition-all duration-300 hover:opacity-90 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #f5e6a3 0%, #e8c84a 55%, #d4a832 100%)',
                    borderRadius: '100px',
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '0.56rem',
                    fontWeight: 500,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#0f0a04',
                    margin: '3px',
                    whiteSpace: 'nowrap',
                    lineHeight: 1,
                    flexShrink: 0
                  }}
                >
                  {status === "loading" ? "..." : copy.claim}
                </button>
              </div>

              {status === "error" && (
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.65rem', color: 'rgba(200,60,60,0.7)', marginBottom: '8px' }}>
                  {copy.error}
                </p>
              )}

              <button
                onClick={handleDismiss}
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  color: 'rgba(15,10,4,0.3)',
                  textTransform: 'uppercase',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {copy.noThanks}
              </button>
            </>
          )}
        </div>

        {/* Right — Image */}
        <div
          className="hidden md:block relative"
          style={{ width: '280px', flexShrink: 0 }}
        >
          <img
            src="/images/driedcitrusbanner.jpg"
            alt={copy.imageAlt}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(250,247,242,0.15) 0%, transparent 40%)' }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 hover:bg-black/10"
          style={{ background: 'rgba(250,247,242,0.9)', top: '12px', right: '12px' }}
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="rgba(15,10,4,0.5)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </button>
      </div>
    </>
  )
}