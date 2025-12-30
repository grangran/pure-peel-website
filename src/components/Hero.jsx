import { useEffect, useState } from "react"

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const [ripples, setRipples] = useState({})

  useEffect(() => {
    setIsVisible(true)
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
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
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
  
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/50 to-black/40 z-1" />
  
      {/* Content */}
      <div className={`relative z-2 w-full max-w-6xl px-8 flex items-center justify-center min-h-[90vh] transition-all duration-800 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className={`text-center text-white max-w-3xl transition-all duration-800 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-bold tracking-tight mb-6 leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            Pure Peel Co.
          </h1>
  
          <p className="text-[clamp(1.1rem,3vw,1.75rem)] font-normal mb-4 text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
            Premium Dehydrated Citrus Slices
          </p>
  
          <p className="text-[clamp(0.9rem,2vw,1.1rem)] font-light mb-10 text-white/85 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] tracking-wide">
            100% Natural • Made in Canada • No Preservatives
          </p>
  
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10 w-full max-w-md mx-auto px-4">
            <button 
              className="relative w-full sm:w-auto px-8 sm:px-10 py-4 text-base font-semibold rounded-full border-0 cursor-pointer transition-all duration-300 uppercase tracking-wide font-sans overflow-hidden bg-linear-to-br from-amber-500 to-amber-600 text-black shadow-[0_4px_15px_rgba(245,158,11,0.4)] hover:bg-linear-to-br hover:from-amber-400 hover:to-amber-500 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] active:translate-y-0 active:scale-[0.98] active:shadow-[0_2px_8px_rgba(245,158,11,0.3)] min-h-[48px]"
              onClick={handleShopNow}
            >
              Shop Now
              {ripples.shop && (
                <span
                  className="absolute rounded-full bg-black/20 pointer-events-none animate-ripple"
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
              className="relative w-full sm:w-auto px-8 sm:px-10 py-4 text-base font-semibold rounded-full border-2 border-white/90 cursor-pointer transition-all duration-300 uppercase tracking-wide font-sans overflow-hidden bg-transparent text-white backdrop-blur-sm hover:bg-white/15 hover:border-white hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(255,255,255,0.2)] active:translate-y-0 active:scale-[0.98] active:shadow-[0_2px_8px_rgba(255,255,255,0.15)] min-h-[48px]"
              onClick={handleLearnMore}
            >
              Learn More
              {ripples.learn && (
                <span
                  className="absolute rounded-full bg-white/60 pointer-events-none animate-ripple"
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

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-2 opacity-80 animate-fadeInUp">
        <div className="w-6 h-6 border-r-[3px] border-b-[3px] border-white rotate-45 animate-scrollBounce"></div>
      </div>
    </section>
  )
}

