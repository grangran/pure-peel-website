import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import { useCurrency } from "../context/CurrencyContext"
import { getTranslation } from "../utils/translations"

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [navHeight, setNavHeight] = useState(72)
  const { cartCount, isCartOpen, setIsCartOpen, getCartTotal } = useCart()
  const [badgeUpdated, setBadgeUpdated] = useState(false)
  const { language, setLanguage } = useLanguage()
  const { currency, setCurrency } = useCurrency()
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Reset menu state when component mounts or when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setIsLangDropdownOpen(false)
    setIsCurrencyDropdownOpen(false)
  }, []) // Reset on mount - component will remount with key prop from App.jsx

  useEffect(() => {
    const nav = document.querySelector("nav")
    if (nav) {
      const updateNavHeight = () => {
        const height = nav.offsetHeight
        setNavHeight(height)
        document.documentElement.style.setProperty("--nav-height", `${height}px`)
      }
      updateNavHeight()
      window.addEventListener("resize", updateNavHeight)
      return () => window.removeEventListener("resize", updateNavHeight)
    }
  }, [])

  useEffect(() => {
    if (isMenuOpen || isCartOpen) {
      document.body.classList.add("menu-open")
    } else {
      document.body.classList.remove("menu-open")
    }
    return () => {
      document.body.classList.remove("menu-open")
    }
  }, [isMenuOpen, isCartOpen])

  useEffect(() => {
    if (cartCount > 0) {
      setBadgeUpdated(true)
      const timer = setTimeout(() => setBadgeUpdated(false), 300)
      return () => clearTimeout(timer)
    }
  }, [cartCount])

  // Add scroll effect for nav
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setIsLangDropdownOpen(false)
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  const handleLinkClick = (e, targetId) => {
    e.preventDefault()
    closeMenu()
    
    // Navigate to home page first if not already there
    const currentPath = window.location.pathname.replace(/\/$/, '')
    if (currentPath !== '/' && currentPath !== '') {
      window.history.pushState({ page: '/' }, '', '/')
      window.dispatchEvent(new Event('hashchange'))
    }
    
    // Wait for page to render, then scroll to section
    setTimeout(() => {
      const element = document.getElementById(targetId)
      if (element) {
        const offset = navHeight + 20
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset
        window.scrollTo({ top: offsetPosition, behavior: "smooth" })
      }
    }, 100)
  }

  const handleShopLink = (e, product) => {
    // Let App.jsx handle navigation via its click interceptor
    // No need to call pushState here - App.jsx will do it
    // Just prevent default and close menu
    e.preventDefault()
    closeMenu()
  }

  return (
    <nav className={`sticky top-0 left-0 right-0 z-50 h-[72px] bg-[#faf8f5] border-b transition-all duration-300 ${
      isScrolled 
        ? 'border-gray-200/80 shadow-md backdrop-blur-sm bg-[#faf8f5]/95' 
        : 'border-gray-200/50 shadow-sm'
    }`}>
      <div className="h-full max-w-7xl mx-auto px-2 sm:px-3 md:px-5 flex items-center justify-between relative">
        {/* Left: Hamburger Menu */}
        <button 
          className="w-10 h-10 sm:w-11 sm:h-11 p-1.5 sm:p-2 flex items-center justify-center bg-transparent border-0 cursor-pointer rounded-lg transition-all duration-150 hover:bg-black/5 active:scale-95 touch-manipulation min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px]"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <div className="flex flex-col justify-center gap-1.5 w-[22px]">
              <span className="block w-full h-0.5 bg-gray-900 rounded-sm"></span>
              <span className="block w-full h-0.5 bg-gray-900 rounded-sm"></span>
              <span className="block w-full h-0.5 bg-gray-900 rounded-sm"></span>
            </div>
          )}
        </button>

        {/* Center: Logo - Bigger and higher resolution */}
        <a 
          href="/" 
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center no-underline transition-all duration-200 hover:opacity-85 hover:scale-105 z-10 pointer-events-auto touch-manipulation"
          style={{ 
            minWidth: '100px' // Minimum width to prevent too small on very small screens
          }}
          onClick={(e) => {
            // Let App.jsx handle navigation via its click interceptor
            e.preventDefault()
          }}
        >
          <img 
            src="/logo.png" 
            alt="Pure Peel Co." 
            className="h-[48px] sm:h-[56px] md:h-[72px] w-auto max-w-[100px] sm:max-w-[150px] md:max-w-[360px] block object-contain pointer-events-none"
            loading="eager"
            onError={(e) => {
              console.error('Logo failed to load:', e.target.src)
            }}
          />
        </a>

        {/* Right: Currency, Language & Cart */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-4 ml-auto">
          {/* Currency Selector */}
          <div className="relative ml-1 md:ml-0">
            <button
              onClick={() => {
                setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)
                setIsLangDropdownOpen(false) // Close language dropdown if open
              }}
              className="flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-white/50 transition-all duration-200 active:scale-95 min-w-[36px] sm:min-w-[44px] min-h-[36px] sm:min-h-[44px]"
              aria-label="Select currency"
            >
              <span className="text-xs uppercase">{currency}</span>
              <svg 
                className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform hidden md:block ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCurrencyDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCurrencyDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 backdrop-blur-sm">
                  <button
                    onClick={() => {
                      setCurrency('CAD')
                      setIsCurrencyDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-lg mx-1 active:scale-95 min-h-[44px] ${
                      currency === 'CAD' 
                        ? 'bg-amber-50 text-amber-600 font-semibold' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    CAD - Canadian Dollar
                  </button>
                  <button
                    onClick={() => {
                      setCurrency('USD')
                      setIsCurrencyDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-lg mx-1 active:scale-95 min-h-[44px] ${
                      currency === 'USD' 
                        ? 'bg-amber-50 text-amber-600 font-semibold' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    USD - US Dollar
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Language Selector - Simplified on mobile */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLangDropdownOpen(!isLangDropdownOpen)
                setIsCurrencyDropdownOpen(false) // Close currency dropdown if open
              }}
              className="flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-white/50 transition-all duration-200 active:scale-95 min-w-[36px] sm:min-w-[44px] min-h-[36px] sm:min-h-[44px]"
              aria-label="Select language"
            >
              <span className="text-xs uppercase">{language === 'en' ? 'EN' : 'FR'}</span>
              <svg 
                className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform hidden md:block ${isLangDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isLangDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsLangDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 backdrop-blur-sm">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-lg mx-1 active:scale-95 min-h-[44px] ${
                      language === 'en' 
                        ? 'bg-amber-50 text-amber-600 font-semibold' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xs">🇬🇧</span>
                      English
                    </span>
                  </button>
                  <button
                    onClick={() => handleLanguageChange('fr')}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all rounded-lg mx-1 active:scale-95 min-h-[44px] ${
                      language === 'fr' 
                        ? 'bg-amber-50 text-amber-600 font-semibold' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xs">🇫🇷</span>
                      Français
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Cart Button */}
          <button 
            className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-14 md:h-14 flex items-center justify-center bg-transparent border-0 cursor-pointer rounded-lg transition-all duration-200 hover:bg-white/50 active:scale-95 touch-manipulation group" 
            aria-label={`Open cart${cartCount > 0 ? ` (${cartCount} items)` : ""}`}
            onClick={() => {
              setIsCartOpen(true)
              closeMenu()
            }}
          >
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-800 transition-all duration-300 group-hover:text-amber-600 group-hover:scale-110"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Sleek modern shopping bag */}
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none transition-all duration-300 shadow-md ${
                badgeUpdated ? "animate-badgeBounce scale-110" : ""
              }`}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-250"
          onClick={closeMenu}
        />
      )}
      <div 
        className={`fixed top-[72px] left-0 sm:left-5 w-full sm:w-[380px] max-h-[calc(100vh-72px)] sm:max-h-[calc(100vh-72px-24px)] bg-[#faf8f5] sm:rounded-2xl shadow-2xl overflow-y-auto z-50 transition-all duration-300 ease-out backdrop-blur-xl ${
          isMenuOpen 
            ? "opacity-100 pointer-events-auto translate-x-0" 
            : "opacity-0 pointer-events-none -translate-x-full sm:-translate-x-4"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeMenu()
          }
        }}
      >
        <div className="p-7">
          <a 
            href="#products" 
            className="block relative py-3 text-gray-900 text-base font-semibold no-underline transition-all hover:text-amber-500 active:scale-95 after:content-[''] after:absolute after:left-0 after:bottom-1 after:w-full after:h-0.5 after:bg-amber-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100 mb-6"
            onClick={(e) => handleLinkClick(e, "products")}
          >
            {getTranslation(language, 'nav.shop')}
          </a>

          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest text-gray-400 mb-3.5 block">{getTranslation(language, 'nav.citrusCollection')}</span>
            <a 
              href="/orange" 
              className="block relative py-3 text-gray-900 text-base font-medium no-underline transition-all hover:text-amber-500 active:scale-95 after:content-[''] after:absolute after:left-0 after:bottom-1 after:w-full after:h-0.5 after:bg-amber-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100"
              onClick={(e) => handleShopLink(e, "orange")}
            >
              {getTranslation(language, 'products.orange.name')}
            </a>
            <a 
              href="/pink-orange" 
              className="block relative py-3 text-gray-900 text-base font-medium no-underline transition-all hover:text-amber-500 active:scale-95 after:content-[''] after:absolute after:left-0 after:bottom-1 after:w-full after:h-0.5 after:bg-amber-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100"
              onClick={(e) => handleShopLink(e, "pink-orange")}
            >
              {getTranslation(language, 'products.pinkOrange.name')}
            </a>
            <a 
              href="/lime" 
              className="block relative py-3 text-gray-900 text-base font-medium no-underline transition-all hover:text-amber-500 active:scale-95 after:content-[''] after:absolute after:left-0 after:bottom-1 after:w-full after:h-0.5 after:bg-amber-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100"
              onClick={(e) => handleShopLink(e, "lime")}
            >
              {getTranslation(language, 'products.lime.name')}
            </a>
            <a 
              href="/lemon" 
              className="block relative py-3 text-gray-900 text-base font-medium no-underline transition-all hover:text-amber-500 active:scale-95 after:content-[''] after:absolute after:left-0 after:bottom-1 after:w-full after:h-0.5 after:bg-amber-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100"
              onClick={(e) => handleShopLink(e, "lemon")}
            >
              {getTranslation(language, 'products.lemon.name')}
            </a>
          </div>

          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest text-gray-400 mb-3.5 block">{getTranslation(language, 'nav.fruitCollection')}</span>
            <a 
              href="/apple" 
              className="block relative py-3 text-gray-900 text-base font-medium no-underline transition-all hover:text-amber-500 active:scale-95 after:content-[''] after:absolute after:left-0 after:bottom-1 after:w-full after:h-0.5 after:bg-amber-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100"
              onClick={(e) => handleShopLink(e, "apple")}
            >
              {getTranslation(language, 'products.apple.name')}
            </a>
          </div>

          <div className="h-px bg-gray-200 my-7"></div>

          <a 
            href="#about" 
            className="block relative py-3 text-gray-900 text-base font-medium no-underline transition-all hover:text-amber-500 active:scale-95 after:content-[''] after:absolute after:left-0 after:bottom-1 after:w-full after:h-0.5 after:bg-amber-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100"
            onClick={(e) => handleLinkClick(e, "about")}
          >
            {getTranslation(language, 'nav.about')}
          </a>
          <a 
            href="/contact" 
            className="block relative py-3 text-gray-900 text-base font-medium no-underline transition-all hover:text-amber-500 active:scale-95 after:content-[''] after:absolute after:left-0 after:bottom-1 after:w-full after:h-0.5 after:bg-amber-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100"
            onClick={(e) => {
              // Let App.jsx handle navigation via its click interceptor
              e.preventDefault()
              closeMenu()
            }}
          >
            {getTranslation(language, 'nav.contact')}
          </a>

          <a 
            href="#" 
            className="mt-6 py-3.5 px-4 rounded-lg bg-amber-500 text-white font-semibold text-center block no-underline transition-all duration-200 hover:bg-amber-600 active:scale-95 after:hidden min-h-[44px] flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault()
              closeMenu()
              setIsCartOpen(true)
            }}
          >
            {getTranslation(language, 'nav.viewCart')}
          </a>
        </div>
      </div>
    </nav>
  )
}

