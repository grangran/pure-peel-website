import { useState, useEffect } from "react"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"
import { trackContactFormSubmit } from "../utils/analytics"
import LoadingSpinner from "./LoadingSpinner"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.2 })
  const [titleRef, isTitleVisible] = useScrollReveal({ threshold: 0.2, delay: 100 })
  const [formRef, isFormVisible] = useScrollReveal({ threshold: 0.1, delay: 200 })
  const { language } = useLanguage()

  // Handle URL parameters for pre-filling form (e.g., from bulk inquiry button)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const subject = urlParams.get('subject')
    const message = urlParams.get('message')
    
    if (message) {
      setFormData(prev => ({
        ...prev,
        message: message
      }))
    }
    
    // Clean up URL parameters after reading them
    if (subject || message) {
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')
      
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus("success")
        setFormData({ name: "", email: "", message: "" })
        // Track contact form submission
        trackContactFormSubmit()
      } else {
        setSubmitStatus("error")
        console.error("Contact form error:", data.error || data.details)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitStatus(null), 5000)
    }
  }

  return (
    <section id="contact" ref={sectionRef} className="bg-gray-100 py-20 px-5 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 
          ref={titleRef}
          className={`text-[clamp(1.75rem,4vw,2.5rem)] font-semibold mb-3 text-gray-900 tracking-tight transition-all duration-800 ${
            isTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {getTranslation(language, 'contact.title')}
        </h2>
        <p 
          className={`text-gray-600 mb-10 text-lg leading-relaxed transition-all duration-800 ${
            isTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          {getTranslation(language, 'contact.description')}
        </p>

        <form 
          ref={formRef}
          className={`flex flex-col gap-5 text-left transition-all duration-800 ${
            isFormVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col">
            <input
              type="text"
              name="name"
              id="contact-name"
              autoComplete="name"
              placeholder={getTranslation(language, 'contact.name')}
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full py-3.5 px-4 rounded-lg border border-gray-300 font-sans text-base transition-all duration-200 bg-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col">
            <input
              type="email"
              name="email"
              id="contact-email"
              autoComplete="email"
              placeholder={getTranslation(language, 'contact.email')}
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full py-3.5 px-4 rounded-lg border border-gray-300 font-sans text-base transition-all duration-200 bg-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col">
            <textarea
              name="message"
              id="contact-message"
              autoComplete="off"
              rows="5"
              placeholder={getTranslation(language, 'contact.message')}
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full py-3.5 px-4 rounded-lg border border-gray-300 font-sans text-base transition-all duration-200 bg-white resize-y min-h-[120px] leading-relaxed focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 text-base font-semibold rounded-lg border-0 cursor-pointer transition-all duration-300 uppercase tracking-wide font-sans bg-linear-to-br from-amber-500 to-amber-600 text-black shadow-[0_4px_15px_rgba(245,158,11,0.4)] mt-2.5 hover:from-amber-400 hover:to-amber-500 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoadingSpinner size="md" color="black" text={getTranslation(language, 'contact.sending')} />
            ) : (
              getTranslation(language, 'contact.sendMessage')
            )}
          </button>

          {submitStatus === "success" && (
            <div className="py-3.5 px-4.5 rounded-lg text-sm text-center mt-2.5 animate-[slideIn_0.3s_ease-out] bg-green-100 text-green-800 border border-green-300">
              {getTranslation(language, 'contact.success')}
            </div>
          )}

          {submitStatus === "error" && (
            <div className="py-3.5 px-4.5 rounded-lg text-sm text-center mt-2.5 animate-[slideIn_0.3s_ease-out] bg-red-100 text-red-800 border border-red-300">
              {getTranslation(language, 'contact.error')}
            </div>
          )}
        </form>
      </div>
    </section>
  )
}

