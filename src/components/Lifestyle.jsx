import { useState, useEffect, useRef } from "react"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"

const lifestyleItems = [
  {
    id: 1,
    image: "/images/moscow-mule.jpg",
    key: "cocktails"
  },
  {
    id: 2,
    image: "/images/charcuterie-board.png",
    key: "charcuterie"
  },
  {
    id: 3,
    image: "/images/drinks.png",
    key: "drinks"
  },
  {
    id: 4,
    image: "/images/decorated-orange-box.png",
    key: "giftOrange"
  }
]

export default function Lifestyle() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [captionVisible, setCaptionVisible] = useState(true)
  const intervalRef = useRef(null)
  const progressIntervalRef = useRef(null)
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.2 })
  const { language } = useLanguage()
  const SLIDE_DURATION = 4000 // 4 seconds per slide
  const PROGRESS_UPDATE_INTERVAL = 50

  // Preload next image for smoother transitions
  useEffect(() => {
    const nextIndex = (currentIndex + 1) % lifestyleItems.length
    const nextImage = new Image()
    nextImage.src = lifestyleItems[nextIndex].image
  }, [currentIndex])

  // Reset progress and animate caption when slide changes
  useEffect(() => {
    setProgress(0)
    setCaptionVisible(false)
    // Fade in caption after a brief delay
    const timer = setTimeout(() => {
      setCaptionVisible(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [currentIndex])

  // Progress bar animation
  useEffect(() => {
    if (!isSectionVisible) return

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (PROGRESS_UPDATE_INTERVAL / SLIDE_DURATION) * 100
        if (newProgress >= 100) {
          return 100
        }
        return newProgress
      })
    }, PROGRESS_UPDATE_INTERVAL)

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isSectionVisible, currentIndex])

  // Auto-rotate functionality
  useEffect(() => {
    if (!isSectionVisible) return

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % lifestyleItems.length)
    }, SLIDE_DURATION)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isSectionVisible])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev === 0 ? lifestyleItems.length - 1 : prev - 1))
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % lifestyleItems.length)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Touch/swipe support for mobile
  const touchStartRef = useRef(null)
  const touchEndRef = useRef(null)

  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    touchEndRef.current = null
    touchStartRef.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e) => {
    touchEndRef.current = e.targetTouches[0].clientX
  }

  const onTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return
    const distance = touchStartRef.current - touchEndRef.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % lifestyleItems.length)
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev === 0 ? lifestyleItems.length - 1 : prev - 1))
    }
  }

  const currentItem = lifestyleItems[currentIndex]

  return (
    <section 
      ref={sectionRef}
      className="relative py-16 md:py-24 px-4 sm:px-5 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header - Cleaner on mobile */}
        <div className={`text-center mb-10 md:mb-16 transition-all duration-800 ease-out ${
          isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Hide tag on mobile for cleaner look */}
          <div className="text-center mb-4 md:mb-6 hidden md:block">
            <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 rounded-full">
              Lifestyle
            </span>
          </div>
          <h2 className="text-[clamp(1.75rem,5vw,3.5rem)] font-bold mb-3 md:mb-6 text-stone-900 tracking-tight">
            {getTranslation(language, 'lifestyle.title')}
          </h2>
          <p className="text-stone-600 text-base md:text-xl max-w-3xl mx-auto leading-relaxed px-4">
            {getTranslation(language, 'lifestyle.subtitle')}
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-0"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Image Frame - Responsive aspect ratio */}
          <div className="relative w-full aspect-4/3 sm:aspect-16/10 md:aspect-video lg:aspect-5/3 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl border border-stone-200/50">
            {/* Images with cover sizing */}
            {lifestyleItems.map((item, index) => (
              <div
                key={item.id}
                className={`absolute inset-0 transition-all duration-1200 ease-out ${
                  index === currentIndex 
                    ? 'opacity-100 z-1 scale-100' 
                    : 'opacity-0 z-0 scale-105'
                }`}
              >
                {/* Main image - covers container */}
                <img
                  src={item.image}
                  alt={getTranslation(language, `lifestyle.slides.${item.key}.caption`)}
                  className="w-full h-full object-cover object-center"
                  width="1200"
                  height="675"
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                {/* Enhanced Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/70 z-2"></div>
              </div>
            ))}

            {/* Caption Overlay with per-slide animation */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12 z-2">
              <div className={`transition-all duration-700 ease-out ${
                captionVisible && isSectionVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                  {getTranslation(language, `lifestyle.slides.${currentItem.key}.caption`)}
                </h3>
                <p className="text-white/90 text-base sm:text-lg md:text-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  {getTranslation(language, `lifestyle.slides.${currentItem.key}.description`)}
                </p>
              </div>
            </div>

            {/* Progress Bar - Integrated at bottom of image (like video player) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-3">
              <div
                className="absolute top-0 left-0 h-full bg-amber-500 transition-all ease-linear"
                style={{
                  width: `${progress}%`,
                  transitionDuration: `${PROGRESS_UPDATE_INTERVAL}ms`,
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.6)'
                }}
              />
            </div>

            {/* Slide Counter - More subtle on mobile */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-3 bg-black/30 md:bg-black/40 backdrop-blur-sm px-2.5 py-1.5 md:px-4 md:py-2 rounded-full">
              <span className="text-white text-xs md:text-sm font-medium">
                {currentIndex + 1} / {lifestyleItems.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

