import { useState, useEffect } from "react"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"
import LoadingSpinner from "../components/LoadingSpinner"
import Skeleton from "../components/Skeleton"

export default function OrderTracking() {
  const [orderId, setOrderId] = useState("")
  const [email, setEmail] = useState("")
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)
  const { language } = useLanguage()

  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.1 })

  // Get API URL - use environment variable or try to detect from current domain
  const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL.replace(/\/$/, '')
    }
    // In production, if VITE_API_URL is not set, try to use same origin
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // For production, we need VITE_API_URL set, but as fallback use same origin
      return window.location.origin
    }
    return 'http://localhost:3001'
  }
  const API_URL = getApiUrl()

  // Check for order ID and email in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlOrderId = urlParams.get('orderId')
    const urlEmail = urlParams.get('email')
    
    if (urlOrderId && urlEmail) {
      setOrderId(urlOrderId)
      setEmail(urlEmail)
      // Lookup order automatically
      const lookupOrder = async () => {
        setLoading(true)
        setError(null)
        setSearched(true)
        try {
          const response = await fetch(`${API_URL}/api/order-lookup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: urlOrderId,
              email: urlEmail
            })
          })
          const data = await response.json()
          if (response.ok) {
            setOrder(data.order)
            setError(null)
          } else {
            setError(data.error || 'Failed to find order')
            setOrder(null)
          }
        } catch (err) {
          console.error('Order lookup error:', err)
          // Provide more helpful error message
          if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
            setError('Unable to connect to server. Please check your internet connection and try again. If the problem persists, the server may be temporarily unavailable.')
          } else {
            setError('Unable to connect to server. Please try again later.')
          }
          setOrder(null)
        } finally {
          setLoading(false)
        }
      }
      lookupOrder()
    }
  }, [])

  const handleLookup = async (e, prefillOrderId = null, prefillEmail = null) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSearched(true)

    const lookupOrderId = prefillOrderId || orderId.trim()
    const lookupEmail = prefillEmail || email.trim()

    if (!lookupOrderId || !lookupEmail) {
      setError(getTranslation(language, 'orderTracking.checkInfo'))
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/order-lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: lookupOrderId,
          email: lookupEmail
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to find order')
        setOrder(null)
      } else {
        setOrder(data.order)
        setError(null)
      }
    } catch (err) {
      console.error('Order lookup error:', err)
      // Provide more helpful error message
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError('Unable to connect to server. Please check your internet connection and try again. If the problem persists, the server may be temporarily unavailable.')
      } else {
        setError('Unable to connect to server. Please try again later.')
      }
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'processing':
        return '📦'
      case 'shipped':
        return '🚚'
      case 'delivered':
        return '✅'
      case 'cancelled':
        return '❌'
      default:
        return '📋'
    }
  }

  return (
    <section ref={sectionRef} className="py-12 px-5 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{getTranslation(language, 'orderTracking.title')}</h1>
          <p className="text-gray-600">{getTranslation(language, 'orderTracking.subtitle')}</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getTranslation(language, 'orderTracking.orderNumber')}
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., PP-12345678"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getTranslation(language, 'orderTracking.emailAddress')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 text-base font-bold rounded-xl border-0 cursor-pointer transition-all duration-300 uppercase tracking-wide font-sans bg-linear-to-br from-amber-500 to-amber-600 text-black shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:from-amber-400 hover:to-amber-500 hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(245,158,11,0.5)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <LoadingSpinner size="md" color="black" text={getTranslation(language, 'orderTracking.searching')} />
              ) : (
                getTranslation(language, 'orderTracking.trackOrder')
              )}
            </button>
          </form>
        </div>

        {/* Loading Skeleton for Order Details */}
        {loading && searched && !order && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <Skeleton type="text" width="200px" height="28px" />
                  <Skeleton type="text" width="150px" height="16px" />
                </div>
                <Skeleton type="button" width="120px" height="36px" />
              </div>
            </div>
            <div>
              <Skeleton type="text" width="150px" height="20px" className="mb-4" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2 flex-1">
                      <Skeleton type="text" width="60%" height="20px" />
                      <Skeleton type="text" width="40%" height="16px" />
                      <Skeleton type="text" width="30%" height="16px" />
                    </div>
                    <Skeleton type="text" width="80px" height="20px" />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <div className="flex justify-between">
                <Skeleton type="text" width="100px" height="16px" />
                <Skeleton type="text" width="80px" height="16px" />
              </div>
              <div className="flex justify-between">
                <Skeleton type="text" width="120px" height="16px" />
                <Skeleton type="text" width="80px" height="16px" />
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <Skeleton type="text" width="100px" height="20px" />
                <Skeleton type="text" width="100px" height="20px" />
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            {/* Order Header */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Order {order.id}</h2>
                  <p className="text-sm text-gray-600">
                    {getTranslation(language, 'orderTracking.placedOn')} {new Date(order.createdAt).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    <span className="text-lg">{getStatusIcon(order.status)}</span>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{getTranslation(language, 'orderTracking.itemsOrdered')}</h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.variant}</p>
                      <p className="text-sm text-gray-500 mt-1">{getTranslation(language, 'orderTracking.quantity')} {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">${item.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{getTranslation(language, 'orderTracking.subtotal')}</span>
                  <span className="text-gray-900">${order.subtotal?.toFixed(2)} {order.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{getTranslation(language, 'orderTracking.shipping')}</span>
                  <span className="text-gray-900">${order.shippingCost?.toFixed(2)} {order.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{getTranslation(language, 'orderTracking.tax')}</span>
                  <span className="text-gray-900">${order.tax?.toFixed(2)} {order.currency}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">{getTranslation(language, 'orderTracking.total')}</span>
                  <span className="text-gray-900">${(order.total || (order.subtotal || 0) + (order.shippingCost || 0) + (order.tax || 0)).toFixed(2)} {order.currency}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            {order.shipping && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{getTranslation(language, 'orderTracking.shippingInfo')}</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900 mb-2">{order.shipping.name}</p>
                  {order.shipping.address && (order.shipping.address.line1 || order.shipping.address.city) ? (
                    <div className="text-sm text-gray-600">
                      {order.shipping.address.line1 && <p>{order.shipping.address.line1}</p>}
                      {order.shipping.address.line2 && <p>{order.shipping.address.line2}</p>}
                      <p>
                        {order.shipping.address.city || ''}{order.shipping.address.city && (order.shipping.address.state || order.shipping.address.province || order.shipping.address.postal_code || order.shipping.address.postalCode) ? ', ' : ''}{order.shipping.address.state || order.shipping.address.province || ''} {order.shipping.address.postal_code || order.shipping.address.postalCode || ''}
                      </p>
                      {order.shipping.address.country && <p>{order.shipping.address.country}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">{getTranslation(language, 'orderTracking.shippingAddressNotAvailable') || 'Shipping address not available'}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>{getTranslation(language, 'orderTracking.shippingMethod')}</strong> {order.shipping.method || 'Standard Shipping'}
                  </p>
                  {order.trackingNumber && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 mb-1">{getTranslation(language, 'orderTracking.trackingNumber') || 'Tracking Number'}:</p>
                      <p className="text-sm text-gray-700 font-mono">{order.trackingNumber}</p>
                      {order.shipping.address?.country === 'CA' && (
                        <a 
                          href={`https://www.canadapost.ca/trackweb/en#/search?searchFor=${order.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-amber-600 hover:text-amber-700 underline mt-2 inline-block"
                        >
                          {getTranslation(language, 'orderTracking.trackOnCanadaPost') || 'Track on Canada Post'}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{getTranslation(language, 'orderTracking.orderStatus')}</h3>
              <div className="space-y-4">
                {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
                  const isActive = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= index
                  const isCurrent = order.status === status
                  
                  return (
                    <div key={status} className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        isActive ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {isActive ? '✓' : index + 1}
                      </div>
                      <div className="flex-1 pt-2">
                        <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-gray-600 mt-1">{getTranslation(language, 'orderTracking.currentStatus')}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Help Text */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600 text-center">
                {getTranslation(language, 'orderTracking.questions')}{' '}
                <a href="/contact?inquiryType=support" className="text-amber-600 hover:text-amber-700">
                  support@purepeelco.com
                </a>
              </p>
            </div>
          </div>
        )}

        {/* No Order Found Message */}
        {searched && !order && !loading && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600">{getTranslation(language, 'orderTracking.orderNotFound')}</p>
            <p className="text-sm text-gray-500 mt-2">
              {getTranslation(language, 'orderTracking.checkInfo')}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

