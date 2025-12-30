import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"
import Skeleton from "./Skeleton"
import LoadingSpinner from "./LoadingSpinner"

export default function ProductPage({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [isImageFading, setIsImageFading] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const { addToCart } = useCart()

  useEffect(() => {
    setSelectedVariant(product.variants[0])
  }, [product])

  const handleVariantChange = (variant) => {
    setIsImageFading(true)
    setImageLoading(true)
    setTimeout(() => {
      setSelectedVariant(variant)
      setIsImageFading(false)
    }, 180)
  }

  const handleAddToCart = () => {
    setAddingToCart(true)
    addToCart({
      id: selectedVariant.id,
      name: product.name,
      variant: selectedVariant.option,
      price: selectedVariant.price,
      image: selectedVariant.image,
      description: product.description,
      quantity: 1
    })
    // Reset loading state after a brief delay for visual feedback
    setTimeout(() => setAddingToCart(false), 500)
  }

  return (
    <section className="py-12 md:py-16 px-5 pb-20 bg-gradient-to-b from-gray-50 to-white min-h-[calc(100vh-72px)]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Image Section */}
          <div className="flex justify-center items-start">
            <div className="relative w-full max-w-[600px]">
              {/* Image Container with enhanced styling */}
              <div className="relative bg-white rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100">
                <div className="relative overflow-hidden rounded-2xl bg-gray-50">
                  {imageLoading && !isImageFading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Skeleton type="image" width="100%" height="400px" />
                    </div>
                  )}
                  <img
                    src={selectedVariant.image}
                    alt={`${product.name} slices`}
                    className={`w-full h-auto object-contain transition-all duration-500 ${
                      isImageFading || imageLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
                    }`}
                    onLoad={() => setImageLoading(false)}
                  />
                </div>
                {/* Decorative corner accent */}
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-linear-to-br from-amber-500/20 to-amber-600/10 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            {/* Breadcrumb */}
            <div className="mb-6">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Product</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed text-lg max-w-lg">
              {product.description}
            </p>

            {/* Price */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">${selectedVariant.price}</span>
                <span className="text-lg text-gray-500">CAD</span>
              </div>
            </div>

            {/* Variants */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Select Size
              </h3>
              <div className="flex flex-col gap-3">
                {product.variants.map((variant) => (
                  <label
                    key={variant.id}
                    className={`group relative py-4 px-5 border-2 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                      selectedVariant.id === variant.id
                        ? "border-amber-500 bg-amber-50/50 shadow-md shadow-amber-500/10"
                        : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/30 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        selectedVariant.id === variant.id
                          ? "border-amber-500 bg-amber-500"
                          : "border-gray-300 bg-white group-hover:border-amber-400"
                      }`}>
                        {selectedVariant.id === variant.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        selectedVariant.id === variant.id ? "text-gray-900" : "text-gray-700"
                      }`}>
                        {variant.label}
                      </span>
                    </div>
                    <span className={`text-base font-semibold ${
                      selectedVariant.id === variant.id ? "text-amber-600" : "text-gray-500"
                    }`}>
                      ${variant.price}.00
                    </span>
                    <input
                      type="radio"
                      name="variant"
                      checked={selectedVariant.id === variant.id}
                      onChange={() => handleVariantChange(variant)}
                      className="absolute opacity-0 pointer-events-none"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button 
              className="group relative w-full py-5 px-8 text-base font-bold rounded-xl border-0 cursor-pointer transition-all duration-300 uppercase tracking-wider font-sans bg-linear-to-br from-amber-500 to-amber-600 text-black shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:from-amber-400 hover:to-amber-500 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(245,158,11,0.5)] active:translate-y-0 active:shadow-[0_2px_10px_rgba(245,158,11,0.3)] overflow-hidden mb-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[56px]" 
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? (
                <LoadingSpinner size="md" color="black" text="Adding..." />
              ) : (
                <>
                  <span className="relative z-10">Add to Cart</span>
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>100% Natural</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>No Preservatives</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Made in Canada 🍁</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

