import { useState } from "react"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import { useCurrency } from "../context/CurrencyContext"
import { getTranslation, translateVariantLabel } from "../utils/translations"

const S = {
  serif:     "'Cormorant Garamond', Georgia, serif",
  sans:      "'Jost', sans-serif",
  dark:      "#0f0a04",
  cream:     "#faf7f2",
  creamDark: "#f2ece0",
  gold:      "#e8c84a",
  orange:    "#c85a08",
  border:    "rgba(15,10,4,0.08)",
  textMid:   "rgba(15,10,4,0.5)",
  textLight: "rgba(15,10,4,0.35)",
}

export default function Cart({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart()
  const [removingItem, setRemovingItem] = useState(null)
  const { language } = useLanguage()
  const { currency, formatPrice } = useCurrency()

  const handleQuantityChange = (productId, variant, newQuantity) => {
    const quantity = parseInt(newQuantity) || 0
    if (quantity <= 0) handleRemoveItem(productId, variant)
    else updateQuantity(productId, variant, quantity)
  }

  const handleRemoveItem = (productId, variant) => {
    setRemovingItem(`${productId}-${variant}`)
    setTimeout(() => { removeFromCart(productId, variant); setRemovingItem(null) }, 300)
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    onClose()
    window.history.pushState({ page: "/checkout" }, "", "/checkout")
    window.dispatchEvent(new Event("hashchange"))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1998,
          background: "rgba(15,10,4,0.45)",
          backdropFilter: "blur(4px)",
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0,
        width: "100%", maxWidth: "420px", height: "100vh",
        background: S.cream,
        zIndex: 1999,
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 48px rgba(15,10,4,0.16)",
        animation: "slideInRight 0.3s cubic-bezier(0.22,1,0.36,1)",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "24px 28px",
          borderBottom: `1px solid ${S.border}`,
          background: S.cream,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <div style={{ height: "1px", width: "16px", background: "rgba(200,90,8,0.4)" }} />
              <span style={{ fontFamily: S.sans, fontSize: "0.55rem", fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(200,90,8,0.6)" }}>
                Pure Peel Co.
              </span>
            </div>
            <h2 style={{
              fontFamily: S.serif, fontSize: "1.8rem", fontWeight: 300, fontStyle: "italic",
              color: S.dark, margin: 0, lineHeight: 1,
            }}>
              {getTranslation(language, "cart.title")}
            </h2>
            {cartItems.length > 0 && (
              <p style={{ fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 300, color: S.textLight, margin: "6px 0 0" }}>
                {cartItems.length} {cartItems.length === 1 ? getTranslation(language, "cart.item") : getTranslation(language, "cart.items")}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{
            width: "36px", height: "36px", borderRadius: "50%",
            border: `1px solid ${S.border}`, background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(15,10,4,0.06)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(15,10,4,0.5)" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {cartItems.length === 0 ? (

            /* ── EMPTY STATE ── */
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "48px 32px", textAlign: "center",
            }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                border: `1px solid ${S.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "24px",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(15,10,4,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <h3 style={{ fontFamily: S.serif, fontSize: "1.5rem", fontWeight: 300, fontStyle: "italic", color: S.dark, marginBottom: "10px" }}>
                {getTranslation(language, "cart.emptyCart")}
              </h3>
              <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textLight, lineHeight: 1.7, marginBottom: "32px", maxWidth: "240px" }}>
                {getTranslation(language, "cart.emptyCartDescription")}
              </p>
              <button onClick={onClose} style={{
                padding: "12px 28px", borderRadius: "100px",
                border: `1.5px solid ${S.border}`, background: "transparent",
                fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 300,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: S.textMid, cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(15,10,4,0.2)"; e.currentTarget.style.background = S.creamDark }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.background = "transparent" }}
              >
                {getTranslation(language, "cart.continueShopping")}
              </button>
            </div>

          ) : (

            /* ── ITEMS ── */
            <>
              <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {cartItems.map(item => {
                  const itemKey = `${item.id}-${item.variant}`
                  const isRemoving = removingItem === itemKey
                  const productId = item.id?.split("-").slice(0, -1).join("-") || item.id?.replace(/-mini|-small|-medium|-large|-clearbox/, "") || ""
                  const translatedName = getTranslation(language, `products.${productId}.name`)
                  const displayName = translatedName !== `products.${productId}.name` ? translatedName : item.name

                  return (
                    <div key={itemKey} style={{
                      background: "#fff", borderRadius: "12px",
                      border: `1px solid ${S.border}`,
                      padding: "16px",
                      opacity: isRemoving ? 0 : 1,
                      transform: isRemoving ? "translateX(12px) scale(0.97)" : "none",
                      transition: "opacity 0.3s ease, transform 0.3s ease",
                    }}>
                      <div style={{ display: "flex", gap: "14px" }}>

                        {/* Image */}
                        <div style={{
                          width: "72px", height: "72px", borderRadius: "8px",
                          overflow: "hidden", background: S.creamDark,
                          border: `1px solid ${S.border}`, flexShrink: 0,
                        }}>
                          <img src={item.image} alt={displayName}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h3 style={{
                                fontFamily: S.serif, fontSize: "1rem", fontWeight: 400, fontStyle: "italic",
                                color: S.dark, margin: 0,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}>{displayName}</h3>
                              <p style={{ fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 300, color: S.textLight, margin: "3px 0 0" }}>
                                {translateVariantLabel(language, item.variant)}
                              </p>
                            </div>
                            <button onClick={() => handleRemoveItem(item.id, item.variant)}
                              style={{
                                width: "28px", height: "28px", borderRadius: "50%",
                                border: "none", background: "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", flexShrink: 0, transition: "background 0.15s",
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(200,40,40,0.07)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(15,10,4,0.3)" strokeWidth="2" strokeLinecap="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* Qty + Price */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
                            <div style={{
                              display: "inline-flex", alignItems: "center",
                              border: `1px solid ${S.border}`, borderRadius: "100px",
                              overflow: "hidden", background: S.cream,
                            }}>
                              {[{ label: "−", delta: -1 }, null, { label: "+", delta: 1 }].map((btn, i) =>
                                btn === null ? (
                                  <span key="n" style={{
                                    width: "32px", height: "32px",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontFamily: S.sans, fontSize: "0.82rem", fontWeight: 400, color: S.dark,
                                  }}>{item.quantity}</span>
                                ) : (
                                  <button key={btn.label}
                                    onClick={() => handleQuantityChange(item.id, item.variant, item.quantity + btn.delta)}
                                    style={{
                                      width: "32px", height: "32px", border: "none",
                                      background: "transparent", fontSize: "1rem", fontWeight: 300,
                                      color: S.textMid, cursor: "pointer", transition: "background 0.15s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(15,10,4,0.05)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >{btn.label}</button>
                                )
                              )}
                            </div>
                            <span style={{ fontFamily: S.serif, fontSize: "1.1rem", fontWeight: 400, color: S.dark }}>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div style={{
                padding: "20px 24px 28px",
                borderTop: `1px solid ${S.border}`,
                background: S.cream,
              }}>
                {/* Subtotal */}
                <div style={{
                  display: "flex", alignItems: "baseline", justifyContent: "space-between",
                  marginBottom: "6px",
                }}>
                  <span style={{ fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", color: S.textMid }}>
                    {getTranslation(language, "cart.subtotal")}
                  </span>
                  <span style={{ fontFamily: S.serif, fontSize: "1.6rem", fontWeight: 300, color: S.dark }}>
                    {formatPrice(getCartTotal())} <span style={{ fontSize: "0.75rem", fontFamily: S.sans, fontWeight: 300, color: S.textLight }}>{currency}</span>
                  </span>
                </div>
                <p style={{ fontFamily: S.sans, fontSize: "0.62rem", fontWeight: 300, color: S.textLight, textAlign: "right", marginBottom: "20px" }}>
                  {getTranslation(language, "cart.shippingTaxesNote")}
                </p>

                {/* Checkout */}
                <button onClick={handleCheckout} style={{
                  width: "100%", padding: "16px",
                  borderRadius: "12px", border: "none",
                  background: "linear-gradient(135deg,#f5e6a3 0%,#e8c84a 55%,#d4a832 100%)",
                  fontFamily: S.sans, fontSize: "0.74rem", fontWeight: 500,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: S.dark, cursor: "pointer", marginBottom: "10px",
                  boxShadow: "0 4px 20px rgba(232,200,74,0.28)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(232,200,74,0.38)" }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(232,200,74,0.28)" }}
                >
                  {getTranslation(language, "cart.proceedToCheckout")}
                </button>

                <button onClick={onClose} style={{
                  width: "100%", padding: "13px",
                  borderRadius: "12px", border: `1.5px solid ${S.border}`,
                  background: "transparent",
                  fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 300,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: S.textMid, cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(15,10,4,0.18)"; e.currentTarget.style.background = S.creamDark }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.background = "transparent" }}
                >
                  {getTranslation(language, "cart.continueShopping")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}