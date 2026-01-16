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
        let rate = data.rates?.USD || FALLBACK_RATE
        
        // Ensure rate is a decimal (0.0-1.0 range), not a percentage
        // Some APIs might return rates as percentages (e.g., 75.47 instead of 0.7547)
        if (rate > 1) {
          console.warn('Exchange rate appears to be a percentage, converting to decimal:', rate)
          rate = rate / 100
        }
        
        // Validate rate is reasonable (between 0.5 and 1.5 for CAD to USD)
        if (rate < 0.5 || rate > 1.5) {
          console.warn('Exchange rate seems incorrect, using fallback:', rate)
          rate = FALLBACK_RATE
        }
        
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

  // Listen for localStorage changes and sync currency when navigating between pages
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e) => {
      if (e.key === 'currency' && e.newValue && e.newValue !== currency) {
        setCurrency(e.newValue)
      }
    }

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange)

    // Check localStorage on window focus (e.g., when navigating back to tab)
    const handleFocus = () => {
      const stored = localStorage.getItem('currency')
      if (stored && stored !== currency) {
        setCurrency(stored)
      }
    }

    // Check immediately to sync on mount/navigation
    handleFocus()

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
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
    // Use appropriate locale based on currency
    // en-US for USD, en-CA for CAD
    const locale = currency === 'USD' ? 'en-US' : 'en-CA'
    return new Intl.NumberFormat(locale, {
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

