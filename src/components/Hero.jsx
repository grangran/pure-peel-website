import { useEffect, useState } from "react"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const [ripples, setRipples] = useState({})
  const { language } = useLanguage()

  useEffect(() => {
    setIsVisible(true)
    // Preload hero background image for faster loading
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = '/images/driedcitrusbanner.jpg'
    link.fetchPriority = 'high'
    document.head.appendChild(link)
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  const createRipple = (event, buttonId) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    setRipples(prev => ({
      ...prev,
      [buttonId]: { x, y, size }
    }))

    setTimeout(() => {
      setRipples(prev => {
        const newRipples = { ...prev }
        delete newRipples[buttonId]
        return newRipples
      })
    }, 600)
  }

  const handleShopNow = (e) => {
    createRipple(e, 'shop')
    setTimeout(() => {
      const productsSection = document.querySelector('#products') || document.querySelector('.products-section')
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 150)
  }

  const handleLearnMore = (e) => {
    createRipple(e, 'learn')
    setTimeout(() => {
      const aboutSection = document.querySelector('#about') || document.querySelector('.about-section')
      if (aboutSection) {
        const offset = 80
        const elementPosition = aboutSection.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
      }
    }, 150)
  }

  return (
    <section className="relative w-full min-h-[85vh] sm:min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: "url('/images/driedcitrusbanner.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
  
      {/* Enhanced gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/60 to-black/50 z-1" />
  
      {/* Content */}
      <div className={`relative z-2 w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-center min-h-[85vh] sm:min-h-[92vh] transition-all duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className={`text-center text-white max-w-4xl transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h1 className="text-[clamp(3rem,9vw,6rem)] font-bold tracking-[-0.02em] mb-6 leading-[1.1] drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
            Pure Peel Co.
          </h1>
  
          <p className="text-[clamp(1.25rem,3.5vw,2rem)] font-light mb-6 text-white/95 drop-shadow-[0_2px_15px_rgba(0,0,0,0.5)] leading-relaxed max-w-2xl mx-auto">
            {getTranslation(language, 'hero.tagline')}
          </p>
  
          <p className="text-[clamp(0.875rem,2.5vw,1.25rem)] font-normal mb-8 sm:mb-12 text-white/80 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] tracking-wide max-w-xl mx-auto px-4">
            {getTranslation(language, 'hero.features')}
          </p>
  
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 w-full max-w-lg mx-auto px-4">
              <button 
                className="relative w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base font-semibold rounded-full border-0 cursor-pointer transition-all duration-300 overflow-hidden bg-amber-500 text-stone-900 shadow-[0_8px_24px_rgba(245,158,11,0.4)] hover:bg-amber-400 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(245,158,11,0.5)] active:translate-y-0 active:scale-[0.98] min-h-[52px] tracking-wide"
                onClick={handleShopNow}
              >
                {getTranslation(language, 'hero.shopNow')}
                {ripples.shop && (
                  <span
                    className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
                    style={{
                      left: `${ripples.shop.x}px`,
                      top: `${ripples.shop.y}px`,
                      width: `${ripples.shop.size}px`,
                      height: `${ripples.shop.size}px`
                    }}
                  />
                )}
              </button>
    
              <button 
                className="relative w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base font-semibold rounded-full border-2 border-white/80 cursor-pointer transition-all duration-300 overflow-hidden bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:border-white hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(255,255,255,0.2)] active:translate-y-0 active:scale-[0.98] min-h-[52px] tracking-wide"
                onClick={handleLearnMore}
              >
                {getTranslation(language, 'hero.learnMore')}
                {ripples.learn && (
                  <span
                    className="absolute rounded-full bg-white/40 pointer-events-none animate-ripple"
                    style={{
                      left: `${ripples.learn.x}px`,
                      top: `${ripples.learn.y}px`,
                      width: `${ripples.learn.size}px`,
                      height: `${ripples.learn.size}px`
                    }}
                  />
                )}
              </button>
            </div>
          </div>
        </div>

      {/* Refined scroll indicator - Hidden on mobile */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-2 opacity-70 animate-fadeInUp hidden md:flex flex-col items-center gap-2">
        <span className="text-xs text-white/80 uppercase tracking-wider font-medium">Scroll</span>
        <div className="w-5 h-8 border-2 border-white/60 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-scrollBounce"></div>
        </div>
      </div>
    </section>
  )
}

