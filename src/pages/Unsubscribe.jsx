import { useState, useEffect } from "react"
import Nav from "../components/Nav"
import Footer from "../components/Footer"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"

const S = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'Jost', sans-serif",
  dark: "#0f0a04",
  cream: "#faf7f2",
  orange: "#c85a08",
  border: "rgba(15,10,4,0.08)",
  textLight: "rgba(15,10,4,0.45)",
}

function getApiUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/$/, "")
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") return window.location.origin
  return "http://localhost:3001"
}

export default function Unsubscribe() {
  const { language } = useLanguage()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle")
  const [queryBanner, setQueryBanner] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    if (token) {
      const api = getApiUrl()
      window.location.replace(`${api}/api/unsubscribe?token=${encodeURIComponent(token)}`)
      return
    }
    const s = params.get("status")
    if (s === "ok") setQueryBanner("success")
    else if (s === "invalid") setQueryBanner("invalid")
    else if (s === "error") setQueryBanner("error")
  }, [])

  const t = (key) => getTranslation(language, `unsubscribePage.${key}`)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes("@")) return
    setStatus("loading")
    try {
      const res = await fetch(`${getApiUrl()}/api/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })
      if (res.ok) {
        setStatus("success")
        setQueryBanner(null)
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  return (
    <>
      <Nav />
      <main
        style={{
          minHeight: "70vh",
          background: S.cream,
          padding: "clamp(48px, 8vw, 96px) 24px",
        }}
      >
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: S.serif,
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
              color: S.dark,
              margin: "0 0 12px",
            }}
          >
            {t("title")}
          </h1>
          <p style={{ fontFamily: S.sans, fontWeight: 300, fontSize: "0.95rem", color: S.textLight, margin: "0 0 28px", lineHeight: 1.65 }}>
            {t("intro")}
          </p>

          {queryBanner === "success" && (
            <p style={{ ...bannerStyle, borderColor: "rgba(16,185,129,0.35)", background: "rgba(16,185,129,0.08)" }}>{t("success")}</p>
          )}
          {queryBanner === "invalid" && (
            <p style={{ ...bannerStyle, borderColor: "rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.08)" }}>{t("invalid")}</p>
          )}
          {(queryBanner === "error" || status === "error") && (
            <p style={{ ...bannerStyle, borderColor: "rgba(220,38,38,0.35)", background: "rgba(220,38,38,0.06)" }}>{t("error")}</p>
          )}
          {status === "success" && !queryBanner && (
            <p style={{ ...bannerStyle, borderColor: "rgba(16,185,129,0.35)", background: "rgba(16,185,129,0.08)" }}>{t("success")}</p>
          )}

          {status !== "success" && (
            <form onSubmit={handleSubmit}>
              <label htmlFor="unsub-email" style={{ display: "block", fontFamily: S.sans, fontSize: "0.8rem", color: S.textLight, marginBottom: "8px" }}>
                {t("placeholder")}
              </label>
              <input
                id="unsub-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: `1px solid ${S.border}`,
                  fontFamily: S.sans,
                  fontSize: "0.9rem",
                  marginBottom: "16px",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  fontFamily: S.sans,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  border: "none",
                  background: `linear-gradient(135deg, #f5e6a3 0%, #e8c84a 55%, #d4a832 100%)`,
                  color: S.dark,
                  cursor: status === "loading" ? "wait" : "pointer",
                  opacity: status === "loading" ? 0.7 : 1,
                }}
              >
                {status === "loading" ? t("submitting") : t("submit")}
              </button>
            </form>
          )}

          <p style={{ fontFamily: S.sans, fontSize: "0.78rem", color: S.textLight, marginTop: "28px", lineHeight: 1.6 }}>{t("note")}</p>
        </div>
      </main>
      <Footer />
    </>
  )
}

const bannerStyle = {
  fontFamily: S.sans,
  fontSize: "0.88rem",
  fontWeight: 400,
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid",
  marginBottom: "20px",
  lineHeight: 1.5,
  color: S.dark,
}
