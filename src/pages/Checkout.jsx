import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { useCurrency } from "../context/CurrencyContext"
import { getTranslation } from "../utils/translations"
import { trackCheckoutStarted, trackPurchase } from "../utils/analytics"
import LoadingSpinner from "../components/LoadingSpinner"
import Skeleton from "../components/Skeleton"
import PageLoader from "../components/PageLoader"

const canadianProvinces = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick", 
  "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", 
  "Nunavut", "Ontario", "Prince Edward Island", "Quebec", 
  "Saskatchewan", "Yukon"
]

const usStates = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
]

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart, setIsCartOpen } = useCart()
  const { language } = useLanguage()
  const { currency, convertPrice, formatPrice } = useCurrency()
  const [currentStep, setCurrentStep] = useState(1) // 1: Checkout (combined), 2: Confirmation
  
  // Track step changes (only for confirmation)
  useEffect(() => {
    if (currentStep === 2) {
      // Step changed to confirmation
    }
  }, [currentStep])
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderNumber, setOrderNumber] = useState(null)
  const [stripeError, setStripeError] = useState(null)
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '' })
  const [shippingOptions, setShippingOptions] = useState([])
  const [selectedShipping, setSelectedShipping] = useState(null)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [shippingError, setShippingError] = useState(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [hasEnteredShippingDetails, setHasEnteredShippingDetails] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromoCode, setAppliedPromoCode] = useState(null)
  const [promoCodeError, setPromoCodeError] = useState('')
  const [promoCodeDiscount, setPromoCodeDiscount] = useState(0) // Discount amount in CAD
  const [promoCodeType, setPromoCodeType] = useState(null) // 'percent' or 'free_shipping'
  
  // Check for Stripe redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const canceled = urlParams.get('canceled')
    const sessionId = urlParams.get('session_id')

    if (success === 'true' && sessionId) {
      // Payment was successful - clear saved form data
      localStorage.removeItem('checkoutFormData')
      localStorage.removeItem('checkoutShippingOption')
      handlePaymentSuccess(sessionId)
    } else if (canceled === 'true') {
      // Payment was canceled - restore form data and return to checkout
      setCurrentStep(1)
      setStripeError('Payment was canceled. Your information has been saved. You can try again when ready.')
      // Clean up URL by removing query parameters
      if (window.location.search) {
        window.history.replaceState({}, '', '/checkout')
      }
      
      // Validate saved postal code matches current form data
      // If address fields changed, clear postal code and shipping options
      const savedFormData = loadSavedFormData()
      const currentAddressKey = `${savedFormData.postalCode}-${savedFormData.province}-${savedFormData.city}-${savedFormData.country}`.toLowerCase()
      const savedAddressKey = localStorage.getItem('checkoutAddressKey')
      
      if (savedAddressKey && savedAddressKey.toLowerCase() !== currentAddressKey) {
        // Address changed - clear postal code and shipping options
        console.log('Address mismatch detected, clearing postal code and shipping options')
        setFormData(prev => ({ ...prev, postalCode: '' }))
        setShippingOptions([])
        setSelectedShipping(null)
        setHasEnteredShippingDetails(false)
        localStorage.removeItem('checkoutShippingOptions')
        localStorage.removeItem('checkoutShippingOption')
        localStorage.removeItem('checkoutAddressKey')
      }
      
      // Form data is already loaded from localStorage in loadSavedFormData()
      // Shipping rates will be automatically refetched by the useEffect that watches formData
    }
  }, [])
  
  // Load saved form data from localStorage on mount
  const loadSavedFormData = () => {
    try {
      const saved = localStorage.getItem('checkoutFormData')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading saved form data:', error)
    }
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "Canada",
      province: "",
      postalCode: "",
      notes: ""
    }
  }

  const [formData, setFormData] = useState(loadSavedFormData)

  const [errors, setErrors] = useState({})

  // Track saved address to match with shipping options
  const [savedAddressKey, setSavedAddressKey] = useState(null)
  
  // Restore form data and shipping options from localStorage on mount
  useEffect(() => {
    try {
      // Reload form data from localStorage to ensure it's up to date
      const savedFormData = localStorage.getItem('checkoutFormData')
      if (savedFormData) {
        const parsed = JSON.parse(savedFormData)
        setFormData(parsed)
        
        // If all address fields are filled, mark as entered
        if (parsed.postalCode && parsed.province && parsed.city && parsed.country) {
          setHasEnteredShippingDetails(true)
          console.log('Address fields detected, setting hasEnteredShippingDetails to true')
        }
      }
      
      // Restore shipping options
      const savedOptions = localStorage.getItem('checkoutShippingOptions')
      const savedSelected = localStorage.getItem('checkoutShippingOption')
      const savedAddress = localStorage.getItem('checkoutAddressKey')
      
      if (savedOptions && savedAddress) {
        const parsedOptions = JSON.parse(savedOptions)
        setShippingOptions(parsedOptions)
        setSavedAddressKey(savedAddress)
        console.log('Restored shipping options from localStorage:', parsedOptions.length, 'options')
      }
      
      if (savedSelected) {
        const parsedSelected = JSON.parse(savedSelected)
        setSelectedShipping(parsedSelected)
        setHasEnteredShippingDetails(true)
        console.log('Restored selected shipping option:', parsedSelected.name)
      }
    } catch (error) {
      console.error('Error loading saved data:', error)
    }
  }, [])
  
  // Auto-fetch shipping rates when form data is preloaded and address is complete
  useEffect(() => {
    // Wait a bit for formData state to be set from localStorage
    const timer = setTimeout(() => {
      if (hasEnteredShippingDetails && formData.postalCode && formData.province && formData.city && formData.country && cartItems.length > 0) {
        const currentAddressKey = `${formData.postalCode}-${formData.province}-${formData.city}-${formData.country}`.toLowerCase()
        
        // If we don't have shipping options loaded, or the address key doesn't match, fetch rates
        if (shippingOptions.length === 0 || !savedAddressKey || savedAddressKey.toLowerCase() !== currentAddressKey) {
          console.log('Auto-fetching shipping rates for preloaded address:', currentAddressKey)
          fetchShippingRates()
        } else {
          console.log('Shipping options already loaded for address:', currentAddressKey)
        }
      } else {
        console.log('Conditions not met for auto-fetch:', {
          hasEnteredShippingDetails,
          postalCode: formData.postalCode,
          province: formData.province,
          city: formData.city,
          country: formData.country,
          cartItemsLength: cartItems.length
        })
      }
    }, 300) // Increased delay to ensure state is fully updated, especially on iOS
    
    return () => clearTimeout(timer)
  }, [hasEnteredShippingDetails, formData.postalCode, formData.province, formData.city, formData.country, cartItems.length, shippingOptions.length, savedAddressKey]) // Run when these change

  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.1 })

  // No history management on mount - keep it simple

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('checkoutFormData', JSON.stringify(formData))
    } catch (error) {
      console.error('Error saving form data:', error)
    }
  }, [formData])

  // Duplicate removed - shipping options and selected shipping are now loaded in the useEffect above

  // Save shipping option to localStorage
  useEffect(() => {
    if (selectedShipping) {
      try {
        localStorage.setItem('checkoutShippingOption', JSON.stringify(selectedShipping))
      } catch (error) {
        console.error('Error saving shipping option:', error)
      }
    }
  }, [selectedShipping])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    // For Canadian postal codes, convert to uppercase but don't force display
    let processedValue = value
    if (name === 'postalCode' && formData.country === "Canada") {
      processedValue = value.toUpperCase()
    }
    setFormData(prev => ({ ...prev, [name]: processedValue }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
    // Track when user enters shipping details
    if (name === 'postalCode' || name === 'province' || name === 'city' || name === 'country') {
      if (processedValue && !hasEnteredShippingDetails) {
        setHasEnteredShippingDetails(true)
      }
      // Clear province/state and postal code when country changes
      if (name === 'country') {
        setFormData(prev => ({ ...prev, province: '', postalCode: '' }))
        setShippingOptions([])
        setSelectedShipping(null)
        // Clear saved shipping data when address changes
        localStorage.removeItem('checkoutShippingOptions')
        localStorage.removeItem('checkoutShippingOption')
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.country) newErrors.country = "Country is required"
    if (!formData.province) {
      newErrors.province = formData.country === "United States" ? "State is required" : "Province is required"
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = formData.country === "United States" ? "ZIP code is required" : "Postal code is required"
    } else {
      // Validate based on country
      if (formData.country === "United States") {
        // US ZIP code: 5 digits or 5+4 format
        if (!/^\d{5}(-\d{4})?$/.test(formData.postalCode)) {
          newErrors.postalCode = "Please enter a valid US ZIP code (e.g., 12345 or 12345-6789)"
        }
      } else {
        // Canadian postal code
        if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(formData.postalCode)) {
      newErrors.postalCode = "Please enter a valid Canadian postal code"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const fetchShippingRates = async (retryCount = 0) => {
    if (!formData.postalCode || !formData.province || !formData.city || !formData.country) {
      return
    }

    setLoadingShipping(true)
    setShippingError(null)

    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')
      
      // Create an AbortController for timeout (with fallback for older browsers)
      let controller = null
      let timeoutId = null
      let isAborted = false
      
      // Check if AbortController is supported
      if (typeof AbortController !== 'undefined') {
        controller = new AbortController()
        timeoutId = setTimeout(() => {
          if (controller) {
            controller.abort()
          }
          isAborted = true
        }, 30000) // 30 second timeout
      } else {
        // Fallback for older browsers: use timeout flag instead
        timeoutId = setTimeout(() => {
          isAborted = true
        }, 30000)
      }
      
      try {
        // Check if fetch is supported, otherwise use XMLHttpRequest fallback for older iOS
        let response
        const requestData = {
          destination: {
            postalCode: formData.postalCode,
            province: formData.province,
            city: formData.city,
            country: formData.country
          },
          cartItems: cartItems
        }
        
        if (typeof fetch !== 'undefined') {
          // Modern browsers: use fetch API
          const fetchOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
          }
          
          // Only add signal if AbortController is supported
          if (controller && controller.signal) {
            fetchOptions.signal = controller.signal
          }
          
          response = await fetch(`${API_URL}/api/get-shipping-rates`, fetchOptions)
          
          // Check if request was aborted (for older browsers)
          if (isAborted) {
            throw new Error('Request timeout')
          }
        } else {
          // Fallback for very old browsers (iOS < 10.3): use XMLHttpRequest
          response = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('POST', `${API_URL}/api/get-shipping-rates`, true)
            xhr.setRequestHeader('Content-Type', 'application/json')
            
            xhr.onload = () => {
              if (isAborted) {
                reject(new Error('Request timeout'))
                return
              }
              
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const parsedData = JSON.parse(xhr.responseText)
                  resolve({
                    ok: true,
                    status: xhr.status,
                    json: async () => parsedData
                  })
                } catch (parseError) {
                  reject(new Error('Failed to parse response'))
                }
              } else {
                let errorMessage = `Failed to get shipping rates (${xhr.status})`
                try {
                  const errorData = JSON.parse(xhr.responseText)
                  if (errorData.error) {
                    errorMessage = errorData.error
                  }
                } catch (e) {
                  // Use default error message
                }
                reject(new Error(errorMessage))
              }
            }
            
            xhr.onerror = () => {
              reject(new Error('Network error'))
            }
            
            xhr.ontimeout = () => {
              reject(new Error('Request timeout'))
            }
            
            xhr.timeout = 30000 // 30 second timeout
            
            try {
              xhr.send(JSON.stringify(requestData))
            } catch (error) {
              reject(error)
            }
          })
        }
        
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Server error: ${response.status}` }))
        throw new Error(errorData.error || `Failed to get shipping rates (${response.status})`)
      }

      const data = await response.json()

      if (!data.options || data.options.length === 0) {
        throw new Error('No shipping options available')
      }

      setShippingOptions(data.options)
      
        // Create address key for matching
        const addressKey = `${formData.postalCode}-${formData.province}-${formData.city}-${formData.country}`
        
        // Save shipping options and address key to localStorage
        try {
          localStorage.setItem('checkoutShippingOptions', JSON.stringify(data.options))
          localStorage.setItem('checkoutAddressKey', addressKey)
          setSavedAddressKey(addressKey)
        } catch (error) {
          console.error('Error saving shipping options:', error)
        }
        
        // Auto-select first option (usually cheapest) or restore previously selected
      if (data.options.length > 0) {
          // Try to restore previously selected shipping option
          try {
            const savedSelected = localStorage.getItem('checkoutShippingOption')
            if (savedSelected) {
              const parsedSelected = JSON.parse(savedSelected)
              // Check if the saved option still exists in the new options
              const matchingOption = data.options.find(opt => 
                opt.id === parsedSelected.id || 
                (opt.name === parsedSelected.name && opt.price === parsedSelected.price)
              )
              if (matchingOption) {
                setSelectedShipping(matchingOption)
                return // Don't auto-select first option if we restored a match
              }
            }
          } catch (error) {
            console.error('Error restoring selected shipping:', error)
          }
          // If no match found, select first option
        setSelectedShipping(data.options[0])
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)
        
        // If it's a timeout and we haven't retried, try once more
        if (fetchError.name === 'AbortError' && retryCount < 1) {
          console.log('Shipping rates request timed out, retrying...')
          return fetchShippingRates(retryCount + 1)
        }
        
        throw fetchError
      }
    } catch (error) {
      console.error('Error fetching shipping rates:', error)
      
      // Handle timeout errors (support both AbortError and timeout messages for older browsers)
      if (error.name === 'AbortError' || error.message.includes('timeout') || error.message === 'Request timeout') {
        setShippingError('Shipping calculation is taking longer than expected. Please try again.')
        // Retry once automatically after a short delay
        if (retryCount === 0) {
          setTimeout(() => {
            fetchShippingRates(1)
          }, 2000)
        }
        return
      }
      
      // Fallback to default shipping options if server is unavailable
      if (error.message.includes('fetch') || error.message.includes('connect') || error.message.includes('Failed to fetch')) {
        // Provide default shipping options
        const defaultOptions = [
          {
            id: 'regular',
            name: language === 'fr' ? 'Colis Régulier' : 'Regular Parcel',
            description: language === 'fr' ? 'Livraison standard au Canada avec suivi' : 'Standard delivery within Canada with tracking',
            price: 12.00,
            estimatedDays: 3
          },
          {
            id: 'expedited',
            name: language === 'fr' ? 'Colis Accéléré' : 'Expedited Parcel',
            description: language === 'fr' ? 'Livraison plus rapide avec suivi et confirmation de signature' : 'Faster delivery with tracking and signature confirmation (guaranteed delivery)',
            price: 18.00,
            estimatedDays: 2
          },
          {
            id: 'xpresspost',
            name: 'Xpresspost',
            description: language === 'fr' ? 'Livraison express avec confirmation de signature et traitement prioritaire' : 'Express delivery with signature confirmation and priority handling (guaranteed, major centers)',
            price: 22.00,
            estimatedDays: 1
          }
        ]
        setShippingOptions(defaultOptions)
        setSelectedShipping(defaultOptions[0])
        // Don't show error, just use defaults silently
      } else {
        setShippingError(error.message || 'Unable to calculate shipping. Please try again.')
      }
    } finally {
      setLoadingShipping(false)
    }
  }


  const calculateShipping = () => {
    // Use selected shipping option price (always in CAD from backend)
    // Note: selectedShipping.price is always in CAD, we'll convert it when displaying
    if (selectedShipping) {
      return selectedShipping.price // This is in CAD
    }
    // Fallback: default estimated shipping (no free shipping)
    return 12.00 // Default estimated shipping in CAD
  }

  // Reset to checkout form if user navigates back from confirmation
  // This effect runs when the component mounts or when currentStep changes
  useEffect(() => {
    // If we're on confirmation but URL doesn't indicate success, reset to checkout
    if (currentStep === 2) {
      const urlParams = new URLSearchParams(window.location.search)
      const success = urlParams.get('success')
      if (!success) {
        // User navigated back - reset to checkout form
        setCurrentStep(1)
      }
    }
  }, []) // Only run on mount - let App.jsx handle all navigation

  // Fetch shipping rates when postal code, province/state, city, and country are filled
  // Only fetch if address changed (don't refetch if we already have rates for this address)
  useEffect(() => {
    if (hasEnteredShippingDetails && formData.postalCode && formData.province && formData.city && formData.country && cartItems.length > 0) {
      const currentAddressKey = `${formData.postalCode}-${formData.province}-${formData.city}-${formData.country}`.toLowerCase()
      
      // Only fetch if address changed (don't refetch if we already have rates for this address)
      if (!savedAddressKey || savedAddressKey.toLowerCase() !== currentAddressKey) {
        // Address changed or no saved address, clear old options and fetch new ones
        if (savedAddressKey && savedAddressKey.toLowerCase() !== currentAddressKey) {
          setShippingOptions([])
          setSelectedShipping(null)
          localStorage.removeItem('checkoutShippingOptions')
          localStorage.removeItem('checkoutShippingOption')
          localStorage.removeItem('checkoutAddressKey')
        }
        
        // Debounce to avoid too many API calls
      const timer = setTimeout(() => {
        fetchShippingRates()
      }, 500) // Debounce
      return () => clearTimeout(timer)
      }
      // If address hasn't changed, keep using saved options (already restored on mount)
    } else if (!hasEnteredShippingDetails) {
      // Clear shipping options if user hasn't entered details yet
      setShippingOptions([])
      setSelectedShipping(null)
    }
  }, [formData.postalCode, formData.province, formData.city, formData.country, cartItems, hasEnteredShippingDetails, savedAddressKey])

  // Recalculate promo code discount when shipping changes
  useEffect(() => {
    if (appliedPromoCode) {
      const result = validatePromoCode(appliedPromoCode)
      if (result.valid) {
        setPromoCodeDiscount(result.discount)
        setPromoCodeType(result.promoType)
      }
    }
  }, [selectedShipping, cartItems, appliedPromoCode])

  // Promo code validation
  const validatePromoCode = (code) => {
    const codeUpper = code.toUpperCase().trim()
    
    // Define valid promo codes
    const validCodes = {
      'FREETEST': { discount: 100, type: 'percent' }, // 100% off for testing
      'TEST100': { discount: 100, type: 'percent' }, // Alternative test code
      'FREESHIP': { type: 'free_shipping' }, // Free shipping
      'FREESHIPPING': { type: 'free_shipping' }, // Free shipping (alternative)
    }
    
    if (validCodes[codeUpper]) {
      const promo = validCodes[codeUpper]
      // Always calculate discount in CAD (all prices are stored in CAD)
      const subtotalCAD = getCartTotal() // Already in CAD
      const shippingCAD = calculateShipping() // Already in CAD
      const tax = 0
      const orderTotalCAD = subtotalCAD + shippingCAD + tax
      
      if (promo.type === 'percent') {
        // Calculate discount in CAD
        const discountAmountCAD = (orderTotalCAD * promo.discount) / 100
        return { valid: true, discount: discountAmountCAD, code: codeUpper, promoType: 'percent' }
      } else if (promo.type === 'free_shipping') {
        // Free shipping - discount equals shipping cost
        const discountAmountCAD = shippingCAD
        return { valid: true, discount: discountAmountCAD, code: codeUpper, promoType: 'free_shipping' }
      }
    }
    
    return { valid: false, discount: 0, code: null, promoType: null }
  }

  const handleApplyPromoCode = () => {
    setPromoCodeError('')
    
    if (!promoCode.trim()) {
      setPromoCodeError(getTranslation(language, 'checkout.promoCode.enterCode'))
      return
    }
    
    const result = validatePromoCode(promoCode)
    
    if (result.valid) {
      setAppliedPromoCode(result.code)
      setPromoCodeDiscount(result.discount)
      setPromoCodeType(result.promoType)
      setPromoCodeError('')
    } else {
      setPromoCodeError(getTranslation(language, 'checkout.promoCode.invalid'))
      setAppliedPromoCode(null)
      setPromoCodeDiscount(0)
      setPromoCodeType(null)
    }
  }

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null)
    setPromoCodeDiscount(0)
    setPromoCodeType(null)
    setPromoCode('')
    setPromoCodeError('')
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form first
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    
    if (!selectedShipping) {
      setShippingError('Please select a shipping method')
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    
    // Track checkout started
    const subtotal = getCartTotal()
    const shippingCAD = calculateShipping() // Shipping is in CAD
    // Zero-rated goods under Schedule VI Part III of the Excise Tax Act
    // Dehydrated citrus products (unsweetened, no preservatives) qualify as zero-rated basic groceries
    const tax = 0 // 0% HST/GST - Products are zero-rated as unsweetened dried fruits
    const totalCAD = subtotal + shippingCAD + tax
    const total = currency === 'USD' ? convertPrice(totalCAD) : totalCAD
    trackCheckoutStarted(cartItems, total)
    
    setIsSubmitting(true)
    setStripeError(null)

    try {
      // Create Stripe Checkout Session (classic Stripe Checkout format)
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')
      let response
      try {
        // Generate order ID BEFORE creating checkout session to ensure consistency
        const orderId = `PP-${Date.now().toString().slice(-8)}`
        
        response = await fetch(`${API_URL}/api/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: cartItems,
            shippingInfo: {
              ...formData,
              selectedShipping: selectedShipping,
              language: language,
              order_id: orderId, // Pass order ID to backend
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            total: getCartTotal(),
            promoCode: appliedPromoCode || null,
            discount: appliedPromoCode ? promoCodeDiscount : 0,
          }),
        })
      } catch (fetchError) {
        throw new Error('NETWORK_ERROR')
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Server error: ${response.status}` }))
        throw new Error(errorData.error || `Failed to create checkout session (${response.status})`)
      }

      const data = await response.json()

      // Redirect to Stripe Checkout using the session URL (classic format)
      if (data.url) {
        console.log('✅ Redirecting to Stripe Checkout:', data.url)
        setIsRedirecting(true)
        // Redirect immediately to Stripe's classic checkout page
          window.location.href = data.url
      } else {
        console.error('❌ No checkout URL in response:', data)
        throw new Error('Checkout session URL not provided by server')
      }
    } catch (error) {
      console.error('Payment error:', error)
      // Provide user-friendly error messages
      const errorMessage = error.message || error.toString() || ''
      const isNetworkError = errorMessage === 'NETWORK_ERROR' ||
                            errorMessage.includes('fetch') || 
                            errorMessage.includes('Failed to fetch') || 
                            errorMessage.includes('NetworkError') || 
                            error.name === 'TypeError' ||
                            errorMessage === 'Failed to fetch'
      
      if (isNetworkError) {
        setStripeError(
          language === 'fr' 
            ? 'Impossible de se connecter au serveur. Veuillez vérifier que le serveur backend est en cours d\'exécution sur le port 3001.'
            : 'Unable to connect to server. Please make sure the backend server is running on port 3001.'
        )
      } else {
        setStripeError(errorMessage || (language === 'fr' ? 'Une erreur s\'est produite. Veuillez réessayer.' : 'An error occurred. Please try again.'))
      }
      setIsSubmitting(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePaymentSuccess = async (sessionId) => {
    try {
      // Verify the payment with the backend
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')
      const response = await fetch(`${API_URL}/api/checkout-session/${sessionId}`)
      const session = await response.json()

      // For free orders, payment_status might be 'no_payment_required' or 'unpaid'
      const isFreeOrder = (session.amount_total || 0) === 0
      const isPaidOrFree = session.payment_status === 'paid' || 
                          (isFreeOrder && (session.payment_status === 'no_payment_required' || session.payment_status === 'unpaid'))
      
      if (isPaidOrFree) {
        // Get order number from metadata (should match what we sent)
        const newOrderNumber = session.metadata?.order_id || `PP-${Date.now().toString().slice(-8)}`
        setOrderNumber(newOrderNumber)
        
        // Get customer info from session
        const customerName = session.metadata?.customer_name || session.customer_details?.name || formData.firstName || 'Customer'
        const customerEmail = session.customer_email || session.customer_details?.email || formData.email || ''
        setCustomerInfo({ name: customerName, email: customerEmail })
        
        // Build order object for tracking
        const orderData = {
          id: newOrderNumber,
          stripeSessionId: sessionId,
          items: session.line_items?.data?.map(item => ({
            id: item.price_data?.product_data?.name || 'unknown',
            name: item.description || item.price_data?.product_data?.name || 'Unknown',
            variant: item.description?.split(' - ')[1] || 'N/A',
            quantity: item.quantity || 1,
            price: (item.price?.unit_amount || 0) / 100
          })) || cartItems.map(item => ({
            id: item.id,
            name: item.name,
            variant: item.variant,
            quantity: item.quantity,
            price: item.price
          })),
          subtotal: (session.amount_subtotal || 0) / 100,
          shippingCost: (session.shipping_cost?.amount_total || 0) / 100,
          tax: (session.total_details?.amount_tax || 0) / 100,
          total: (session.amount_total || 0) / 100,
          currency: session.currency?.toUpperCase() || 'CAD'
        }
        
        // Track purchase event
        trackPurchase(orderData)
        
        setCurrentStep(2) // Confirmation step
        clearCart()
        setIsCartOpen(false)
        
        // Clear saved form data after successful payment
        localStorage.removeItem('checkoutFormData')
        localStorage.removeItem('checkoutShippingOption')
        
        // Clean up URL by removing query parameters
        if (window.location.search) {
          window.history.replaceState({}, '', '/checkout')
        }
        
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      setStripeError(getTranslation(language, 'checkout.paymentVerificationFailed'))
      setIsSubmitting(false)
    }
  }

  const shippingCostCAD = calculateShipping() // Shipping is always in CAD from backend
  const subtotalCAD = getCartTotal() // Already in CAD
  // Zero-rated goods under Schedule VI Part III of the Excise Tax Act
  // Dehydrated citrus products (unsweetened, no preservatives) qualify as zero-rated basic groceries
  // Tax is 0% - Products are zero-rated as unsweetened dried fruits
  const tax = 0
  // Calculate total in CAD first
  // promoCodeDiscount is already in CAD, so subtract it from CAD total before converting
  const totalCAD = hasEnteredShippingDetails && selectedShipping 
    ? Math.max(0, subtotalCAD + shippingCostCAD + tax - promoCodeDiscount)
    : subtotalCAD
  // formatPrice will handle currency conversion automatically, so we always use CAD values

  if (cartItems.length === 0 && currentStep !== 2) {
    return (
      <section className="py-20 px-5 bg-gray-50 min-h-[calc(100vh-72px)]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{getTranslation(language, 'checkout.emptyCart')}</h1>
          <p className="text-gray-600 mb-8">{getTranslation(language, 'checkout.emptyCartDescription')}</p>
          <button
              onClick={() => {
                window.history.pushState({ page: "/" }, "", "/")
                window.dispatchEvent(new Event("hashchange"))
              }}
            className="px-8 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-600 transition-colors"
          >
            {getTranslation(language, 'checkout.continueShopping')}
          </button>
        </div>
      </section>
    )
  }

  // Show page loader when redirecting to Stripe
  if (isRedirecting) {
    return <PageLoader message={getTranslation(language, 'checkout.redirecting')} />
  }

  return (
    <section ref={sectionRef} className="py-0 md:py-0 px-0 bg-gray-900 min-h-[calc(100vh-72px)]">
      <div className="max-w-7xl mx-auto">
        {/* Stripe-style Checkout Layout */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-0">
            {/* Product Showcase - Left Side (Dark Background - Stripe-style) */}
            <div className="order-1 lg:order-1 bg-gray-900 lg:min-h-screen flex flex-col">
              <div className="p-6 lg:p-8 lg:sticky lg:top-0 flex flex-col h-full">
                {/* Back button */}
                <button
                  onClick={() => {
                    window.history.pushState({ page: "/" }, "", "/")
                    window.dispatchEvent(new Event("hashchange"))
                  }}
                  className="flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors min-h-[44px] touch-manipulation active:opacity-70 lg:hidden"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  {getTranslation(language, 'checkout.continueShopping')}
                </button>

                {/* Brand Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-2">Pure Peel Co.</h2>
                  <p className="text-3xl font-bold text-white">
                    {hasEnteredShippingDetails && selectedShipping 
                      ? formatPrice(total) 
                      : (language === 'fr' ? 'Paiement' : 'Payment')
                    }
                    {hasEnteredShippingDetails && selectedShipping && (
                      <span className="text-xl font-normal text-gray-400 ml-1">{currency}</span>
                    )}
                  </p>
                </div>

                {/* Product Images - Centered */}
                <div className="flex-1 flex items-center justify-center my-8">
                  {cartItems.length === 1 ? (
                    <div className="relative w-full max-w-xs">
                      <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
                        <div className="aspect-square bg-white rounded-xl overflow-hidden">
                          <img 
                            src={cartItems[0].image} 
                            alt={cartItems[0].name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                      {cartItems.slice(0, 4).map((item, index) => (
                        <div 
                          key={`${item.id}-${item.variant}`}
                          className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 shadow-xl ${
                            index === 1 ? 'mt-8' : index === 2 ? '-mt-4' : index === 3 ? 'mt-4' : ''
                          }`}
                        >
                          <div className="aspect-square bg-white rounded-lg overflow-hidden">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Promo Code Section */}
                {cartItems.length > 0 && (
                  <div className="mb-6 pt-6 border-t border-gray-700">
                    {!appliedPromoCode ? (
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          {getTranslation(language, 'checkout.promoCode.label')}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => {
                              setPromoCode(e.target.value.toUpperCase())
                              setPromoCodeError('')
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleApplyPromoCode()
                              }
                            }}
                            placeholder={getTranslation(language, 'checkout.promoCode.placeholder')}
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-gray-500"
                          />
                          <button
                            type="button"
                            onClick={handleApplyPromoCode}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap min-h-[40px] touch-manipulation active:scale-95"
                          >
                            {getTranslation(language, 'checkout.promoCode.apply')}
                          </button>
                        </div>
                        {promoCodeError && (
                          <p className="text-red-400 text-xs mt-1">{promoCodeError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <div>
                            <p className="text-sm font-semibold text-green-300">
                              {getTranslation(language, 'checkout.promoCode.applied')}: {appliedPromoCode}
                            </p>
                            <p className="text-xs text-green-400">
                              {getTranslation(language, 'checkout.promoCode.discount')}: {formatPrice(promoCodeDiscount)} <span className="text-gray-400">{currency}</span>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePromoCode}
                          className="text-green-400 hover:text-green-300 text-sm font-medium"
                        >
                          {getTranslation(language, 'checkout.promoCode.remove')}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Summary */}
                <div className="mt-auto space-y-4 pt-8 border-t border-gray-700">
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={`${item.id}-${item.variant}`} className="flex items-center justify-between text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{item.name}</p>
                          <p className="text-gray-400 text-xs">{item.variant} × {item.quantity}</p>
                        </div>
                        <p className="text-white font-semibold ml-4">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t border-gray-700">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{getTranslation(language, 'checkout.subtotal')}</span>
                      <span className="text-white">
                        {formatPrice(subtotalCAD)} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{getTranslation(language, 'checkout.shipping')}</span>
                      <span className="text-white">
                        {!hasEnteredShippingDetails || !selectedShipping 
                          ? (language === 'fr' ? 'À calculer' : 'To be calculated')
                          : (promoCodeType === 'free_shipping' || shippingCostCAD === 0 
                              ? getTranslation(language, 'checkout.free') 
                              : `${formatPrice(shippingCostCAD)} ${currency}`)
                        }
                      </span>
                    </div>
                    {appliedPromoCode && hasEnteredShippingDetails && selectedShipping && promoCodeDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-400">
                        <span>
                          {promoCodeType === 'free_shipping' 
                            ? (language === 'fr' ? 'Expédition gratuite' : 'Free Shipping')
                            : getTranslation(language, 'checkout.promoCode.discount')
                          }
                        </span>
                        <span>-{formatPrice(promoCodeDiscount)} {currency}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-semibold text-white pt-2 border-t border-gray-700">
                      <span>Total</span>
                      <span>
                        {hasEnteredShippingDetails && selectedShipping 
                          ? `${formatPrice(totalCAD)} ${currency}`
                          : (language === 'fr' ? 'À calculer' : 'To be calculated')
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form - Right Side (White Background) */}
            <div className="order-2 lg:order-2 bg-white">
              <div className="p-6 md:p-8 lg:p-12 max-w-2xl mx-auto lg:mx-0">
                {/* Domain header (like Stripe's checkout.stripe.com) */}
                <div className="text-xs text-gray-500 mb-6 hidden lg:block">
                  checkout.purepeelco.com
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  {/* Shipping Information Section */}
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Shipping information</h2>
                    <div className="space-y-4">
                      {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {getTranslation(language, 'checkout.email')}
                      </label>
                        <input
                          type="email"
                          name="email"
                          id="checkout-email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-3.5 py-2.5 text-sm rounded-md border transition-all ${
                            errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                          } focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500`}
                          required
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                  </div>

                  {/* Name */}
                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                      <input
                        type="text"
                        name="firstName"
                        id="checkout-firstName"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                          placeholder={getTranslation(language, 'checkout.firstName')}
                          className={`w-full px-3.5 py-2.5 text-sm rounded-md border transition-all ${
                            errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                          } focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500`}
                        required
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="lastName"
                        id="checkout-lastName"
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                          placeholder={getTranslation(language, 'checkout.lastName')}
                          className={`w-full px-3.5 py-2.5 text-sm rounded-md border transition-all ${
                            errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                          } focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500`}
                        required
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>
                    </div>
                  </div>
                  </div>

                  {/* Shipping Address */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Ship to</label>
                    <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="address"
                      id="checkout-address"
                      autoComplete="street-address"
                      value={formData.address}
                      onChange={handleInputChange}
                          placeholder={getTranslation(language, 'checkout.streetAddress')}
                          className={`w-full px-3.5 py-2.5 text-sm rounded-md border transition-all ${
                            errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                          } focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500`}
                      required
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>

                      <div>
                        <select
                          name="country"
                          id="checkout-country"
                          autoComplete="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className={`w-full px-3.5 py-2.5 text-sm rounded-md border transition-all ${
                            errors.country ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                          } focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500`}
                          required
                        >
                          <option value="Canada">Canada</option>
                          <option value="United States">United States</option>
                        </select>
                        {errors.country && (
                          <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                      <input
                        type="text"
                        name="city"
                        id="checkout-city"
                        autoComplete="address-level2"
                        value={formData.city}
                        onChange={handleInputChange}
                            placeholder={getTranslation(language, 'checkout.city')}
                            className={`w-full px-3.5 py-2.5 text-sm rounded-md border transition-all ${
                              errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                            } focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500`}
                        required
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>
                        <div className="col-span-1">
                      <select
                        name="province"
                        id="checkout-province"
                        autoComplete="address-level1"
                        value={formData.province}
                        onChange={handleInputChange}
                            className={`w-full px-3.5 py-2.5 text-sm rounded-md border transition-all ${
                              errors.province ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                            } focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500`}
                        required
                      >
                            <option value="">
                              {formData.country === "United States" 
                                ? getTranslation(language, 'checkout.selectState')
                                : getTranslation(language, 'checkout.selectProvince')
                              }
                            </option>
                            {(formData.country === "United States" ? usStates : canadianProvinces).map(region => (
                              <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                      {errors.province && (
                        <p className="text-red-500 text-xs mt-1">{errors.province}</p>
                      )}
                    </div>
                        <div className="col-span-1">
                      <input
                        type="text"
                        name="postalCode"
                        id="checkout-postalCode"
                        autoComplete={formData.country === "United States" ? "postal-code" : "postal-code"}
                        value={formData.postalCode}
                        onChange={handleInputChange}
                            placeholder={formData.country === "United States" 
                              ? getTranslation(language, 'checkout.zipCode')
                              : getTranslation(language, 'checkout.postalCode')
                            }
                            className={`w-full px-3.5 py-2.5 text-sm rounded-md border transition-all ${
                              errors.postalCode ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                            } focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500`}
                        required
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>

                      <div>
                        <input
                          type="tel"
                          inputMode="tel"
                          name="phone"
                          id="checkout-phone"
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder={formData.country === "United States" 
                            ? getTranslation(language, 'checkout.phonePlaceholderUS')
                            : getTranslation(language, 'checkout.phonePlaceholder')
                          }
                          className={`w-full px-3.5 py-2.5 text-sm rounded-md border transition-all ${
                            errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                          } focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500`}
                          required
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                      {/* Order Notes - Optional */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {getTranslation(language, 'checkout.orderNotes')}
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3.5 py-2.5 text-sm rounded-md border border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none"
                      placeholder={getTranslation(language, 'checkout.orderNotesPlaceholder')}
                    />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Options - Only show after user enters shipping details */}
                  {hasEnteredShippingDetails && formData.postalCode && formData.province && formData.city && formData.country && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <h2 className="text-base font-semibold text-gray-900 mb-4">
                        {getTranslation(language, 'checkout.shippingMethod')}
                      </h2>
                      
                      {loadingShipping && (
                        <div className="mb-4">
                          <LoadingSpinner size="sm" color="amber" text={getTranslation(language, 'checkout.calculatingShipping')} />
                        </div>
                      )}

                      {shippingError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                          <p className="text-sm text-red-800">{shippingError}</p>
                          <button
                            type="button"
                            onClick={() => fetchShippingRates()}
                            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                          >
                            {language === 'fr' ? 'Réessayer' : 'Try again'}
                          </button>
                        </div>
                      )}

                      {!loadingShipping && shippingOptions.length > 0 && (
                        <div className="space-y-2.5">
                          {shippingOptions.map((option) => (
                            <label
                              key={option.id}
                              className={`flex items-center gap-3 p-3.5 border rounded-md cursor-pointer transition-all touch-manipulation min-h-[56px] ${
                                selectedShipping?.id === option.id
                                  ? 'border-amber-500 bg-amber-50/50'
                                  : 'border-gray-200 bg-white hover:border-gray-300 active:bg-gray-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="shipping"
                                value={option.id}
                                checked={selectedShipping?.id === option.id}
                                onChange={() => setSelectedShipping(option)}
                                className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm text-gray-900">{option.name}</span>
                                  <span className="font-semibold text-sm text-gray-900">
                                    {formatPrice(option.price)} <span className="text-xs font-normal text-gray-500">{currency}</span>
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {(() => {
                                    // Map shipping option names to translation keys
                                    const timeMap = {
                                      'Regular Parcel': getTranslation(language, 'shipping.shippingInfo.methods.regular.time'),
                                      'Expedited Parcel': getTranslation(language, 'shipping.shippingInfo.methods.expedited.time'),
                                      'Xpresspost': getTranslation(language, 'shipping.shippingInfo.methods.xpresspost.time'),
                                      'Colis Régulier': getTranslation(language, 'shipping.shippingInfo.methods.regular.time'),
                                      'Colis Accéléré': getTranslation(language, 'shipping.shippingInfo.methods.expedited.time'),
                                      'Tracked Packet - USA': '4-7 business days',
                                      'Xpresspost - USA': '2-3 business days',
                                      'Priority Worldwide - USA': '1-2 business days'
                                    }
                                    return timeMap[option.name] || `${option.estimatedDays} ${getTranslation(language, 'checkout.businessDays')}`
                                  })()}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {!loadingShipping && shippingOptions.length === 0 && !shippingError && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                          <p className="text-sm text-yellow-800 mb-2">
                            {language === 'fr' 
                              ? 'Aucune option d\'expédition disponible. Cliquez pour calculer les tarifs.'
                              : 'No shipping options available. Click to calculate rates.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              console.log('Manual shipping fetch triggered', {
                                postalCode: formData.postalCode,
                                province: formData.province,
                                city: formData.city,
                                country: formData.country,
                                hasEnteredShippingDetails
                              })
                              fetchShippingRates()
                            }}
                            className="text-sm text-yellow-600 hover:text-yellow-800 underline font-medium"
                          >
                            {language === 'fr' ? 'Calculer les tarifs d\'expédition' : 'Calculate shipping rates'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Method Section */}
                  {hasEnteredShippingDetails && selectedShipping && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                      <h2 className="text-base font-semibold text-gray-900 mb-4">Payment method</h2>
                      
                      <div className="space-y-3 mb-6">
                        {/* Card Payment - Primary */}
                        <label className="flex items-center gap-3 p-4 border-2 border-amber-500 bg-amber-50/50 rounded-lg cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            defaultChecked
                            className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                          />
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <span className="flex-1 font-medium text-gray-900">Card</span>
                          <div className="flex items-center gap-1">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%231A1F71' d='M23 4H1a1 1 0 00-1 1v14a1 1 0 001 1h22a1 1 0 001-1V5a1 1 0 00-1-1z'/%3E%3C/svg%3E" alt="Visa" className="w-8 h-5 object-contain" />
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23EB001B' d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 1c6.075 0 11 4.925 11 11s-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1z'/%3E%3C/svg%3E" alt="Mastercard" className="w-8 h-5 object-contain" />
                            <span className="text-xs text-gray-500">+ more</span>
                          </div>
                        </label>

                        {/* Bank Transfer */}
                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 bg-white rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bank"
                            className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                          />
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <span className="flex-1 font-medium text-gray-900">Bank transfer</span>
                        </label>

                        {/* Apple Pay (if available) */}
                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 bg-white rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="apple_pay"
                            className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                          />
                          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                            </svg>
                          </div>
                          <span className="flex-1 font-medium text-gray-900">Apple Pay</span>
                        </label>
                      </div>

                    {stripeError && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                        <p className="text-sm text-red-800">{stripeError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !hasEnteredShippingDetails || !selectedShipping}
                        className="w-full py-4 px-6 text-base font-semibold rounded-lg border-0 cursor-pointer transition-all duration-200 bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[52px] touch-manipulation shadow-md hover:shadow-lg"
                    >
                      {isSubmitting ? (
                        <LoadingSpinner size="sm" color="white" text={getTranslation(language, 'checkout.processing')} />
                      ) : (
                          <>Pay {formatPrice(total)} {currency}</>
                      )}
                    </button>

                      <p className="text-xs text-gray-400 text-center mt-6 flex items-center justify-center gap-1.5">
                        <span>Powered by</span>
                        <span className="font-semibold text-gray-500">stripe</span>
                        <span className="mx-1.5">·</span>
                        <a href="/terms" className="hover:underline text-gray-500">Terms</a>
                        <span className="mx-1">·</span>
                        <a href="/privacy" className="hover:underline text-gray-500">Privacy</a>
                    </p>
                  </div>
                  )}
                </form>
              </div>
            </div>
                </div>
        )}
          </div>
        )}

        {/* Step 2: Confirmation */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{getTranslation(language, 'checkout.orderConfirmed')}</h1>
              <p className="text-gray-600 mb-6">
                {getTranslation(language, 'checkout.thankYou')}{customerInfo.name ? `, ${customerInfo.name.split(' ')[0]}` : ''}!
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-600 mb-2">{getTranslation(language, 'checkout.orderNumber')}</p>
                <p className="text-2xl font-bold text-gray-900">{orderNumber}</p>
              </div>
              <p className="text-gray-600 mb-8">
                {customerInfo.email ? (
                  <>{getTranslation(language, 'checkout.confirmationEmail')} <strong>{customerInfo.email}</strong> {getTranslation(language, 'checkout.confirmationEmailSuffix')}</>
                ) : (
                  <>{getTranslation(language, 'checkout.confirmationEmailNoEmail')}</>
                )}
              </p>
              <button
              onClick={() => {
                window.history.pushState({ page: "/" }, "", "/")
                window.dispatchEvent(new Event("hashchange"))
              }}
                className="px-8 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-600 transition-colors"
              >
                {getTranslation(language, 'checkout.continueShopping')}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

