import { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext()

// Exchange rate (CAD to USD) - can be updated or fetched from an API
const CAD_TO_USD_RATE = 0.73 // Approximate rate, can be updated

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currency') || 'CAD'
    }
    return 'CAD'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', currency)
    }
  }, [currency])

  const convertPrice = (cadPrice) => {
    if (currency === 'USD') {
      return cadPrice * CAD_TO_USD_RATE
    }
    return cadPrice
  }

  const formatPrice = (price) => {
    const convertedPrice = convertPrice(price)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertedPrice)
  }

  const getCurrencySymbol = () => {
    return currency === 'USD' ? '$' : '$'
  }

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      convertPrice, 
      formatPrice, 
      getCurrencySymbol,
      exchangeRate: CAD_TO_USD_RATE 
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

