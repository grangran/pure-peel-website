import { useState } from "react"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import { useCurrency } from "../context/CurrencyContext"
import { getTranslation, translateVariantLabel } from "../utils/translations"

export default function Cart({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart()
  const [removingItem, setRemovingItem] = useState(null)
  const { language } = useLanguage()
  const { currency, formatPrice } = useCurrency()

  const handleQuantityChange = (productId, variant, newQuantity) => {
    const quantity = parseInt(newQuantity) || 0
    if (quantity <= 0) {
      handleRemoveItem(productId, variant)
    } else {
      updateQuantity(productId, variant, quantity)
    }
  }

  const handleRemoveItem = (productId, variant) => {
    setRemovingItem(`${productId}-${variant}`)
    setTimeout(() => {
      removeFromCart(productId, variant)
      setRemovingItem(null)
    }, 300)
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    onClose()
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Cart.jsx:25',message:'Navigating to checkout',data:{historyLength:window.history.length,pathname:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    // Navigate to checkout page - use pushState and trigger hashchange to sync with App.jsx
    window.history.pushState({ page: "/checkout" }, "", "/checkout")
    // Trigger App.jsx route handler via hashchange event (which App.jsx listens to)
    window.dispatchEvent(new Event("hashchange"))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-1998 animate-fadeIn backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Cart Panel */}
      <div className="fixed top-0 right-0 w-full sm:max-w-[450px] h-screen bg-white z-1999 flex flex-col shadow-[-4px_0_30px_rgba(0,0,0,0.2)] animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 m-0">{getTranslation(language, 'cart.title')}</h2>
            {cartItems.length > 0 && (
              <p className="text-sm text-gray-500 m-0 mt-1">
                {cartItems.length} {cartItems.length === 1 ? getTranslation(language, 'cart.item') : getTranslation(language, 'cart.items')}
              </p>
            )}
          </div>
          <button 
            className="w-10 h-10 flex items-center justify-center bg-transparent border-0 cursor-pointer rounded-lg text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 active:scale-95 min-w-[44px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2" 
            onClick={onClose} 
            aria-label="Close cart"
          >
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
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-gray-50">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <svg
                  className="w-12 h-12 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{getTranslation(language, 'cart.emptyCart')}</h3>
              <p className="text-gray-500 mb-8 max-w-sm">
                {getTranslation(language, 'cart.emptyCartDescription')}
              </p>
              <button 
                className="px-8 py-3 text-sm font-semibold rounded-lg border-2 border-gray-300 cursor-pointer bg-white text-gray-700 transition-all duration-200 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 active:scale-95 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2" 
                onClick={onClose}
              >
                {getTranslation(language, 'cart.continueShopping')}
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 p-5 flex flex-col gap-4">
                {cartItems.map((item) => {
                  const itemKey = `${item.id}-${item.variant}`
                  const isRemoving = removingItem === itemKey
                  
                  return (
                    <div 
                      key={itemKey}
                      className={`bg-white rounded-xl border border-gray-200 p-4 transition-all duration-300 ${
                        isRemoving ? 'opacity-0 scale-95 translate-x-4' : 'opacity-100 scale-100'
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-gray-900 m-0 truncate">
                                {(() => {
                                  // Extract product ID from variant ID (e.g., "orange-mini" -> "orange")
                                  const productId = item.id?.split('-').slice(0, -1).join('-') || item.id?.replace(/-mini|-small|-medium|-large|-clearbox/, '') || ''
                                  // Try to get translated name, fallback to stored name
                                  const translatedName = getTranslation(language, `products.${productId}.name`)
                                  return translatedName !== `products.${productId}.name` ? translatedName : item.name
                                })()}
                              </h3>
                              <p className="text-sm text-gray-600 m-0 mt-0.5">{translateVariantLabel(language, item.variant)}</p>
                            </div>
                            <button
                              className="w-10 h-10 flex items-center justify-center bg-transparent border-0 cursor-pointer rounded-md text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600 shrink-0 touch-manipulation active:scale-95 min-w-[44px] min-h-[44px]"
                              onClick={() => handleRemoveItem(item.id, item.variant)}
                              aria-label={getTranslation(language, 'cart.removeItem')}
                            >
                              <svg
                                className="w-4 h-4"
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
                            </button>
                          </div>

                          {/* Price and Quantity Controls */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 border border-gray-300 rounded-lg bg-white">
                                <button
                                  className="w-10 h-10 flex items-center justify-center bg-transparent border-0 cursor-pointer rounded-l-lg text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 touch-manipulation active:scale-95 min-w-[44px] min-h-[44px]"
                              onClick={() => handleQuantityChange(item.id, item.variant, item.quantity - 1)}
                              aria-label={getTranslation(language, 'cart.decreaseQuantity')}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="min-w-[32px] text-center font-semibold text-sm text-gray-900">
                                  {item.quantity}
                                </span>
                                <button
                                  className="w-10 h-10 flex items-center justify-center bg-transparent border-0 cursor-pointer rounded-r-lg text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 touch-manipulation active:scale-95 min-w-[44px] min-h-[44px]"
                              onClick={() => handleQuantityChange(item.id, item.variant, item.quantity + 1)}
                              aria-label={getTranslation(language, 'cart.increaseQuantity')}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900 m-0">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Cart Footer */}
              <div className="p-6 border-t-2 border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                {/* Subtotal */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base text-gray-600">{getTranslation(language, 'cart.subtotal')}</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(getCartTotal())} {currency}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 m-0 text-center mt-2">
                    {getTranslation(language, 'cart.shippingTaxesNote')}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button 
                    className="w-full py-4 px-6 text-base font-bold rounded-xl border-0 cursor-pointer transition-all duration-300 uppercase tracking-wide font-sans bg-linear-to-br from-amber-500 to-amber-600 text-black shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:from-amber-400 hover:to-amber-500 hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(245,158,11,0.5)] active:translate-y-0 active:scale-[0.98] min-h-[52px] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                    onClick={handleCheckout}
                  >
                    {getTranslation(language, 'cart.proceedToCheckout')}
                  </button>
                  <button 
                    className="w-full py-3 px-6 text-sm font-medium rounded-lg border-2 border-gray-300 cursor-pointer bg-white text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 active:scale-95 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    {getTranslation(language, 'cart.continueShopping')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

