import { useState, useEffect } from "react"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"
import LoadingSpinner from "../components/LoadingSpinner"
import Skeleton from "../components/Skeleton"

const S = {
  serif:     "'Cormorant Garamond', Georgia, serif",
  sans:      "'Jost', sans-serif",
  dark:      "#0f0a04",
  cream:     "#faf7f2",
  creamDark: "#f2ece0",
  orange:    "#c85a08",
  border:    "rgba(15,10,4,0.08)",
  textMid:   "rgba(15,10,4,0.5)",
  textLight: "rgba(15,10,4,0.35)",
}

const inputStyle = {
  width: "100%", padding: "12px 16px",
  borderRadius: "10px", border: `1px solid ${S.border}`,
  background: "#fff", fontFamily: S.sans,
  fontSize: "0.82rem", fontWeight: 300, color: S.dark,
  outline: "none", transition: "border-color 0.2s",
  boxSizing: "border-box",
}

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']

const STATUS_LABELS = {
  pending:    { icon: "⏳", label: "Pending" },
  processing: { icon: "📦", label: "Processing" },
  shipped:    { icon: "🚚", label: "Shipped" },
  delivered:  { icon: "✓",  label: "Delivered" },
  cancelled:  { icon: "✕",  label: "Cancelled" },
}

export default function OrderTracking() {
  const [orderId, setOrderId]   = useState("")
  const [email, setEmail]       = useState("")
  const [order, setOrder]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [searched, setSearched] = useState(false)
  const { language }            = useLanguage()
  const [sectionRef]            = useScrollReveal({ threshold: 0.1 })

  const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/$/, '')
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') return window.location.origin
    return 'http://localhost:3001'
  }
  const API_URL = getApiUrl()

  const DEV_ORDER_ID = 'PP-DEV-12345678'

  const doLookup = async (lookupOrderId, lookupEmail) => {
    setLoading(true); setError(null); setSearched(true); setOrder(null)
    try {
      // Dev-only: mock order so you can test confirmation + tracking without backend (any email for PP-DEV-* orders)
      if (import.meta.env.DEV && lookupOrderId.trim().toUpperCase().startsWith('PP-DEV')) {
        const mockOrder = {
          id: lookupOrderId.trim().toUpperCase().startsWith('PP-DEV-') ? lookupOrderId.trim() : DEV_ORDER_ID,
          createdAt: new Date().toISOString(),
          status: 'shipped',
          items: [{ name: 'Pure Peel Sample', variant: 'Lemon', quantity: 1, total: 0 }],
          subtotal: 0, shippingCost: 0, tax: 0, total: 0, currency: 'CAD',
          shipping: { name: 'Test Customer', method: 'Standard Shipping', address: { line1: '123 Test St', city: 'Toronto', province: 'ON', postalCode: 'M5V 1A1', country: 'CA' } },
          trackingNumber: '1234567890123456789012',
        }
        setOrder(mockOrder)
        setError(null)
        setLoading(false)
        return
      }
      const response = await fetch(`${API_URL}/api/order-lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: lookupOrderId, email: lookupEmail }),
      })
      const data = await response.json()
      if (response.ok) { setOrder(data.order); setError(null) }
      else { setError(data.error || 'Failed to find order'); setOrder(null) }
    } catch (err) {
      setError(err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
        ? 'Unable to connect to server. Please check your internet connection and try again.'
        : 'Unable to connect to server. Please try again later.')
      setOrder(null)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlOrderId = urlParams.get('orderId')
    const urlEmail   = urlParams.get('email')
    if (urlOrderId && urlEmail) { setOrderId(urlOrderId); setEmail(urlEmail); doLookup(urlOrderId, urlEmail) }
  }, [])

  const handleLookup = async (e) => {
    e.preventDefault()
    if (!orderId.trim() || !email.trim()) { setError(getTranslation(language, 'orderTracking.checkInfo')); return }
    doLookup(orderId.trim(), email.trim())
  }

  return (
    <section ref={sectionRef} style={{ background: S.cream, minHeight: "100vh", padding: "80px 20px 96px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ height: "1px", width: "20px", background: "rgba(200,90,8,0.4)" }} />
            <span style={{ fontFamily: S.sans, fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(200,90,8,0.6)" }}>Pure Peel Co.</span>
            <div style={{ height: "1px", width: "20px", background: "rgba(200,90,8,0.4)" }} />
          </div>
          <h1 style={{ fontFamily: S.serif, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, fontStyle: "italic", color: S.dark, letterSpacing: "-0.01em", marginBottom: "10px" }}>
            {getTranslation(language, 'orderTracking.title')}
          </h1>
          <p style={{ fontFamily: S.sans, fontSize: "0.8rem", fontWeight: 300, color: S.textMid, lineHeight: 1.7 }}>
            {getTranslation(language, 'orderTracking.subtitle')}
          </p>
        </div>

        {/* Search form */}
        <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${S.border}`, padding: "32px", marginBottom: "16px" }}>
          <form onSubmit={handleLookup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            <div>
              <label style={{ fontFamily: S.sans, fontSize: "0.62rem", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: S.textMid, display: "block", marginBottom: "6px" }}>
                {getTranslation(language, 'orderTracking.orderNumber')}
              </label>
              <input type="text" value={orderId} onChange={e => setOrderId(e.target.value)}
                placeholder="e.g., PP-12345678" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = "rgba(200,90,8,0.4)"}
                onBlur={e => e.target.style.borderColor = S.border} />
            </div>

            <div>
              <label style={{ fontFamily: S.sans, fontSize: "0.62rem", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: S.textMid, display: "block", marginBottom: "6px" }}>
                {getTranslation(language, 'orderTracking.emailAddress')}
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = "rgba(200,90,8,0.4)"}
                onBlur={e => e.target.style.borderColor = S.border} />
            </div>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)", fontFamily: S.sans, fontSize: "0.75rem", fontWeight: 300, color: "#dc2626", lineHeight: 1.6 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "16px", borderRadius: "12px", border: "none",
              background: loading ? "rgba(15,10,4,0.08)" : "linear-gradient(135deg,#f5e6a3 0%,#e8c84a 55%,#d4a832 100%)",
              fontFamily: S.sans, fontSize: "0.74rem", fontWeight: 500,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: loading ? S.textLight : S.dark,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 6px 24px rgba(232,200,74,0.25)",
              transition: "all 0.2s ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              marginTop: "4px",
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)" }}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
            >
              {loading ? (
                <LoadingSpinner size="md" color="dark" text={getTranslation(language, 'orderTracking.searching')} />
              ) : (
                getTranslation(language, 'orderTracking.trackOrder')
              )}
            </button>
          </form>
        </div>

        {/* Loading skeleton */}
        {loading && searched && !order && !error && (
          <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${S.border}`, padding: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Skeleton type="text" width="200px" height="24px" />
              <Skeleton type="text" width="100%" height="16px" />
              <Skeleton type="text" width="80%" height="16px" />
              <Skeleton type="text" width="60%" height="16px" />
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${S.border}`, padding: "32px", display: "flex", flexDirection: "column", gap: "0" }}>

            {/* Order header */}
            <div style={{ paddingBottom: "24px", borderBottom: `1px solid ${S.border}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <h2 style={{ fontFamily: S.serif, fontSize: "1.6rem", fontWeight: 300, fontStyle: "italic", color: S.dark, marginBottom: "4px" }}>
                    Order {order.id}
                  </h2>
                  <p style={{ fontFamily: S.sans, fontSize: "0.7rem", fontWeight: 300, color: S.textLight }}>
                    {getTranslation(language, 'orderTracking.placedOn')}{' '}
                    {new Date(order.createdAt).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "6px 14px", borderRadius: "100px",
                  border: `1px solid ${S.border}`,
                  fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 400,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: order.status === 'delivered' ? "#3a7a14" : order.status === 'cancelled' ? "#dc2626" : S.orange,
                  background: order.status === 'delivered' ? "rgba(90,154,40,0.06)" : order.status === 'cancelled' ? "rgba(220,38,38,0.05)" : "rgba(200,90,8,0.05)",
                }}>
                  {STATUS_LABELS[order.status]?.icon} {STATUS_LABELS[order.status]?.label || order.status}
                </span>
              </div>
            </div>

            {/* Items */}
            <div style={{ padding: "24px 0", borderBottom: `1px solid ${S.border}` }}>
              <p style={{ fontFamily: S.sans, fontSize: "0.62rem", fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: S.textMid, marginBottom: "14px" }}>
                {getTranslation(language, 'orderTracking.itemsOrdered')}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {order.items?.map((item, i) => {
                  const variantInName = item.variant && item.name?.includes(item.variant)
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "10px", background: S.creamDark }}>
                      <div>
                        <p style={{ fontFamily: S.sans, fontSize: "0.8rem", fontWeight: 400, color: S.dark, marginBottom: "2px" }}>{item.name}</p>
                        {!variantInName && item.variant && (
                          <p style={{ fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 300, color: S.textLight }}>{item.variant}</p>
                        )}
                        <p style={{ fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 300, color: S.textLight, marginTop: "2px" }}>
                          {getTranslation(language, 'orderTracking.quantity')} {item.quantity}
                        </p>
                      </div>
                      <span style={{ fontFamily: S.sans, fontSize: "0.82rem", fontWeight: 400, color: S.dark }}>
                        ${item.total.toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Price summary */}
            <div style={{ padding: "24px 0", borderBottom: `1px solid ${S.border}` }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: getTranslation(language, 'orderTracking.subtotal'), val: order.subtotal },
                  { label: getTranslation(language, 'orderTracking.shipping'),  val: order.shippingCost },
                  { label: getTranslation(language, 'orderTracking.tax'),       val: order.tax },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: S.sans, fontSize: "0.75rem", fontWeight: 300, color: S.textMid }}>{row.label}</span>
                    <span style={{ fontFamily: S.sans, fontSize: "0.75rem", fontWeight: 300, color: S.dark }}>${(row.val || 0).toFixed(2)} {order.currency}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px", borderTop: `1px solid ${S.border}` }}>
                  <span style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: S.dark }}>
                    {getTranslation(language, 'orderTracking.total')}
                  </span>
                  <span style={{ fontFamily: S.serif, fontSize: "1.3rem", fontWeight: 300, color: S.dark }}>
                    ${((order.total || 0) || (order.subtotal || 0) + (order.shippingCost || 0) + (order.tax || 0)).toFixed(2)} {order.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping info */}
            {order.shipping && (
              <div style={{ padding: "24px 0", borderBottom: `1px solid ${S.border}` }}>
                <p style={{ fontFamily: S.sans, fontSize: "0.62rem", fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: S.textMid, marginBottom: "14px" }}>
                  {getTranslation(language, 'orderTracking.shippingInfo')}
                </p>
                <div style={{ background: S.creamDark, borderRadius: "10px", padding: "16px 18px" }}>
                  <p style={{ fontFamily: S.sans, fontSize: "0.8rem", fontWeight: 400, color: S.dark, marginBottom: "6px" }}>{order.shipping.name}</p>
                  {order.shipping.address && (order.shipping.address.line1 || order.shipping.address.city) ? (
                    <div style={{ fontFamily: S.sans, fontSize: "0.75rem", fontWeight: 300, color: S.textMid, lineHeight: 1.6 }}>
                      {order.shipping.address.line1 && <p>{order.shipping.address.line1}</p>}
                      {order.shipping.address.line2 && <p>{order.shipping.address.line2}</p>}
                      <p>{[order.shipping.address.city, order.shipping.address.state || order.shipping.address.province, order.shipping.address.postal_code || order.shipping.address.postalCode].filter(Boolean).join(', ')}</p>
                      {order.shipping.address.country && <p>{order.shipping.address.country}</p>}
                    </div>
                  ) : (
                    <p style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 300, color: S.textLight, fontStyle: "italic" }}>
                      {getTranslation(language, 'orderTracking.shippingAddressNotAvailable') || 'Shipping address not available'}
                    </p>
                  )}
                  <p style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 300, color: S.textMid, marginTop: "8px" }}>
                    <strong style={{ fontWeight: 400, color: S.dark }}>{getTranslation(language, 'orderTracking.shippingMethod')}</strong>{' '}
                    {order.shipping.method || 'Standard Shipping'}
                  </p>
                  {order.trackingNumber && (
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${S.border}` }}>
                      <p style={{ fontFamily: S.sans, fontSize: "0.62rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: S.textMid, marginBottom: "4px" }}>
                        {getTranslation(language, 'orderTracking.trackingNumber') || 'Tracking Number'}
                      </p>
                      <p style={{ fontFamily: "monospace", fontSize: "0.8rem", color: S.dark, marginBottom: "6px" }}>{order.trackingNumber}</p>
                      {order.trackingUrl && (
                        <a href={order.trackingUrl}
                          target="_blank" rel="noopener noreferrer"
                          style={{ fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 400, color: S.orange, textDecoration: "none" }}
                          onMouseEnter={e => { e.target.style.textDecoration = "underline" }}
                          onMouseLeave={e => { e.target.style.textDecoration = "none" }}
                        >
                          {getTranslation(language, 'orderTracking.trackShipment') || 'Track your shipment →'}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status timeline */}
            <div style={{ padding: "24px 0", borderBottom: `1px solid ${S.border}` }}>
              <p style={{ fontFamily: S.sans, fontSize: "0.62rem", fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: S.textMid, marginBottom: "20px" }}>
                {getTranslation(language, 'orderTracking.orderStatus')}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {STATUS_STEPS.map((status, index) => {
                  const stepIndex  = STATUS_STEPS.indexOf(order.status)
                  const isActive   = stepIndex >= index
                  const isCurrent  = order.status === status
                  return (
                    <div key={status} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                        background: isActive ? S.orange : "transparent",
                        border: `1px solid ${isActive ? S.orange : S.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: S.sans, fontSize: "0.6rem", fontWeight: 500,
                        color: isActive ? "#fff" : S.textLight,
                      }}>
                        {isActive ? "✓" : index + 1}
                      </div>
                      <div>
                        <p style={{ fontFamily: S.sans, fontSize: "0.75rem", fontWeight: isActive ? 400 : 300, color: isActive ? S.dark : S.textLight }}>
                          {STATUS_LABELS[status]?.label}
                        </p>
                        {isCurrent && (
                          <p style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 300, color: S.orange, marginTop: "1px" }}>
                            {getTranslation(language, 'orderTracking.currentStatus')}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Help */}
            <div style={{ paddingTop: "20px", textAlign: "center" }}>
              <p style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 300, color: S.textMid }}>
                {getTranslation(language, 'orderTracking.questions')}{' '}
                <a href="/contact?inquiryType=support"
                  style={{ color: S.orange, fontWeight: 400, textDecoration: "none" }}
                  onMouseEnter={e => e.target.style.textDecoration = "underline"}
                  onMouseLeave={e => e.target.style.textDecoration = "none"}
                >support@purepeelco.com</a>
              </p>
            </div>
          </div>
        )}

        {/* No result */}
        {searched && !order && !loading && !error && (
          <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${S.border}`, padding: "40px", textAlign: "center" }}>
            <p style={{ fontFamily: S.serif, fontSize: "1.2rem", fontWeight: 300, fontStyle: "italic", color: S.dark, marginBottom: "8px" }}>
              {getTranslation(language, 'orderTracking.orderNotFound')}
            </p>
            <p style={{ fontFamily: S.sans, fontSize: "0.75rem", fontWeight: 300, color: S.textLight }}>
              {getTranslation(language, 'orderTracking.checkInfo')}
            </p>
          </div>
        )}


      </div>
    </section>
  )
}