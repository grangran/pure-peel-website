import { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext()

// Fallback exchange rate (CAD to USD) - used if API fails
const FALLBACK_RATE = 0.73
// Cache duration: 1 hour (3600000 ms)
const CACHE_DURATION = 60 * 60 * 1000

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currency') || 'CAD'
    }
    return 'CAD'
  })

  const [exchangeRate, setExchangeRate] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('exchangeRate')
      const cachedTimestamp = localStorage.getItem('exchangeRateTimestamp')
      
      if (cached && cachedTimestamp) {
        const age = Date.now() - parseInt(cachedTimestamp, 10)
        // Use cached rate if less than 1 hour old
        if (age < CACHE_DURATION) {
          return parseFloat(cached)
        }
      }
    }
    return FALLBACK_RATE
  })

  const [isLoadingRate, setIsLoadingRate] = useState(false)

  // Fetch real-time exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      // Check if we have a recent cached rate
      const cached = localStorage.getItem('exchangeRate')
      const cachedTimestamp = localStorage.getItem('exchangeRateTimestamp')
      
      if (cached && cachedTimestamp) {
        const age = Date.now() - parseInt(cachedTimestamp, 10)
        // If cache is still fresh (< 1 hour), use it
        if (age < CACHE_DURATION) {
          setExchangeRate(parseFloat(cached))
          return
        }
      }

      setIsLoadingRate(true)
      
      try {
        // Using exchangerate-api.com (free, no API key required for basic usage)
        // Alternative: You can use fixer.io, exchangerate.host, or your own backend
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/CAD')
        
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rate')
        }
        
        const data = await response.json()
        const rate = data.rates?.USD || FALLBACK_RATE
        
        // Cache the rate
        if (typeof window !== 'undefined') {
          localStorage.setItem('exchangeRate', rate.toString())
          localStorage.setItem('exchangeRateTimestamp', Date.now().toString())
        }
        
        setExchangeRate(rate)
      } catch (error) {
        console.error('Error fetching exchange rate:', error)
        // Use fallback rate if API fails
        setExchangeRate(FALLBACK_RATE)
      } finally {
        setIsLoadingRate(false)
      }
    }

    fetchExchangeRate()
    
    // Refresh rate every hour
    const interval = setInterval(fetchExchangeRate, CACHE_DURATION)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', currency)
    }
  }, [currency])

  const convertPrice = (cadPrice) => {
    if (currency === 'USD') {
      return cadPrice * exchangeRate
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
      exchangeRate,
      isLoadingRate
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

