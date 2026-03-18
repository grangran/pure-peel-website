import { useEffect, useState } from "react"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation, translateVariantLabel } from "../utils/translations"

const S = {
  serif:     "'Cormorant Garamond', Georgia, serif",
  sans:      "'Jost', sans-serif",
  dark:      "#0f0a04",
  cream:     "#faf7f2",
  orange:    "#c85a08",
  border:    "rgba(15,10,4,0.08)",
  textMid:   "rgba(15,10,4,0.5)",
  textLight: "rgba(15,10,4,0.35)",
}

const Toast = ({
  id,
  type = "success",
  message,
  product,
  duration = 5000,
  onClose,
  onViewCart,
}) => {
  const { language } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10)
    const timer = setTimeout(() => handleClose(), duration)
    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 300)
  }

  const handleViewCart = () => {
    if (onViewCart) onViewCart()
    handleClose()
  }

  const accentColor = type === "error" ? "#c84a4a" : type === "info" ? "#4a7ac8" : S.orange

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        minWidth: "300px", maxWidth: "360px",
        marginBottom: "12px",
        background: S.cream,
        borderRadius: "14px",
        border: `1px solid ${S.border}`,
        borderLeft: `3px solid ${accentColor}`,
        boxShadow: "0 8px 32px rgba(15,10,4,0.12), 0 2px 8px rgba(15,10,4,0.06)",
        transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease",
        transform: isVisible && !isExiting ? "translateX(0)" : "translateX(calc(100% + 24px))",
        opacity: isVisible && !isExiting ? 1 : 0,
      }}
    >
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>

          {/* Product image */}
          {product?.image && (
            <div style={{
              flexShrink: 0, width: "52px", height: "52px",
              borderRadius: "8px", overflow: "hidden",
              background: "#f2ece0",
              border: `1px solid ${S.border}`,
            }}>
              <img src={product.image} alt={product.name || "Product"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* "Added to cart!" */}
            <p style={{
              fontFamily: S.serif, fontSize: "1rem", fontWeight: 300, fontStyle: "italic",
              color: S.dark, margin: "0 0 4px",
            }}>
              {message || getTranslation(language, "toast.addedToCart")}
            </p>

            {/* Product name + variant */}
            {product && (
              <div style={{ marginBottom: "10px" }}>
                <p style={{
                  fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 400,
                  color: S.dark, margin: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {product.name}
                  {product.variant && (
                    <span style={{ fontWeight: 300, color: S.textMid }}>
                      {" — "}{translateVariantLabel(language, product.variant)}
                    </span>
                  )}
                </p>
                {product.quantity > 1 && (
                  <p style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 300, color: S.textLight, margin: "3px 0 0" }}>
                    {getTranslation(language, "toast.quantity")} {product.quantity}
                  </p>
                )}
              </div>
            )}

            {/* View Cart link */}
            <button onClick={handleViewCart} style={{
              fontFamily: S.sans, fontSize: "0.62rem", fontWeight: 500,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: accentColor, background: "none", border: "none",
              cursor: "pointer", padding: 0,
              transition: "opacity 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              {getTranslation(language, "toast.viewCart")} →
            </button>
          </div>

          {/* Close */}
          <button onClick={handleClose} style={{
            flexShrink: 0, width: "24px", height: "24px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "none", border: "none", cursor: "pointer",
            color: S.textLight, transition: "color 0.15s",
            padding: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.color = S.dark}
            onMouseLeave={e => e.currentTarget.style.color = S.textLight}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

        </div>
      </div>
    </div>
  )
}

export default Toast

