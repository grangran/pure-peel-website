import { useEffect, useState } from "react"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { useCurrency } from "../context/CurrencyContext"
import { getTranslation } from "../utils/translations"

export default function ShippingReturns() {
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.1 })
  const { language } = useLanguage()
  const { formatPrice, currency: contextCurrency, setCurrency, convertPrice } = useCurrency()
  const [currency, setLocalCurrency] = useState(() => {
    // Read from localStorage immediately on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currency')
      return (stored === 'CAD' || stored === 'USD') ? stored : 'CAD'
    }
    return 'CAD'
  })

  // Helper function to format price with explicit currency code (USD/CAD)
  const formatPriceWithCurrency = (priceCAD) => {
    const convertedPrice = convertPrice(priceCAD)
    // Always format with explicit currency code for consistency
    const numericValue = parseFloat(convertedPrice.toFixed(2))
    
    if (currency === 'USD') {
      return `$${numericValue.toFixed(2)} USD`
    } else {
      return `$${numericValue.toFixed(2)} CAD`
    }
  }

  // Sync currency from context and localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCurrency = localStorage.getItem('currency')
      // Priority: localStorage > context
      if (storedCurrency && (storedCurrency === 'CAD' || storedCurrency === 'USD')) {
        if (storedCurrency !== currency) {
          console.log('🔄 Shipping page: Syncing currency from localStorage:', storedCurrency)
          setLocalCurrency(storedCurrency)
          setCurrency(storedCurrency) // Also update context
        }
      } else if (contextCurrency && contextCurrency !== currency) {
        // Fallback to context if localStorage is empty
        console.log('🔄 Shipping page: Syncing currency from context:', contextCurrency)
        setLocalCurrency(contextCurrency)
      }
    }
  }, [contextCurrency, currency, setCurrency])
  
  // Debug: Log current currency on render
  useEffect(() => {
    console.log('💰 Shipping page current currency:', currency)
  }, [currency])

  // Update local currency when context changes (to stay in sync)
  useEffect(() => {
    if (contextCurrency && contextCurrency !== currency) {
      const stored = localStorage.getItem('currency')
      if (!stored || stored === contextCurrency) {
        setLocalCurrency(contextCurrency)
      }
    }
  }, [contextCurrency, currency])

  return (
    <section 
      key={`shipping-returns-${currency}`}
      ref={sectionRef} 
      className={`py-8 md:py-12 px-4 sm:px-6 md:px-8 bg-[#f6f9fc] min-h-screen transition-all duration-500 ${
        isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0 md:opacity-0 md:translate-y-8'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{getTranslation(language, 'shipping.title')}</h1>
          <p className="text-sm text-[#6b7280] max-w-2xl mx-auto">{getTranslation(language, 'shipping.subtitle')}</p>
        </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm border border-[#e3e8ef] p-6 mb-6">
          <div className="mb-6 pb-4 border-b border-[#e3e8ef]">
            <h2 className="text-lg font-semibold text-gray-900">{getTranslation(language, 'shipping.shippingInfo.title')}</h2>
          </div>
          
          {/* Shipping to Canada */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🇨🇦</span>
              <h3 className="text-base font-semibold text-gray-900">Canada-Wide Shipping</h3>
            </div>
            <p className="text-sm text-[#425466] mb-4">
              We ship from Canada to all provinces and territories across the country.
            </p>
            <div className="space-y-2">
              <div className="group border border-[#e3e8ef] rounded-lg p-4 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                        <svg className="w-4 h-4 text-[#425466] group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-base md:text-lg text-gray-900">{getTranslation(language, 'shipping.shippingInfo.methods.regular.name')}</h4>
                    </div>
                    <p className="text-xs md:text-sm text-[#425466] mb-2 ml-10">{getTranslation(language, 'shipping.shippingInfo.methods.regular.description')}</p>
                  </div>
                  <div className="text-right sm:text-left sm:ml-4 ml-10 sm:ml-0">
                    <div className="flex items-center gap-1.5 justify-end sm:justify-start mb-1">
                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm md:text-base font-semibold text-gray-900">{getTranslation(language, 'shipping.shippingInfo.methods.regular.time')}</span>
                    </div>
                    <span className="text-xs text-[#425466]">{getTranslation(language, 'shipping.shippingInfo.methods.priceNote')}</span>
                  </div>
                </div>
              </div>
              
              <div className="group border border-[#e3e8ef] rounded-lg p-4 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                        <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-base md:text-lg text-gray-900">{getTranslation(language, 'shipping.shippingInfo.methods.expedited.name')}</h4>
                    </div>
                    <p className="text-xs md:text-sm text-[#425466] mb-2 ml-10">{getTranslation(language, 'shipping.shippingInfo.methods.expedited.description')}</p>
                  </div>
                  <div className="text-right sm:text-left sm:ml-4 ml-10 sm:ml-0">
                    <div className="flex items-center gap-1.5 justify-end sm:justify-start mb-1">
                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm md:text-base font-semibold text-gray-900">{getTranslation(language, 'shipping.shippingInfo.methods.expedited.time')}</span>
                    </div>
                    <span className="text-xs text-[#425466]">{getTranslation(language, 'shipping.shippingInfo.methods.priceNote')}</span>
                  </div>
                </div>
              </div>
              
              <div className="group border border-amber-500 bg-amber-50 rounded-lg p-4 hover:border-amber-600 hover:bg-amber-100 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center group-hover:bg-amber-600 transition-colors shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-base md:text-lg text-gray-900">{getTranslation(language, 'shipping.shippingInfo.methods.xpresspost.name')}</h4>
                    </div>
                    <p className="text-xs md:text-sm text-[#425466] mb-2 ml-10">{getTranslation(language, 'shipping.shippingInfo.methods.xpresspost.description')}</p>
                  </div>
                  <div className="text-right sm:text-left sm:ml-4 ml-10 sm:ml-0">
                    <div className="flex items-center gap-1.5 justify-end sm:justify-start mb-1">
                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm md:text-base font-semibold text-gray-900">{getTranslation(language, 'shipping.shippingInfo.methods.xpresspost.time')}</span>
                    </div>
                    <span className="text-xs text-[#425466]">{getTranslation(language, 'shipping.shippingInfo.methods.priceNote')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping to United States */}
          <div className="mb-5 md:mb-6 pt-8 border-t-2 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🇺🇸</span>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">United States-Wide Shipping</h3>
            </div>
            <p className="text-sm md:text-base text-[#425466] mb-6">
              We ship from Canada to all 50 states across America. Select 'United States' as your country during checkout to see available shipping options.
            </p>
            <div className="space-y-3 md:space-y-4">
              <div className="group border border-[#e3e8ef] rounded-lg p-4 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                        <svg className="w-4 h-4 text-[#425466] group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-base md:text-lg text-gray-900">Tracked Packet - USA</h4>
                    </div>
                    <p className="text-xs md:text-sm text-[#425466] mb-2 ml-10">Standard delivery to US with tracking (4-7 business days)</p>
                  </div>
                  <div className="text-right sm:text-left sm:ml-4 ml-10 sm:ml-0">
                    <div className="flex items-center gap-1.5 justify-end sm:justify-start mb-1">
                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm md:text-base font-semibold text-gray-900">4-7 business days</span>
                    </div>
                    <span className="text-xs text-[#425466]">{getTranslation(language, 'shipping.shippingInfo.methods.priceNote')}</span>
                  </div>
                </div>
              </div>
              
              <div className="group border border-[#e3e8ef] rounded-lg p-4 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                        <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-base md:text-lg text-gray-900">Xpresspost - USA</h4>
                    </div>
                    <p className="text-xs md:text-sm text-[#425466] mb-2 ml-10">Faster delivery to US with tracking and insurance (2-3 business days)</p>
                  </div>
                  <div className="text-right sm:text-left sm:ml-4 ml-10 sm:ml-0">
                    <div className="flex items-center gap-1.5 justify-end sm:justify-start mb-1">
                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm md:text-base font-semibold text-gray-900">2-3 business days</span>
                    </div>
                    <span className="text-xs text-[#425466]">{getTranslation(language, 'shipping.shippingInfo.methods.priceNote')}</span>
                  </div>
                </div>
              </div>
              
              <div className="group border border-amber-500 bg-amber-50 rounded-lg p-4 hover:border-amber-600 hover:bg-amber-100 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center group-hover:bg-amber-600 transition-colors shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-base md:text-lg text-gray-900">Priority Worldwide - USA</h4>
                    </div>
                    <p className="text-xs md:text-sm text-[#425466] mb-2 ml-10">Express delivery to US with signature (1-2 business days)</p>
                  </div>
                  <div className="text-right sm:text-left sm:ml-4 ml-10 sm:ml-0">
                    <div className="flex items-center gap-1.5 justify-end sm:justify-start mb-1">
                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm md:text-base font-semibold text-gray-900">1-2 business days</span>
                    </div>
                    <span className="text-xs text-[#425466]">{getTranslation(language, 'shipping.shippingInfo.methods.priceNote')}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs md:text-sm text-[#425466] italic mt-4">
              Prices shown are in <strong className="font-semibold text-gray-900">{currency}</strong>. Delivery times are estimates and may vary based on destination and customs processing. Packages are shipped via Canada Post and delivered by USPS within the United States.
            </p>
          </div>

          {/* Shipping Times */}
          <div className="mb-5 md:mb-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">{getTranslation(language, 'shipping.shippingTimes.title')}</h3>
            </div>
            <p className="text-sm md:text-base text-[#425466] mb-4">
              {getTranslation(language, 'shipping.shippingTimes.text1')}
            </p>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-4 md:p-5 mb-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm md:text-base text-gray-900 font-semibold">{getTranslation(language, 'shipping.shippingTimes.processingSchedule')}</p>
              </div>
              <ul className="space-y-2 text-xs md:text-sm text-[#425466] ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{getTranslation(language, 'shipping.shippingTimes.schedule1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{getTranslation(language, 'shipping.shippingTimes.schedule2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{getTranslation(language, 'shipping.shippingTimes.schedule3')}</span>
                </li>
              </ul>
            </div>
            <p className="text-sm md:text-base text-[#425466] mb-3">
              {getTranslation(language, 'shipping.shippingTimes.text2')}
            </p>
            <p className="text-sm md:text-base text-[#425466]">
              <strong>{getTranslation(language, 'shipping.shippingTimes.note')}</strong>
            </p>
          </div>

          {/* Shipping Costs */}
          <div className="mb-5 md:mb-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">{getTranslation(language, 'shipping.shippingCosts.title')}</h3>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-lg p-4 md:p-5 mb-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm md:text-base text-gray-900 font-semibold">How Shipping Costs Work:</p>
              </div>
              <ul className="space-y-2 text-xs md:text-sm text-[#425466] ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Shipping costs are calculated automatically at checkout based on your destination</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Rates vary by location, package weight, and selected shipping method</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Canada: Prices vary by weight, destination, and shipping method - calculated at checkout</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>United States: Prices vary by weight, destination, and shipping method - calculated at checkout</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>All prices shown are in <strong className="font-semibold text-gray-900">{currency}</strong> - use the currency selector in the navigation to switch between CAD and USD</span>
                </li>
              </ul>
            </div>
            <p className="text-sm md:text-base text-[#425466]">
              {getTranslation(language, 'shipping.shippingCosts.text1')}
            </p>
          </div>

          {/* Order Tracking */}
          <div className="mb-5 md:mb-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">{getTranslation(language, 'shipping.orderTracking.title')}</h3>
            </div>
            <p className="text-sm md:text-base text-[#425466] mb-4">
              {getTranslation(language, 'shipping.orderTracking.text1')}
            </p>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-lg p-4 md:p-5 shadow-sm">
              <ul className="space-y-3 text-xs md:text-sm text-[#425466]">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{getTranslation(language, 'shipping.orderTracking.item1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{getTranslation(language, 'shipping.orderTracking.item2')} <a href="https://www.canadapost.ca/trackweb" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-gray-900 font-medium">canadapost.ca/trackweb</a></span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{getTranslation(language, 'shipping.orderTracking.item3')} <a href="/order-tracking" className="text-gray-900 hover:text-gray-900 font-medium">{getTranslation(language, 'shipping.orderTracking.trackYourOrder')}</a></span>
                </li>
              </ul>
            </div>
            <p className="text-sm md:text-base text-[#425466] mt-4">
              {getTranslation(language, 'shipping.orderTracking.text2')}
            </p>
          </div>

          {/* Damaged or Lost Packages */}
          <div className="mb-5 md:mb-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">{getTranslation(language, 'shipping.damagedOrLost.title')}</h3>
            </div>
            <p className="text-sm md:text-base text-[#425466] mb-4">
              {getTranslation(language, 'shipping.damagedOrLost.text1')}
            </p>
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-lg p-4 md:p-5 shadow-sm">
              <ul className="space-y-3 text-xs md:text-sm text-[#425466]">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span><strong>{getTranslation(language, 'shipping.damagedOrLost.damagedItems')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span><strong>{getTranslation(language, 'shipping.damagedOrLost.lostPackages')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span><strong>{getTranslation(language, 'shipping.damagedOrLost.incorrectItems')}</strong></span>
                </li>
              </ul>
            </div>
            <p className="text-sm md:text-base text-[#425466] mt-4">
              {getTranslation(language, 'shipping.damagedOrLost.text2')}
            </p>
          </div>


          {/* International Shipping */}
          <div className="pt-6 border-t-2 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">{getTranslation(language, 'shipping.internationalShipping.title')}</h3>
            </div>
            <p className="text-sm md:text-base text-[#425466] mb-3">
              {getTranslation(language, 'shipping.internationalShipping.text1')} <a href="/contact?inquiryType=shipping" className="text-gray-900 hover:text-gray-900 font-medium">shipping@purepeelco.com</a>.
            </p>
            <p className="text-sm md:text-base text-[#425466]">
              {getTranslation(language, 'shipping.internationalShipping.text2')}
            </p>
          </div>
        </div>

        {/* Issue Resolution & Product Replacement */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e3e8ef] p-6">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{getTranslation(language, 'shipping.returns.title')}</h2>
          </div>
          
          {/* No Returns Policy */}
          <div className="mb-5 md:mb-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">{getTranslation(language, 'shipping.returns.policy.title')}</h3>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-lg p-4 md:p-5 mb-4 shadow-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm md:text-base text-gray-900 font-semibold mb-2">{getTranslation(language, 'shipping.returns.policy.noReturns')}</p>
                  <p className="text-xs md:text-sm text-[#425466]">
                    {getTranslation(language, 'shipping.returns.policy.noReturnsText')}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm md:text-base text-[#425466] mb-3">
              {getTranslation(language, 'shipping.returns.policy.commitment')}
            </p>
          </div>

          {/* Issue Resolution Process */}
          <div className="mb-5 md:mb-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">{getTranslation(language, 'shipping.returns.howWeResolve.title')}</h3>
            </div>
            <p className="text-sm md:text-base text-[#425466] mb-4">
              {getTranslation(language, 'shipping.returns.howWeResolve.text1')}
            </p>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-lg p-4 md:p-5 shadow-sm">
              <ol className="space-y-3 text-xs md:text-sm text-[#425466]">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                  <span><strong>{getTranslation(language, 'shipping.returns.howWeResolve.step1')}</strong> <a href="/contact?inquiryType=support" className="text-gray-900 hover:text-gray-900 font-medium">support@purepeelco.com</a> {getTranslation(language, 'shipping.returns.howWeResolve.step1Text')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                  <span><strong>{getTranslation(language, 'shipping.returns.howWeResolve.step2')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                  <span><strong>{getTranslation(language, 'shipping.returns.howWeResolve.step3')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">4</span>
                  <span><strong>{getTranslation(language, 'shipping.returns.howWeResolve.step4')}</strong></span>
                </li>
              </ol>
            </div>
          </div>

          {/* Common Issues We Resolve */}
          <div className="mb-5 md:mb-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">{getTranslation(language, 'shipping.returns.issuesWeResolve.title')}</h3>
            </div>
            <p className="text-sm md:text-base text-[#425466] mb-4">{getTranslation(language, 'shipping.returns.issuesWeResolve.text1')}</p>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-4 md:p-5 shadow-sm">
              <ul className="space-y-2.5 text-xs md:text-sm text-[#425466]">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>{getTranslation(language, 'shipping.returns.issuesWeResolve.damagedPackaging')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>{getTranslation(language, 'shipping.returns.issuesWeResolve.qualityIssues')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>{getTranslation(language, 'shipping.returns.issuesWeResolve.incorrectItems')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>{getTranslation(language, 'shipping.returns.issuesWeResolve.missingItems')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>{getTranslation(language, 'shipping.returns.issuesWeResolve.shippingDamage')}</strong></span>
                </li>
              </ul>
            </div>
          </div>

          {/* Replacement Process */}
          <div className="mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.returns.replacementProcess.title')}</h3>
            <p className="text-sm md:text-base text-[#425466] mb-3">
              {getTranslation(language, 'shipping.returns.replacementProcess.text1')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs md:text-sm text-[#425466] ml-2 md:ml-4">
              <li>{getTranslation(language, 'shipping.returns.replacementProcess.item1')}</li>
              <li>{getTranslation(language, 'shipping.returns.replacementProcess.item2')}</li>
              <li>{getTranslation(language, 'shipping.returns.replacementProcess.item3')}</li>
              <li>{getTranslation(language, 'shipping.returns.replacementProcess.item4')}</li>
            </ul>
            <p className="text-sm md:text-base text-[#425466] mt-4">
              <strong>{getTranslation(language, 'shipping.returns.replacementProcess.note')}</strong>
            </p>
          </div>

          {/* Satisfaction Guarantee */}
          <div className="mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.returns.commitment.title')}</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
              <p className="text-sm md:text-base text-gray-900 font-semibold mb-2">{getTranslation(language, 'shipping.returns.commitment.guarantee')}</p>
              <p className="text-xs md:text-sm text-[#425466]">
                {getTranslation(language, 'shipping.returns.commitment.text')}
              </p>
            </div>
          </div>

          {/* Contact for Issues */}
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.returns.needHelp.title')}</h3>
            <p className="text-sm md:text-base text-[#425466] mb-3">
              {getTranslation(language, 'shipping.returns.needHelp.text1')}
            </p>
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <p className="text-sm md:text-base text-[#425466] mb-2">
                <strong>{getTranslation(language, 'shipping.returns.needHelp.email')}</strong> <a href="/contact?inquiryType=support" className="text-gray-900 hover:text-gray-900">support@purepeelco.com</a>
              </p>
              <p className="text-xs md:text-sm text-[#425466]">
                {getTranslation(language, 'shipping.returns.needHelp.text2')}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e3e8ef] p-6 mt-6 md:mt-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">{getTranslation(language, 'shipping.additionalInfo.title')}</h2>
          
          {/* Business Hours */}
          <div className="mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.additionalInfo.businessHours.title')}</h3>
            <p className="text-sm md:text-base text-[#425466] mb-3">
              {getTranslation(language, 'shipping.additionalInfo.businessHours.text1')}
            </p>
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <p className="text-sm md:text-base text-[#425466]"><strong>{getTranslation(language, 'shipping.additionalInfo.businessHours.mondaySunday')}</strong> {getTranslation(language, 'shipping.additionalInfo.businessHours.hours')}</p>
              <p className="text-xs md:text-sm text-[#425466] mt-2">{getTranslation(language, 'shipping.additionalInfo.businessHours.responseTime')}</p>
            </div>
          </div>

          {/* Packaging */}
          <div className="mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.additionalInfo.packaging.title')}</h3>
            <p className="text-sm md:text-base text-[#425466] mb-3">
              {getTranslation(language, 'shipping.additionalInfo.packaging.text1')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs md:text-sm text-[#425466] ml-2 md:ml-4">
              <li>{getTranslation(language, 'shipping.additionalInfo.packaging.item1')}</li>
              <li>{getTranslation(language, 'shipping.additionalInfo.packaging.item2')}</li>
              <li>{getTranslation(language, 'shipping.additionalInfo.packaging.item3')}</li>
            </ul>
          </div>

          {/* Special Orders */}
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.additionalInfo.specialOrders.title')}</h3>
            <p className="text-sm md:text-base text-[#425466] mb-3">
              {getTranslation(language, 'shipping.additionalInfo.specialOrders.text1')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs md:text-sm text-[#425466] ml-2 md:ml-4">
              <li>{getTranslation(language, 'shipping.additionalInfo.specialOrders.item1')}</li>
              <li>{getTranslation(language, 'shipping.additionalInfo.specialOrders.item2')}</li>
              <li>{getTranslation(language, 'shipping.additionalInfo.specialOrders.item3')}</li>
            </ul>
            <p className="text-sm md:text-base text-[#425466] mt-4">
              {getTranslation(language, 'shipping.additionalInfo.specialOrders.text2')} <a href="/contact?inquiryType=bulk" className="text-gray-900 hover:text-gray-900">orders@purepeelco.com</a> {getTranslation(language, 'shipping.additionalInfo.specialOrders.text3')}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e3e8ef] p-6 mt-6 md:mt-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.contact.title')}</h2>
          <p className="text-sm md:text-base text-[#425466] mb-3 md:mb-4">
            {getTranslation(language, 'shipping.contact.text1')}
          </p>
          <div className="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2">
            <p className="text-sm md:text-base text-[#425466]">
              <strong>{getTranslation(language, 'shipping.contact.shippingInquiries')}</strong> <a href="/contact?inquiryType=shipping" className="text-gray-900 hover:text-gray-900">shipping@purepeelco.com</a>
            </p>
            <p className="text-sm md:text-base text-[#425466]">
              <strong>{getTranslation(language, 'shipping.contact.productIssues')}</strong> <a href="/contact?inquiryType=support" className="text-gray-900 hover:text-gray-900">support@purepeelco.com</a>
            </p>
            <p className="text-sm md:text-base text-[#425466]">
              <strong>{getTranslation(language, 'shipping.contact.generalInquiries')}</strong> <a href="/contact?inquiryType=general" className="text-gray-900 hover:text-gray-900">info@purepeelco.com</a>
            </p>
            <p className="text-sm md:text-base text-[#425466]">
              <strong>{getTranslation(language, 'shipping.contact.bulkOrders')}</strong> <a href="/contact?inquiryType=bulk" className="text-gray-900 hover:text-gray-900">orders@purepeelco.com</a>
            </p>
            <p className="text-xs md:text-sm text-[#425466] mt-3">
              <strong>{getTranslation(language, 'shipping.contact.responseTime')}</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

