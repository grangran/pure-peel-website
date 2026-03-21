import { useState, useEffect } from "react"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"
import { trackContactFormSubmit } from "../utils/analytics"
import { getApiBaseUrl } from "../utils/apiBaseUrl"
import LoadingSpinner from "./LoadingSpinner"

const S = {
  serif:     "'Cormorant Garamond', Georgia, serif",
  sans:      "'Jost', sans-serif",
  dark:      "#0f0a04",
  cream:     "#faf7f2",
  creamDark: "#f2ece0",
  orange:    "#c85a08",
  border:    "rgba(15,10,4,0.08)",
  textMid:   "rgba(15,10,4,0.5)",
  textLight: "rgba(15,10,4,0.35)",
}

const inputStyle = {
  width: "100%", padding: "12px 16px",
  borderRadius: "10px", border: `1px solid ${S.border}`,
  background: "#fff", fontFamily: S.sans,
  fontSize: "0.82rem", fontWeight: 300, color: S.dark,
  outline: "none", transition: "border-color 0.2s",
}

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", inquiryType: "", message: "" })
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [submitStatus, setSubmitStatus]   = useState(null)
  const [sectionRef, isSectionVisible]    = useScrollReveal({ threshold: 0.2 })
  const [titleRef, isTitleVisible]        = useScrollReveal({ threshold: 0.2, delay: 100 })
  const [formRef, isFormVisible]          = useScrollReveal({ threshold: 0.1, delay: 200 })
  const { language }                      = useLanguage()

  useEffect(() => {
    const urlParams   = new URLSearchParams(window.location.search)
    const message     = urlParams.get('message')
    const inquiryType = urlParams.get('inquiryType')
    if (inquiryType) setFormData(prev => ({ ...prev, inquiryType }))
    if (message)     setFormData(prev => ({ ...prev, message }))
    if (message || inquiryType) window.history.replaceState({}, '', window.location.pathname)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true); setSubmitStatus(null)
    try {
      const API_URL = getApiBaseUrl()
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setSubmitStatus("success")
        setFormData({ name: "", email: "", inquiryType: "", message: "" })
        trackContactFormSubmit()
      } else {
        setSubmitStatus("error")
      }
    } catch {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitStatus(null), 5000)
    }
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{ background: S.cream, padding: "96px 20px" }}
    >
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>

        {/* Header */}
        <div
          ref={titleRef}
          style={{
            textAlign: "center", marginBottom: "48px",
            opacity: isTitleVisible ? 1 : 0,
            transform: isTitleVisible ? "none" : "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ height: "1px", width: "20px", background: "rgba(200,90,8,0.4)" }} />
            <span style={{ fontFamily: S.sans, fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(200,90,8,0.6)" }}>
              Pure Peel Co.
            </span>
            <div style={{ height: "1px", width: "20px", background: "rgba(200,90,8,0.4)" }} />
          </div>
          <h2 style={{
            fontFamily: S.serif, fontSize: "clamp(2rem,4vw,3rem)",
            fontWeight: 300, fontStyle: "italic", color: S.dark,
            letterSpacing: "-0.01em", marginBottom: "12px",
          }}>
            {getTranslation(language, 'contact.title')}
          </h2>
          <p style={{ fontFamily: S.sans, fontSize: "0.8rem", fontWeight: 300, color: S.textMid, lineHeight: 1.7 }}>
            {getTranslation(language, 'contact.description')}
          </p>
        </div>

        {/* Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          style={{
            display: "flex", flexDirection: "column", gap: "14px",
            opacity: isFormVisible ? 1 : 0,
            transform: isFormVisible ? "none" : "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
            transitionDelay: "100ms",
          }}
        >
          {/* Name */}
          <input
            type="text" name="name" id="contact-name" autoComplete="name"
            placeholder={getTranslation(language, 'contact.name')}
            value={formData.name} onChange={handleChange} required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "rgba(200,90,8,0.4)"}
            onBlur={e => e.target.style.borderColor = S.border}
          />

          {/* Email */}
          <input
            type="email" name="email" id="contact-email" autoComplete="email"
            placeholder={getTranslation(language, 'contact.email')}
            value={formData.email} onChange={handleChange} required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "rgba(200,90,8,0.4)"}
            onBlur={e => e.target.style.borderColor = S.border}
          />

          {/* Inquiry type */}
          <select
            name="inquiryType" id="contact-inquiry-type"
            value={formData.inquiryType} onChange={handleChange} required
            style={{ ...inputStyle, appearance: "none", cursor: "pointer", color: formData.inquiryType ? S.dark : S.textLight }}
            onFocus={e => e.target.style.borderColor = "rgba(200,90,8,0.4)"}
            onBlur={e => e.target.style.borderColor = S.border}
          >
            <option value="">{getTranslation(language, 'contact.inquiryTypePlaceholder')}</option>
            <option value="general">{getTranslation(language, 'contact.inquiryType.general')}</option>
            <option value="support">{getTranslation(language, 'contact.inquiryType.support')}</option>
            <option value="shipping">{getTranslation(language, 'contact.inquiryType.shipping')}</option>
            <option value="bulk">{getTranslation(language, 'contact.inquiryType.bulk')}</option>
          </select>

          {/* Message */}
          <textarea
            name="message" id="contact-message" rows="5"
            placeholder={getTranslation(language, 'contact.message')}
            value={formData.message} onChange={handleChange} required
            style={{ ...inputStyle, resize: "vertical", minHeight: "120px", lineHeight: 1.7 }}
            onFocus={e => e.target.style.borderColor = "rgba(200,90,8,0.4)"}
            onBlur={e => e.target.style.borderColor = S.border}
          />

          {/* Submit */}
          <button
            type="submit" disabled={isSubmitting}
            style={{
              width: "100%", padding: "16px",
              borderRadius: "12px", border: "none",
              background: isSubmitting
                ? "rgba(15,10,4,0.08)"
                : "linear-gradient(135deg,#f5e6a3 0%,#e8c84a 55%,#d4a832 100%)",
              fontFamily: S.sans, fontSize: "0.74rem", fontWeight: 500,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: isSubmitting ? S.textLight : S.dark,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              marginTop: "6px",
              boxShadow: isSubmitting ? "none" : "0 6px 24px rgba(232,200,74,0.28)",
              transition: "all 0.2s ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
            onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.transform = "translateY(-2px)" }}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            {isSubmitting ? (
              <LoadingSpinner size="md" color="dark" text={getTranslation(language, 'contact.sending')} />
            ) : (
              getTranslation(language, 'contact.sendMessage')
            )}
          </button>

          {/* Success */}
          {submitStatus === "success" && (
            <div style={{
              padding: "14px 18px", borderRadius: "10px",
              background: "rgba(90,154,40,0.06)", border: "1px solid rgba(90,154,40,0.2)",
              fontFamily: S.sans, fontSize: "0.75rem", fontWeight: 300,
              color: "#3a7a14", textAlign: "center", lineHeight: 1.6,
            }}>
              {getTranslation(language, 'contact.success')}
            </div>
          )}

          {/* Error */}
          {submitStatus === "error" && (
            <div style={{
              padding: "14px 18px", borderRadius: "10px",
              background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)",
              fontFamily: S.sans, fontSize: "0.75rem", fontWeight: 300,
              color: "#dc2626", textAlign: "center", lineHeight: 1.6,
            }}>
              {getTranslation(language, 'contact.error')}
            </div>
          )}
        </form>

        {/* Whisper */}
        <p style={{
          fontFamily: S.serif, fontSize: "0.82rem", fontStyle: "italic",
          color: S.textMid, textAlign: "center", marginTop: "36px",
        }}>
          We typically respond within 1–2 business days.
        </p>

      </div>
    </section>
  )
}