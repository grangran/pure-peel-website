import { useEffect, useState } from "react"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation, translateVariantLabel } from "../utils/translations"

const Toast = ({ 
  id,
  type = 'success',
  message,
  product,
  duration = 5000,
  onClose,
  onViewCart
}) => {
  const { language } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger slide-in animation
    setTimeout(() => setIsVisible(true), 10)
    
    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(id)
    }, 300) // Match animation duration
  }

  const handleViewCart = () => {
    if (onViewCart) {
      onViewCart()
    }
    handleClose()
  }

  const typeStyles = {
    success: 'bg-white border-l-4 border-amber-500',
    error: 'bg-white border-l-4 border-red-500',
    info: 'bg-white border-l-4 border-blue-500'
  }

  return (
    <div
      className={`min-w-[320px] max-w-md rounded-lg shadow-lg mb-4 transition-all duration-300 ${
        typeStyles[type]
      } ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Product Image */}
          {product?.image && (
            <div className="flex-shrink-0">
              <img
                src={product.image}
                alt={product.name || 'Product'}
                className="w-16 h-16 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Message */}
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {message || getTranslation(language, 'toast.addedToCart')}
            </p>

            {/* Product Details */}
            {product && (
              <div className="text-sm text-gray-600 mb-3">
                <p className="font-medium text-gray-900">
                  {product.name}
                  {product.variant && ` - ${translateVariantLabel(language, product.variant)}`}
                </p>
                {product.quantity > 1 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {getTranslation(language, 'toast.quantity')} {product.quantity}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleViewCart}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
              >
                {getTranslation(language, 'toast.viewCart')}
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close notification"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toast

