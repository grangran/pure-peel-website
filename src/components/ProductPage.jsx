import { useState, useEffect, useRef } from "react"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import { useCurrency } from "../context/CurrencyContext"
import { getTranslation, translateVariantLabel } from "../utils/translations"
import Skeleton from "./Skeleton"
import LoadingSpinner from "./LoadingSpinner"
import ProductInfoLabel from "./ProductInfoLabel"

export default function ProductPage({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [isImageFading, setIsImageFading] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [ripples, setRipples] = useState({})
  const [isAboutExpanded, setIsAboutExpanded] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { addToCart } = useCart()
  const { language } = useLanguage()
  const { currency, formatPrice } = useCurrency()

  // Get images for the selected variant (only variant image for now)
  const getVariantImages = () => {
    return [selectedVariant.image]
  }

  const variantImages = getVariantImages()

  // Preload critical first image for faster loading
  useEffect(() => {
    if (variantImages.length > 0 && variantImages[0]) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = variantImages[0]
      link.fetchPriority = 'high'
      document.head.appendChild(link)
      
      return () => {
        document.head.removeChild(link)
      }
    }
  }, [variantImages])

  useEffect(() => {
    // Reset all state when product changes (e.g., navigating back/forward)
    setSelectedVariant(product.variants[0])
    setImageLoading(true)
    setIsImageFading(false)
    setQuantity(1)
    setAddingToCart(false)
    setRipples({})
    setCurrentImageIndex(0)
  }, [product])

  // Reset image index when variant changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedVariant.id])

  const handleVariantChange = (variant) => {
    setIsImageFading(true)
    setImageLoading(true)
    setCurrentImageIndex(0) // Reset to first image when variant changes
    setTimeout(() => {
      setSelectedVariant(variant)
      setIsImageFading(false)
    }, 180)
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % variantImages.length)
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + variantImages.length) % variantImages.length)
  }

  const handleImageSelect = (index) => {
    setCurrentImageIndex(index)
  }

  // Touch/swipe support for mobile
  const touchStartRef = useRef({ x: 0, y: 0 })
  const touchEndRef = useRef({ x: 0, y: 0 })

  const handleTouchStart = (e) => {
    touchStartRef.current.x = e.touches[0].clientX
    touchStartRef.current.y = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    touchEndRef.current.x = e.changedTouches[0].clientX
    touchEndRef.current.y = e.changedTouches[0].clientY
    handleSwipe()
  }

  const handleSwipe = () => {
    const deltaX = touchStartRef.current.x - touchEndRef.current.x
    const deltaY = touchStartRef.current.y - touchEndRef.current.y
    const minSwipeDistance = 50

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        handleNextImage()
      } else {
        handlePrevImage()
      }
    }
  }

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

  const handleAddToCart = (e) => {
    createRipple(e, 'addToCart')
    setAddingToCart(true)
    // Get translated product name
    const translatedProductName = product.id 
      ? getTranslation(language, `products.${product.id}.name`)
      : product.name
    addToCart({
      id: selectedVariant.id,
      name: translatedProductName,
      variant: selectedVariant.option,
      price: selectedVariant.price,
      image: selectedVariant.image,
      description: product.description,
      quantity: quantity,
      productId: product.id // Store product ID for translation in toast
    })
    // Reset loading state after a brief delay for visual feedback
    setTimeout(() => setAddingToCart(false), 500)
  }

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }

  const variants = product?.variants || []

  return (
    <section className="py-6 md:py-10 lg:py-12 px-4 sm:px-6 pb-20 md:pb-24 bg-brand-bg min-h-[calc(100vh-72px)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-start">
          {/* Image Section */}
          <div className="flex justify-center items-start lg:sticky lg:top-20">
            <div className="relative w-full max-w-sm mx-auto lg:max-w-sm">
              {/* Image Carousel */}
              <div 
                className="relative bg-linear-to-b from-white to-[#F6F3EE] rounded-xl md:rounded-2xl overflow-hidden mb-4 md:mb-5 shadow-xl md:shadow-2xl border-2 border-stone-300/60"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >                                                                                                                                                                              
                {imageLoading && !isImageFading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-100 z-10">
                    <Skeleton type="image" width="100%" height="100%" />
                  </div>
                )}
                
                {/* Main Image Container */}
                <div className="aspect-square relative overflow-hidden bg-linear-to-b from-white to-[#F6F3EE] border border-gray-200">
                  {variantImages.map((image, index) => {
                    const isBoxImage = selectedVariant.id.includes('clearbox') || selectedVariant.id.includes('box')
                    return (
                      <div
                        key={`${selectedVariant.id}-${index}`}
                        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                          isBoxImage ? 'p-2 md:p-3' : 'p-1 md:p-1.5'
                        } ${
                          index === currentImageIndex
                            ? "opacity-100 z-10 scale-100"
                            : "opacity-0 z-0 scale-95"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          className={`w-full h-full object-contain drop-shadow-md ${
                            isImageFading || imageLoading ? "opacity-0" : "opacity-100"
                          }`}
                          width="600"
                          height="600"
                          fetchPriority={index === 0 && currentImageIndex === 0 ? "high" : "auto"}
                          decoding="async"
                          onLoad={() => {
                            if (index === currentImageIndex) {
                              setImageLoading(false)
                            }
                          }}
                          onError={(e) => {
                            console.error("Image failed to load:", image);
                            if (index === currentImageIndex) {
                              setImageLoading(false);
                            }
                          }}
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Navigation Arrows - Only show if more than one image */}
                {variantImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-9 md:h-9 bg-black/30 hover:bg-black/40 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
                      aria-label="Previous image"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-9 md:h-9 bg-black/30 hover:bg-black/40 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
                      aria-label="Next image"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Counter - Only show if more than one image */}
                {variantImages.length > 1 && (
                  <div className="absolute bottom-3 right-3 z-20 bg-black/50 px-3 py-1.5 rounded-full">
                    <span className="text-white text-xs md:text-sm font-medium">
                      {currentImageIndex + 1} / {variantImages.length}
                    </span>
                  </div>
                )}

                {/* Thumbnail Dots - Only show if more than one image */}
                {variantImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {variantImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageSelect(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
                          index === currentImageIndex
                            ? "bg-amber-500 w-6"
                            : "bg-white/60 hover:bg-white/80"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* About This Product - Accordion */}
              <div className="mb-4 md:mb-5 bg-white rounded-xl border border-stone-200/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <button
                  onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 transition-all duration-200 hover:bg-stone-50 active:scale-[0.99] group"
                  aria-expanded={isAboutExpanded}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-linear-to-b from-amber-400 to-amber-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <h3 className="text-base md:text-lg font-semibold text-stone-900 tracking-tight">About This Product</h3>
                  </div>
                  <svg
                    className={`w-4.5 h-4.5 text-stone-400 transition-all duration-300 shrink-0 ml-3 group-hover:text-amber-500 ${
                      isAboutExpanded ? 'rotate-180 text-amber-500' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isAboutExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 md:px-5 pb-4 md:pb-5 pt-1">
                    <div className="pl-4 border-l-2 border-amber-200/50">
                      <p className="text-stone-600 leading-relaxed text-sm md:text-[15px] tracking-wide">
                        {product.id ? getTranslation(language, `productDescriptions.${product.id}`) : product.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badges - Simplified for mobile */}
              <div className="grid grid-cols-3 gap-1.5 md:gap-2.5 mb-4 md:mb-5" translate="no">
                <div className="flex items-center justify-center p-2 md:p-2.5 bg-stone-50 rounded-lg border border-stone-200/40">
                  <div className="text-[9px] md:text-[11px] font-medium text-stone-600 uppercase tracking-wide leading-tight text-center">
                    {getTranslation(language, 'productPage.trustBadges.natural')}
                  </div>
                </div>
                <div className="text-center p-2 md:p-2.5 bg-stone-50 rounded-lg border border-stone-200/40">
                  <div className="text-[9px] md:text-[11px] font-medium text-stone-600 uppercase tracking-wide leading-tight">
                    {getTranslation(language, 'productPage.trustBadges.noPreservatives')}
                  </div>
                </div>
                <div className="text-center p-2 md:p-2.5 bg-stone-50 rounded-lg border border-stone-200/40">
                  <div className="text-[9px] md:text-[11px] font-medium text-stone-600 uppercase tracking-wide leading-tight">
                    {getTranslation(language, 'productPage.trustBadges.madeInCanada')}
                  </div>
                </div>
              </div>

              {/* Product Information Label */}
              <ProductInfoLabel productName={product.name} />
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            {/* Brand Name - Hidden on mobile for cleaner look */}
            <div className="mb-3 md:mb-4 hidden md:block">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-amber-700/90 bg-linear-to-r from-amber-50/80 to-amber-100/40 rounded-full border border-amber-200/40">
                Pure Peel Co.
              </span>
            </div>

            {/* Title - Better spacing on mobile */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5 md:mb-6 text-stone-900 tracking-tight leading-[1.1]">
              {product.id ? getTranslation(language, `products.${product.id}.name`) : product.name}
            </h1>

            {/* Price - Cleaner on mobile */}
            <div className="mb-6 md:mb-8 pb-4 md:pb-6 border-b border-stone-200/50">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl md:text-5xl font-bold text-stone-900">{formatPrice(selectedVariant.price)}</span>
                <span className="text-lg md:text-xl text-stone-500 font-medium">{currency}</span>
              </div>
              <p className="text-xs md:text-sm text-stone-500 font-medium flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getTranslation(language, 'productPage.shippingInfo')}
              </p>
            </div>

            {/* Variants - Centered layout */}
            <div className="mb-6 md:mb-8">
              <label className="block text-xs md:text-sm font-semibold text-stone-700 mb-3 md:mb-4 uppercase tracking-wider">
                Select Size
              </label>
              <div className="flex flex-col gap-2 md:gap-3">
                {/* First row: 3 buttons centered */}
                <div className="flex justify-center gap-2 md:gap-3">
                  {product.variants.slice(0, 3).map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantChange(variant)}
                      className={`px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium rounded-lg border transition-all duration-200 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 ${
                        selectedVariant.id === variant.id
                          ? "bg-amber-500 border-amber-500 text-stone-900 shadow-sm"
                          : "bg-white border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-stone-50 active:scale-[0.98]"
                      }`}
                      style={{ width: 'calc(50% - 0.25rem)', maxWidth: 'calc(33.333% - 0.5rem)' }}
                    >
                      <div className="text-center">
                        <div className="font-medium text-xs md:text-sm">{translateVariantLabel(language, variant.label).split("—")[0].trim()}</div>
                        <div className="text-[10px] md:text-[11px] text-stone-600/70 mt-0.5">
                          {translateVariantLabel(language, variant.label).split("—")[1]?.trim() || ''}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {/* Second row: 2 buttons centered */}
                {product.variants.length > 3 && (
                  <div className="flex justify-center gap-2 md:gap-3">
                    {product.variants.slice(3).map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => handleVariantChange(variant)}
                        className={`px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium rounded-lg border transition-all duration-200 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 ${
                          selectedVariant.id === variant.id
                            ? "bg-amber-500 border-amber-500 text-stone-900 shadow-sm"
                            : "bg-white border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-stone-50 active:scale-[0.98]"
                        }`}
                        style={{ width: 'calc(50% - 0.25rem)', maxWidth: 'calc(33.333% - 0.5rem)' }}
                      >
                        <div className="text-center">
                          <div className="font-medium text-xs md:text-sm">{translateVariantLabel(language, variant.label).split("—")[0].trim()}</div>
                          <div className="text-[10px] md:text-[11px] text-stone-600/70 mt-0.5">
                            {translateVariantLabel(language, variant.label).split("—")[1]?.trim() || ''}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity & Add to Cart Section */}
            <div className="mb-6 md:mb-8 pb-6 md:pb-8 border-b border-stone-200/50">
              <div className="flex flex-col items-center gap-3 sm:gap-4 mb-5 md:mb-6">
                <span className="text-xs md:text-sm font-semibold text-stone-700 uppercase tracking-wide">{getTranslation(language, 'productPage.quantity')}</span>
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-4 md:px-5 py-2.5 md:py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-base md:text-lg active:scale-95 min-w-[44px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="px-6 md:px-8 py-2.5 md:py-3 text-stone-900 font-semibold min-w-[60px] md:min-w-[80px] text-center border-x border-stone-200 bg-stone-50/50 text-base md:text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-4 md:px-5 py-2.5 md:py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 transition-all duration-200 font-semibold text-base md:text-lg active:scale-95 min-w-[44px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Add to Cart Button */}
              <button 
                className="relative w-full py-4 md:py-4.5 px-5 text-sm md:text-base font-semibold rounded-xl border-0 bg-linear-to-r from-amber-500 to-amber-600 text-stone-900 hover:from-amber-400 hover:to-amber-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] min-h-[48px] md:min-h-[52px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2" 
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {ripples.addToCart && (
                  <span
                    className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
                    style={{
                      left: `${ripples.addToCart.x}px`,
                      top: `${ripples.addToCart.y}px`,
                      width: `${ripples.addToCart.size}px`,
                      height: `${ripples.addToCart.size}px`
                    }}
                  />
                )}
                {addingToCart ? (
                  <LoadingSpinner size="md" color="white" text={getTranslation(language, 'productPage.adding')} />
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {getTranslation(language, 'productPage.addToCart')}
                  </>
                )}
              </button>

              {/* Bulk Inquiry Button - Show only if product has showBulkInquiry flag */}
              {product.showBulkInquiry && (() => {
                const productName = product.id ? getTranslation(language, `products.${product.id}.name`) : product.name
                const subject = `${getTranslation(language, 'productPage.inquireBulkSubject')} - ${productName}`
                const message = getTranslation(language, 'productPage.inquireBulkMessage').replace('{product}', productName)
                return (
                  <a
                    href={`/contact?subject=${encodeURIComponent(subject)}&message=${encodeURIComponent(message)}`}
                    className="w-full py-3.5 md:py-4 px-5 text-sm md:text-base font-semibold rounded-xl border-2 border-stone-300 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] min-h-[48px] md:min-h-[52px] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {getTranslation(language, 'productPage.inquireBulk')}
                  </a>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

