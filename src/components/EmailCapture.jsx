import { useState } from "react"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"

export default function EmailCapture() {
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.2 })
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle")
  const { language } = useLanguage()

  const copy = language === "fr"
    ? {
        eyebrow: "La liste",
        headlineLine1: "Pour les gens",
        headlineLine2: "qui reçoivent avec style.",
        subline: "Recettes de saison, idees pour recevoir et acces anticipé aux nouvelles creations - directement dans votre boite de reception.",
        success: "Vous êtes sur la liste.",
        placeholder: "votre@email.com",
        subscribe: "S'inscrire",
        error: "Une erreur est survenue. Veuillez réessayer.",
        privacy: "Pas de spam. Désabonnez-vous quand vous voulez."
      }
    : {
        eyebrow: "The List",
        headlineLine1: "For the ones",
        headlineLine2: "who entertain well.",
        subline: "Seasonal recipes, hosting ideas, and early access to new drops - straight to your inbox.",
        success: "You're on the list.",
        placeholder: "your@email.com",
        subscribe: "Subscribe",
        error: "Something went wrong. Please try again.",
        privacy: "No spam. Unsubscribe anytime."
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
        setEmail("")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit()
  }

  return (
    <section
      ref={sectionRef}
      className="w-full pt-28 pb-20 px-6"
      style={{ background: '#0f0a04' }}
    >
      <div
        className={`flex flex-col items-center text-center transition-all duration-700 ease-out ${
          isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
        style={{ maxWidth: '560px', margin: '0 auto' }}
      >

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-7">
          <div className="h-px w-8" style={{ background: 'rgba(232,200,74,0.25)' }} />
          <span
            className="uppercase"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '0.58rem',
              letterSpacing: '0.28em',
              color: 'rgba(232,200,74,0.55)'
            }}
          >
            The List
          </span>
          <div className="h-px w-8" style={{ background: 'rgba(232,200,74,0.25)' }} />
        </div>

        {/* Headline */}
        <h2
          className="italic font-light leading-tight mb-5"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 300,
            color: '#faf7f2'
          }}
        >
          {copy.headlineLine1}<br />{copy.headlineLine2}
        </h2>

        {/* Divider */}
        <div
          className="mb-6"
          style={{
            width: '32px',
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(232,200,74,0.4), transparent)'
          }}
        />

        {/* Subline */}
        <p
          className="mb-10"
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: '0.82rem',
            fontWeight: 300,
            lineHeight: 1.85,
            color: 'rgba(250,247,242,0.38)',
            maxWidth: '340px'
          }}
        >
          {copy.subline}
        </p>

        {/* Input row */}
        {status === "success" ? (
          <div
            className="flex items-center gap-3 px-6 py-4"
            style={{
              border: '1px solid rgba(232,200,74,0.2)',
              borderRadius: '100px',
              background: 'rgba(232,200,74,0.05)'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(232,200,74,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                color: 'rgba(232,200,74,0.8)'
              }}
            >
              {copy.success}
            </span>
          </div>
        ) : (
          <div
            className="flex w-full max-w-md overflow-hidden"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '100px',
              background: 'rgba(255,255,255,0.03)'
            }}
          >
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={copy.placeholder}
              className="flex-1 bg-transparent outline-none px-6 py-3.5 placeholder-white/20"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '0.8rem',
                fontWeight: 300,
                letterSpacing: '0.04em',
                color: 'rgba(250,247,242,0.8)'
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              className="px-6 py-3.5 shrink-0 transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #f5e6a3 0%, #e8c84a 55%, #d4a832 100%)',
                borderRadius: '100px',
                fontFamily: "'Jost', sans-serif",
                fontSize: '0.62rem',
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#0f0a04',
                margin: '4px'
              }}
            >
              {status === "loading" ? "..." : copy.subscribe}
            </button>
          </div>
        )}

        {status === "error" && (
          <p
            className="mt-3"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '0.68rem',
              color: 'rgba(255,100,80,0.7)',
              letterSpacing: '0.06em'
            }}
          >
            {copy.error}
          </p>
        )}

        {/* Privacy note */}
        <p
          className="mt-6"
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}
        >
          {copy.privacy}
        </p>

      </div>
    </section>
  )
}