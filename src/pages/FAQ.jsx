import { useState, useRef } from "react"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"

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

export default function FAQ() {
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.05 })
  const { language }       = useLanguage()
  const [openCategory, setOpenCategory]   = useState(null)
  const [openQuestion, setOpenQuestion]   = useState(null)
  const [searchQuery, setSearchQuery]     = useState("")
  const searchInputRef = useRef(null)

  const faqData = getTranslation(language, 'faq')

  const filterFAQs = (categories) => {
    if (!searchQuery.trim()) return categories
    const query = searchQuery.toLowerCase().trim()
    const filtered = {}
    Object.keys(categories).forEach(categoryKey => {
      const category = categories[categoryKey]
      const filteredQuestions = category.questions.filter(q =>
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query)
      )
      if (filteredQuestions.length > 0) filtered[categoryKey] = { ...category, questions: filteredQuestions }
    })
    return filtered
  }

  const filteredFAQs = filterFAQs(faqData.categories)

  const toggleCategory = (key) => { setOpenCategory(openCategory === key ? null : key); setOpenQuestion(null) }
  const toggleQuestion  = (key) => setOpenQuestion(openQuestion === key ? null : key)

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    if (e.target.value.trim()) {
      const firstCategory = Object.keys(filteredFAQs)[0]
      if (firstCategory && openCategory !== firstCategory) setOpenCategory(firstCategory)
    }
  }

  return (
    <section
      ref={sectionRef}
      style={{ background: S.cream, minHeight: "100vh", padding: "80px 20px 96px" }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ height: "1px", width: "20px", background: "rgba(200,90,8,0.4)" }} />
            <span style={{ fontFamily: S.sans, fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(200,90,8,0.6)" }}>
              Pure Peel Co.
            </span>
            <div style={{ height: "1px", width: "20px", background: "rgba(200,90,8,0.4)" }} />
          </div>
          <h1 style={{
            fontFamily: S.serif, fontSize: "clamp(2rem,4vw,3rem)",
            fontWeight: 300, fontStyle: "italic", color: S.dark,
            letterSpacing: "-0.01em", marginBottom: "12px",
          }}>
            {faqData.title}
          </h1>
          <p style={{ fontFamily: S.sans, fontSize: "0.8rem", fontWeight: 300, color: S.textMid, lineHeight: 1.7, maxWidth: "480px", margin: "0 auto" }}>
            {faqData.description}
          </p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ position: "relative" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", stroke: S.textLight, strokeWidth: 2, pointerEvents: "none" }}>
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              ref={searchInputRef} type="text"
              placeholder={faqData.searchPlaceholder}
              value={searchQuery} onChange={handleSearchChange}
              style={{
                width: "100%", padding: "12px 44px",
                borderRadius: "10px", border: `1px solid ${S.border}`,
                background: "#fff", fontFamily: S.sans,
                fontSize: "0.8rem", fontWeight: 300, color: S.dark,
                outline: "none", transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(200,90,8,0.4)"}
              onBlur={e => e.target.style.borderColor = S.border}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); searchInputRef.current?.focus() }}
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.textLight} strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p style={{ fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 300, color: S.textLight, textAlign: "center", marginTop: "8px" }}>
              {Object.values(filteredFAQs).reduce((sum, cat) => sum + cat.questions.length, 0)} {faqData.resultsFound}
            </p>
          )}
        </div>

        {/* Categories */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Object.keys(filteredFAQs).length === 0 ? (
            <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${S.border}`, padding: "40px", textAlign: "center" }}>
              <p style={{ fontFamily: S.sans, fontSize: "0.8rem", fontWeight: 300, color: S.textMid, marginBottom: "14px" }}>{faqData.noResults}</p>
              <button onClick={() => { setSearchQuery(""); searchInputRef.current?.focus() }}
                style={{ fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: S.orange, background: "none", border: "none", cursor: "pointer" }}>
                {faqData.clearSearch}
              </button>
            </div>
          ) : (
            Object.keys(filteredFAQs).map(categoryKey => {
              const category       = filteredFAQs[categoryKey]
              const isCategoryOpen = openCategory === categoryKey

              return (
                <div key={categoryKey} style={{
                  background: "#fff", borderRadius: "12px",
                  border: `1px solid ${S.border}`, overflow: "hidden",
                  transition: "box-shadow 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(15,10,4,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                >
                  {/* Category header */}
                  <button onClick={() => toggleCategory(categoryKey)} style={{
                    width: "100%", padding: "20px 24px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ fontSize: "1.2rem" }}>{category.icon}</span>
                      <div>
                        <h2 style={{ fontFamily: S.serif, fontSize: "1.15rem", fontWeight: 400, fontStyle: "italic", color: S.dark, margin: 0 }}>
                          {category.title}
                        </h2>
                        <p style={{ fontFamily: S.sans, fontSize: "0.62rem", fontWeight: 300, color: S.textLight, margin: "2px 0 0", letterSpacing: "0.04em" }}>
                          {category.questions.length} {category.questions.length === 1 ? faqData.question : faqData.questions}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                      border: `1px solid ${isCategoryOpen ? "transparent" : S.border}`,
                      background: isCategoryOpen ? S.dark : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.25s",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                        style={{ stroke: isCategoryOpen ? "#fff" : S.textMid, transition: "transform 0.25s", transform: isCategoryOpen ? "rotate(180deg)" : "none" }}>
                        <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>

                  {/* Questions */}
                  <div style={{
                    maxHeight: isCategoryOpen ? "5000px" : "0",
                    overflow: "hidden",
                    transition: "max-height 0.4s cubic-bezier(0.22,1,0.36,1)",
                  }}>
                    <div style={{ padding: "0 24px 20px", borderTop: `1px solid ${S.border}`, display: "flex", flexDirection: "column", gap: "8px", paddingTop: "16px" }}>
                      {category.questions.map((item, index) => {
                        const questionKey  = `${categoryKey}-${index}`
                        const isOpen       = openQuestion === questionKey

                        return (
                          <div key={questionKey} style={{
                            borderRadius: "10px",
                            border: `1px solid ${isOpen ? "rgba(200,90,8,0.2)" : S.border}`,
                            background: isOpen ? "rgba(200,90,8,0.02)" : "#fff",
                            overflow: "hidden", transition: "border-color 0.2s, background 0.2s",
                          }}>
                            <button onClick={() => toggleQuestion(questionKey)} style={{
                              width: "100%", padding: "14px 18px",
                              display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px",
                              background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                            }}>
                              <span style={{ fontFamily: S.sans, fontSize: "0.8rem", fontWeight: isOpen ? 400 : 300, color: S.dark, flex: 1, lineHeight: 1.5 }}>
                                {item.question}
                              </span>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" flexShrink="0"
                                style={{ stroke: S.textLight, transition: "transform 0.25s", transform: isOpen ? "rotate(180deg)" : "none", marginTop: "3px", flexShrink: 0 }}>
                                <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            <div style={{
                              maxHeight: isOpen ? "1000px" : "0",
                              overflow: "hidden",
                              transition: "max-height 0.35s cubic-bezier(0.22,1,0.36,1)",
                            }}>
                              <p style={{
                                fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300,
                                color: S.textMid, lineHeight: 1.85,
                                padding: "0 18px 16px", whiteSpace: "pre-line",
                              }}>
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Still have questions */}
        <div style={{
          marginTop: "48px", padding: "40px",
          background: S.creamDark, borderRadius: "14px",
          border: `1px solid ${S.border}`, textAlign: "center",
        }}>
          <h3 style={{ fontFamily: S.serif, fontSize: "1.6rem", fontWeight: 300, fontStyle: "italic", color: S.dark, marginBottom: "10px" }}>
            {faqData.stillHaveQuestions.title}
          </h3>
          <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid, lineHeight: 1.7, marginBottom: "24px" }}>
            {faqData.stillHaveQuestions.text}
          </p>
          <a href="/contact"
            onClick={e => { e.preventDefault(); window.history.pushState({ page: '/contact' }, '', '/contact'); window.dispatchEvent(new PopStateEvent('popstate')) }}
            style={{
              display: "inline-block", padding: "13px 32px",
              borderRadius: "100px",
              background: "linear-gradient(135deg,#f5e6a3 0%,#e8c84a 55%,#d4a832 100%)",
              fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 500,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: S.dark, textDecoration: "none",
              boxShadow: "0 4px 20px rgba(232,200,74,0.28)",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            {faqData.stillHaveQuestions.button}
          </a>
        </div>

      </div>
    </section>
  )
}