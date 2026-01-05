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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Checkout.jsx:19',message:'Step changed to confirmation',data:{currentStep,pathname:window.location.pathname,search:window.location.search,historyLength:window.history.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
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
  
  // Check for Stripe redirect
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Checkout.jsx:30',message:'Stripe redirect check',data:{pathname:window.location.pathname,search:window.location.search,historyLength:window.history.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const canceled = urlParams.get('canceled')
    const sessionId = urlParams.get('session_id')

    if (success === 'true' && sessionId) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Checkout.jsx:36',message:'Payment success detected',data:{sessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // Payment was successful - clear saved form data
      localStorage.removeItem('checkoutFormData')
      localStorage.removeItem('checkoutShippingOption')
      handlePaymentSuccess(sessionId)
    } else if (canceled === 'true') {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Checkout.jsx:55',message:'Payment canceled - restoring checkout',data:{historyLength:window.history.length,pathname:window.location.pathname,search:window.location.search},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // Payment was canceled - restore form data and return to checkout
      setCurrentStep(1)
      setStripeError('Payment was canceled. Your information has been saved. You can try again when ready.')
      // Clean up URL by removing query parameters
      if (window.location.search) {
        window.history.replaceState({}, '', '/checkout')
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

  // Clear shipping options on initial load
  useEffect(() => {
    setShippingOptions([])
    setSelectedShipping(null)
    setHasEnteredShippingDetails(false)
  }, [])

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

  // Load saved shipping option from localStorage
  useEffect(() => {
    try {
      const savedShipping = localStorage.getItem('checkoutShippingOption')
      if (savedShipping) {
        setSelectedShipping(JSON.parse(savedShipping))
      }
    } catch (error) {
      console.error('Error loading saved shipping option:', error)
    }
  }, [])

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
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
    // Track when user enters shipping details
    if (name === 'postalCode' || name === 'province' || name === 'city' || name === 'country') {
      if (value && !hasEnteredShippingDetails) {
        setHasEnteredShippingDetails(true)
      }
      // Clear province/state and postal code when country changes
      if (name === 'country') {
        setFormData(prev => ({ ...prev, province: '', postalCode: '' }))
        setShippingOptions([])
        setSelectedShipping(null)
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
      
      // Create an AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout (increased for Canada Post API)
      
      try {
        const response = await fetch(`${API_URL}/api/get-shipping-rates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destination: {
              postalCode: formData.postalCode,
              province: formData.province,
              city: formData.city,
              country: formData.country
            },
            cartItems: cartItems
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `Server error: ${response.status}` }))
          throw new Error(errorData.error || `Failed to get shipping rates (${response.status})`)
        }

        const data = await response.json()

        if (!data.options || data.options.length === 0) {
          throw new Error('No shipping options available')
        }

        setShippingOptions(data.options)
        
        // Auto-select first option (usually cheapest)
        if (data.options.length > 0) {
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
      
      // Handle timeout errors
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
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
            description: language === 'fr' ? '5-7 jours ouvrables' : '5-7 business days',
            price: 12.00,
            estimatedDays: 6
          },
          {
            id: 'expedited',
            name: language === 'fr' ? 'Colis Accéléré' : 'Expedited Parcel',
            description: language === 'fr' ? '3-5 jours ouvrables' : '3-5 business days',
            price: 18.00,
            estimatedDays: 4
          },
          {
            id: 'xpresspost',
            name: 'Xpresspost',
            description: language === 'fr' ? '2-3 jours ouvrables' : '2-3 business days',
            price: 25.00,
            estimatedDays: 2
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

  // Promo code validation
  const validatePromoCode = (code) => {
    const codeUpper = code.toUpperCase().trim()
    
    // Define valid promo codes
    const validCodes = {
      'FREETEST': { discount: 100, type: 'percent' }, // 100% off for testing
      'TEST100': { discount: 100, type: 'percent' }, // Alternative test code
      'WELCOME10': { discount: 10, type: 'percent' }, // Example: 10% off
      'SAVE20': { discount: 20, type: 'percent' }, // Example: 20% off
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
        return { valid: true, discount: discountAmountCAD, code: codeUpper }
      }
    }
    
    return { valid: false, discount: 0, code: null }
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
      setPromoCodeError('')
      // Clear the input but keep the applied code visible
    } else {
      setPromoCodeError(getTranslation(language, 'checkout.promoCode.invalid'))
      setAppliedPromoCode(null)
      setPromoCodeDiscount(0)
    }
  }

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null)
    setPromoCodeDiscount(0)
    setPromoCode('')
    setPromoCodeError('')
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
  // Only fetch if user has actively entered shipping details (not on initial load)
  useEffect(() => {
    if (hasEnteredShippingDetails && formData.postalCode && formData.province && formData.city && formData.country && cartItems.length > 0) {
      const timer = setTimeout(() => {
        fetchShippingRates()
      }, 500) // Debounce
      return () => clearTimeout(timer)
    } else if (!hasEnteredShippingDetails) {
      // Clear shipping options if user hasn't entered details yet
      setShippingOptions([])
      setSelectedShipping(null)
    }
  }, [formData.postalCode, formData.province, formData.city, formData.country, cartItems, hasEnteredShippingDetails])

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
      // Create Stripe Checkout Session
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')
      let response
      try {
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
              language: language // Include language preference for email translations
            },
            total: getCartTotal(),
            promoCode: appliedPromoCode || null,
            discount: appliedPromoCode ? promoCodeDiscount : 0, // Always send CAD discount amount
          }),
        })
      } catch (fetchError) {
        // Catch network errors (server not running, CORS, etc.)
        throw new Error('NETWORK_ERROR')
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Server error: ${response.status}` }))
        throw new Error(errorData.error || `Failed to create checkout session (${response.status})`)
      }

      const data = await response.json()

      // Redirect to Stripe Checkout using the session URL
      if (data.url) {
        setIsRedirecting(true)
        // Small delay to show loading state
        setTimeout(() => {
          window.location.href = data.url
        }, 300)
      } else {
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

      if (session.payment_status === 'paid') {
        // Get order number from saved order or generate one
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
  const subtotal = getCartTotal()
  // Zero-rated goods under Schedule VI Part III of the Excise Tax Act
  // Dehydrated citrus products (unsweetened, no preservatives) qualify as zero-rated basic groceries
  // Tax is 0% - Products are zero-rated as unsweetened dried fruits
  const tax = 0
  // Promo code discount is always stored in CAD - formatPrice will handle conversion
  // Calculate total - formatPrice will handle currency conversion, so use CAD prices for calculation
  const totalCAD = hasEnteredShippingDetails && selectedShipping 
    ? Math.max(0, subtotal + shippingCostCAD + tax - promoCodeDiscount) 
    : subtotal
  const total = currency === 'USD' ? convertPrice(totalCAD) : totalCAD

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
    <section ref={sectionRef} className="py-12 px-5 bg-gradient-to-b from-gray-50 to-gray-100 min-h-[calc(100vh-72px)]">
      <div className="max-w-6xl mx-auto">
        {/* Combined Checkout: Shipping + Payment */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form (Shipping + Payment) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{getTranslation(language, 'checkout.shippingInformation')}</h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {getTranslation(language, 'checkout.firstName')} *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-sm rounded-lg border transition-colors ${
                          errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                        required
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {getTranslation(language, 'checkout.lastName')} *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-sm rounded-lg border transition-colors ${
                          errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                        required
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {getTranslation(language, 'checkout.email')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 text-sm rounded-lg border transition-colors ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {getTranslation(language, 'checkout.phoneNumber')} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={getTranslation(language, 'checkout.phonePlaceholder')}
                      className={`w-full px-4 py-3 text-sm rounded-lg border transition-colors ${
                        errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                      required
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {getTranslation(language, 'checkout.streetAddress')} *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-sm rounded-lg border transition-colors ${
                          errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                      required
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {getTranslation(language, 'checkout.country')} *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 text-sm rounded-lg border transition-colors ${
                        errors.country ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                      required
                    >
                      <option value="Canada">Canada</option>
                      <option value="United States">United States</option>
                    </select>
                    {errors.country && (
                      <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {getTranslation(language, 'checkout.city')} *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-sm rounded-lg border transition-colors ${
                          errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
                        required
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {formData.country === "United States" 
                          ? getTranslation(language, 'checkout.state') 
                          : getTranslation(language, 'checkout.province')
                        } *
                      </label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-sm rounded-lg border transition-colors ${
                          errors.province ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500`}
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
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {formData.country === "United States" 
                          ? getTranslation(language, 'checkout.zipCode')
                          : getTranslation(language, 'checkout.postalCode')
                        } *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder={formData.country === "United States" 
                          ? getTranslation(language, 'checkout.zipCodePlaceholder')
                          : getTranslation(language, 'checkout.postalCodePlaceholder')
                        }
                        className={`w-full px-4 py-3 text-sm rounded-lg border transition-colors ${
                          errors.postalCode ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${formData.country === "Canada" ? 'uppercase' : ''}`}
                        required
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {getTranslation(language, 'checkout.orderNotes')}
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 text-sm rounded-lg border border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors resize-none"
                      placeholder={getTranslation(language, 'checkout.orderNotesPlaceholder')}
                    />
                  </div>

                  {/* Shipping Options - Only show after user enters shipping details */}
                  {hasEnteredShippingDetails && formData.postalCode && formData.province && formData.city && formData.country && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-100">
                      <label className="block text-base font-semibold text-gray-900 mb-4">
                        {getTranslation(language, 'checkout.shippingMethod')} *
                      </label>
                      
                      {loadingShipping && (
                        <div className="mb-3">
                          <LoadingSpinner size="sm" color="amber" text={getTranslation(language, 'checkout.calculatingShipping')} />
                        </div>
                      )}

                      {shippingError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3">
                          <p className="text-xs text-red-800">{shippingError}</p>
                        </div>
                      )}

                      {!loadingShipping && shippingOptions.length > 0 && (
                        <div className="space-y-3">
                          {shippingOptions.map((option) => (
                            <label
                              key={option.id}
                              className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                selectedShipping?.id === option.id
                                  ? 'border-amber-500 bg-amber-50 shadow-sm'
                                  : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/30'
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
                                    {formatPrice(option.price)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {option.estimatedDays} {getTranslation(language, 'checkout.businessDays')}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {!loadingShipping && shippingOptions.length === 0 && !shippingError && (
                        <p className="text-xs text-gray-500">{getTranslation(language, 'checkout.enterAddress')}</p>
                      )}
                    </div>
                  )}

                  {/* Payment Section */}
                  <div className="mt-8 pt-8 border-t-2 border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{getTranslation(language, 'checkout.paymentInformation')}</h3>
                    
                    {stripeError && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-5">
                        <p className="text-sm text-red-800 font-medium">{stripeError}</p>
                      </div>
                    )}

                    <div className="mb-6">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {getTranslation(language, 'checkout.securePaymentText')}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !hasEnteredShippingDetails || !selectedShipping}
                      className="w-full py-4 px-6 text-base font-semibold rounded-xl border-0 cursor-pointer transition-all duration-200 bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2 min-h-[56px] shadow-md"
                    >
                      {isSubmitting ? (
                        <LoadingSpinner size="sm" color="white" text={getTranslation(language, 'checkout.processing')} />
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          {hasEnteredShippingDetails && selectedShipping 
                            ? `${getTranslation(language, 'checkout.paySecurely')} ${formatPrice(total)} ${currency}`
                            : (language === 'fr' ? 'Entrez les détails d\'expédition' : 'Enter shipping details')
                          }
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-3">
                      {getTranslation(language, 'checkout.termsAgreement')}
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:sticky lg:top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{getTranslation(language, 'checkout.orderSummary')}</h3>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.variant}`} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0 shadow-sm border border-gray-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-sm font-semibold text-gray-900 truncate mb-1">{item.name}</p>
                        <p className="text-xs text-gray-500 mb-1.5">{item.variant}</p>
                        <p className="text-sm text-gray-700 font-medium">
                          {getTranslation(language, 'checkout.qty')} {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 pt-5 border-t-2 border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">{getTranslation(language, 'checkout.subtotal')}</span>
                    <span className="text-gray-900 font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">{getTranslation(language, 'checkout.shipping')}</span>
                    <span className="text-gray-900 font-semibold">
                      {!hasEnteredShippingDetails || !selectedShipping 
                        ? (language === 'fr' ? 'À calculer' : 'To be calculated')
                        : (shippingCostCAD === 0 ? getTranslation(language, 'checkout.free') : formatPrice(shippingCostCAD))
                      }
                    </span>
                  </div>
                  {/* Tax line - Products are zero-rated under Schedule VI Part III */}
                  {hasEnteredShippingDetails && selectedShipping && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">{getTranslation(language, 'checkout.taxHST')}</span>
                      <span className="text-gray-900 font-semibold">{formatPrice(tax)}</span>
                    </div>
                  )}
                  {/* Discount line */}
                  {appliedPromoCode && hasEnteredShippingDetails && selectedShipping && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span className="font-medium">{getTranslation(language, 'checkout.promoCode.discount')}</span>
                      <span className="font-semibold">-{formatPrice(promoCodeDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xl font-bold pt-4 border-t-2 border-gray-200 mt-4">
                    <span className="text-gray-900">{getTranslation(language, 'checkout.total')}</span>
                    <span className="text-gray-900">
                      {hasEnteredShippingDetails && selectedShipping 
                        ? `${formatPrice(total)} ${currency}`
                        : (language === 'fr' ? 'À calculer' : 'To be calculated')
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
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

