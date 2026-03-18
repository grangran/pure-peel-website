import { useState, useCallback, createContext, useContext, useEffect } from "react"
import Toast from "./Toast"
import { useCart } from "../context/CartContext"
import { setAddToastFunction } from "../context/CartContext"

const ToastContext = createContext()

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Fallback: return a no-op function if context is not available
    return { addToast: () => {} }
  }
  return context
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const { setIsCartOpen } = useCart()

  const addToast = useCallback((toastData) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      type: 'success',
      ...toastData
    }
    console.log('Adding toast:', newToast)
    setToasts((prev) => [...prev, newToast])
  }, [])

  // Register addToast function globally so CartContext can use it
  useEffect(() => {
    setAddToastFunction(addToast)
    return () => setAddToastFunction(null)
  }, [addToast])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const handleViewCart = useCallback(() => {
    setIsCartOpen(true)
  }, [setIsCartOpen])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
       className="fixed top-[88px] right-4 z-[2000] pointer-events-none"
        style={{ maxWidth: 'calc(100vw - 2rem)' }}
      >
        <div className="pointer-events-auto">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={removeToast}
              onViewCart={handleViewCart}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

