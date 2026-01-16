import { createContext, useContext, useState, useEffect, useRef } from "react"
import { trackAddToCart, trackRemoveFromCart, trackEvent } from "../utils/analytics"
import { getTranslation, translateVariantLabel } from "../utils/translations"
import { useLanguage } from "./LanguageContext"

const CartContext = createContext()

// Global reference to addToast function (set by ToastProvider)
let globalAddToast = null

export function setAddToastFunction(addToastFn) {
  globalAddToast = addToastFn
}

export function CartProvider({ children }) {
  const { language } = useLanguage()
  const [cartItems, setCartItems] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const lastToastRef = useRef({ productId: null, variant: null, timestamp: 0 })
  
  // Safety check for language
  const currentLanguage = language || 'en'

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("purePeelCart")
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        setCartItems(parsed)
        setCartCount(parsed.reduce((sum, item) => sum + item.quantity, 0))
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("purePeelCart", JSON.stringify(cartItems))
    } else {
      localStorage.removeItem("purePeelCart")
    }
    setCartCount(cartItems.reduce((sum, item) => sum + item.quantity, 0))
  }, [cartItems])

  // Track cart view when cart is opened
  useEffect(() => {
    if (isCartOpen && cartItems.length > 0) {
      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      trackEvent('view_cart', {
        currency: 'CAD',
        value: total,
        items: cartItems.map(item => ({
          item_id: item.id,
          item_name: `${item.name} - ${item.variant || ''}`,
          item_category: 'Dehydrated Citrus',
          item_brand: 'Pure Peel Co.',
          price: item.price || 0,
          quantity: item.quantity || 1
        }))
      })
    }
  }, [isCartOpen, cartItems])

  const addToCart = (product) => {
    // Validate product data
    if (!product || !product.id || !product.variant) {
      console.error('❌ Invalid product data - missing required fields:', product)
      return
    }
    
    const quantityToAdd = product.quantity || 1
    const productToTrack = { ...product, quantity: quantityToAdd }
    
    // Prevent duplicate toasts for the same product within 1000ms
    const now = Date.now()
    const isDuplicate = 
      lastToastRef.current.productId === product.id &&
      lastToastRef.current.variant === product.variant &&
      (now - lastToastRef.current.timestamp) < 1000
    
    let finalQuantity = quantityToAdd
    let shouldShowToast = !isDuplicate
    
    setCartItems((prevItems) => {
      console.log('🛒 addToCart called:', { 
        productId: product.id, 
        variant: product.variant, 
        name: product.name,
        currentCartSize: prevItems.length 
      })
      
      const existingItem = prevItems.find(
        (item) => item.id === product.id && item.variant === product.variant
      )

      if (existingItem) {
        // Item already exists - increase quantity
        console.log('🛒 Item exists, updating quantity:', existingItem.quantity, '->', existingItem.quantity + quantityToAdd)
        finalQuantity = existingItem.quantity + quantityToAdd
        trackAddToCart(productToTrack)
        return prevItems.map((item) =>
          item.id === product.id && item.variant === product.variant
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        )
      } else {
        // New item - add to cart
        console.log('🛒 New item, adding to cart. Current items:', prevItems.length)
        finalQuantity = quantityToAdd
        trackAddToCart(productToTrack)
        const newItem = { 
          id: product.id,
          name: product.name,
          variant: product.variant,
          price: product.price,
          image: product.image,
          description: product.description,
          productId: product.productId,
          quantity: quantityToAdd 
        }
        const updatedCart = [...prevItems, newItem]
        console.log('🛒 Cart updated. New total items:', updatedCart.length)
        console.log('🛒 All items:', updatedCart.map(item => `${item.name} (${item.variant})`))
        return updatedCart
      }
    })
    
    // Show toast notification outside of setState to prevent duplicates
    if (shouldShowToast && globalAddToast) {
      // Update the ref to prevent future duplicates
      lastToastRef.current = {
        productId: product.id,
        variant: product.variant,
        timestamp: now
      }
      
      // Use the translated product name passed from ProductPage, or translate it here if not already translated
      let productName = product.name
      if (product.productId) {
        // ProductPage passed productId, use it to get translation
        const translatedName = getTranslation(currentLanguage, `products.${product.productId}.name`)
        if (translatedName !== `products.${product.productId}.name`) {
          productName = translatedName
        }
      } else {
        // Fallback: extract product ID from variant ID (e.g., "orange-mini" -> "orange")
        const productId = product.id?.split('-').slice(0, -1).join('-') || product.id?.replace(/-mini|-small|-medium|-large|-clearbox/, '') || ''
        if (productId) {
          const translatedName = getTranslation(currentLanguage, `products.${productId}.name`)
          if (translatedName !== `products.${productId}.name`) {
            productName = translatedName
          }
        }
      }
      
      globalAddToast({
        type: 'success',
        message: getTranslation(currentLanguage, 'toast.addedToCart'),
        product: {
          name: productName,
          variant: product.variant,
          image: product.image,
          quantity: finalQuantity
        }
      })
    }
  }

  const removeFromCart = (productId, variant) => {
    setCartItems((prevItems) => {
      const itemToRemove = prevItems.find(
        (item) => item.id === productId && item.variant === variant
      )
      
      // Track remove from cart event
      if (itemToRemove) {
        trackRemoveFromCart(itemToRemove)
      }
      
      return prevItems.filter(
        (item) => !(item.id === productId && item.variant === variant)
      )
    })
  }

  const updateQuantity = (productId, variant, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant)
      return
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === productId && item.variant === variant
      )
      
      if (existingItem) {
        const oldQuantity = existingItem.quantity
        const quantityDiff = quantity - oldQuantity
        
        // Track add or remove based on quantity change
        if (quantityDiff > 0) {
          // Quantity increased - track as add to cart
          trackAddToCart({ ...existingItem, quantity: quantityDiff })
        } else if (quantityDiff < 0) {
          // Quantity decreased - track as remove from cart
          trackRemoveFromCart({ ...existingItem, quantity: Math.abs(quantityDiff) })
        }
      }
      
      return prevItems.map((item) =>
        item.id === productId && item.variant === variant
          ? { ...item, quantity }
          : item
      )
    })
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

