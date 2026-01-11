import { useState, useRef } from "react"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"

export default function FAQ() {
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.05 })
  const { language } = useLanguage()
  const [openCategory, setOpenCategory] = useState(null)
  const [openQuestion, setOpenQuestion] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef(null)

  const faqData = getTranslation(language, 'faq')

  // Filter FAQs based on search query
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
      
      if (filteredQuestions.length > 0) {
        filtered[categoryKey] = {
          ...category,
          questions: filteredQuestions
        }
      }
    })

    return filtered
  }

  const filteredFAQs = filterFAQs(faqData.categories)

  const toggleCategory = (categoryKey) => {
    setOpenCategory(openCategory === categoryKey ? null : categoryKey)
    setOpenQuestion(null) // Close any open questions when switching categories
  }

  const toggleQuestion = (questionKey) => {
    setOpenQuestion(openQuestion === questionKey ? null : questionKey)
  }

  // Auto-open category if search query matches
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    if (e.target.value.trim()) {
      // Auto-open first matching category
      const firstCategory = Object.keys(filteredFAQs)[0]
      if (firstCategory && openCategory !== firstCategory) {
        setOpenCategory(firstCategory)
      }
    }
  }

  return (
    <section 
      ref={sectionRef} 
      className={`py-8 md:py-12 px-4 sm:px-6 bg-gray-50 min-h-screen transition-all duration-500 ${
        isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0 md:opacity-0 md:translate-y-8'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
            {faqData.title}
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            {faqData.description}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 md:mb-8">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={faqData.searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 md:py-4 pl-12 pr-4 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  searchInputRef.current?.focus()
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600 text-center">
              {Object.values(filteredFAQs).reduce((sum, cat) => sum + cat.questions.length, 0)} {faqData.resultsFound}
            </p>
          )}
        </div>

        {/* FAQ Categories */}
        <div className="space-y-4">
          {Object.keys(filteredFAQs).length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-600 text-lg">{faqData.noResults}</p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  searchInputRef.current?.focus()
                }}
                className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
              >
                {faqData.clearSearch}
              </button>
            </div>
          ) : (
            Object.keys(filteredFAQs).map((categoryKey) => {
              const category = filteredFAQs[categoryKey]
              const isCategoryOpen = openCategory === categoryKey

              return (
                <div
                  key={categoryKey}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(categoryKey)}
                    className="w-full px-4 sm:px-6 py-4 md:py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-amber-500/20 rounded-t-xl transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-amber-600 text-xl md:text-2xl">
                        {category.icon}
                      </div>
                      <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">
                          {category.title}
                        </h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                          {category.questions.length} {category.questions.length === 1 ? faqData.question : faqData.questions}
                        </p>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 md:w-6 md:h-6 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                        isCategoryOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Category Questions */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isCategoryOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-4 sm:px-6 pb-4 md:pb-6 space-y-3 border-t border-gray-100">
                      {category.questions.map((item, index) => {
                        const questionKey = `${categoryKey}-${index}`
                        const isQuestionOpen = openQuestion === questionKey

                        return (
                          <div
                            key={questionKey}
                            className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-amber-300 hover:shadow-sm"
                          >
                            {/* Question */}
                            <button
                              onClick={() => toggleQuestion(questionKey)}
                              className="w-full px-4 py-3 md:py-4 flex items-start justify-between text-left focus:outline-none focus:ring-2 focus:ring-amber-500/20 rounded-lg transition-colors hover:bg-gray-50"
                            >
                              <span className="text-sm md:text-base font-semibold text-gray-900 pr-4 flex-1">
                                {item.question}
                              </span>
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 mt-0.5 ${
                                  isQuestionOpen ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {/* Answer */}
                            <div
                              className={`overflow-hidden transition-all duration-300 ${
                                isQuestionOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                              }`}
                            >
                              <div className="px-4 pb-3 md:pb-4 pt-0">
                                <div className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                                  {item.answer}
                                </div>
                              </div>
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

        {/* Still Have Questions */}
        <div className="mt-8 md:mt-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 md:p-8 text-center">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {faqData.stillHaveQuestions.title}
          </h3>
          <p className="text-sm md:text-base text-gray-700 mb-4">
            {faqData.stillHaveQuestions.text}
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors duration-200 shadow-sm hover:shadow-md"
            onClick={(e) => {
              e.preventDefault()
              window.history.pushState({ page: '/contact' }, '', '/contact')
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
          >
            {faqData.stillHaveQuestions.button}
          </a>
        </div>