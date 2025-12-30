import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"
import { useScrollReveal } from "../hooks/useScrollReveal"
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

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart, setIsCartOpen } = useCart()
  const [currentStep, setCurrentStep] = useState(1) // 1: Shipping, 2: Payment, 3: Confirmation
  
  // Track step changes
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Checkout.jsx:19',message:'Step changed',data:{currentStep,pathname:window.location.pathname,search:window.location.search,historyLength:window.history.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
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
      fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Checkout.jsx:55',message:'Payment canceled - restoring step 2',data:{historyLength:window.history.length,pathname:window.location.pathname,search:window.location.search},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // Payment was canceled - restore form data and return to step 2 (payment step)
      setCurrentStep(2)
      setStripeError('Payment was canceled. Your information has been saved. You can try again when ready.')
      // Replace current history entry (from Stripe redirect) with checkout step 2
      // This ensures back button goes: Stripe → Step 2 → Step 1 → Previous page
      window.history.replaceState({ step: 2 }, '', '/checkout?step=2')
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Checkout.jsx:64',message:'After replaceState on cancel',data:{historyLength:window.history.length,pathname:window.location.pathname,search:window.location.search},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
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
      province: "",
      postalCode: "",
      notes: ""
    }
  }

  const [formData, setFormData] = useState(loadSavedFormData)

  const [errors, setErrors] = useState({})

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
    if (!formData.province) newErrors.province = "Province is required"
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required"
    } else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(formData.postalCode)) {
      newErrors.postalCode = "Please enter a valid Canadian postal code"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const fetchShippingRates = async () => {
    if (!formData.postalCode || !formData.province || !formData.city) {
      return
    }

    setLoadingShipping(true)
    setShippingError(null)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/api/get-shipping-rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: {
            postalCode: formData.postalCode,
            province: formData.province,
            city: formData.city
          },
          cartItems: cartItems
        }),
      })

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
    } catch (error) {
      console.error('Error fetching shipping rates:', error)
      // Show more helpful error message
      if (error.message.includes('fetch')) {
        setShippingError('Cannot connect to server. Make sure the backend is running on port 3001.')
      } else {
        setShippingError(error.message || 'Unable to calculate shipping. Please try again.')
      }
    } finally {
      setLoadingShipping(false)
    }
  }

  const calculateShipping = () => {
    // Use selected shipping option price, or default to estimated rate
    if (selectedShipping) {
      return selectedShipping.price
    }
    // Fallback: default estimated shipping (no free shipping)
    return 12.00 // Default estimated shipping
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      if (!selectedShipping) {
        setShippingError('Please select a shipping method')
        return
      }
      // Track checkout started
      const subtotal = getCartTotal()
      const shipping = calculateShipping()
      const tax = subtotal * 0.13
      const total = subtotal + shipping + tax
      trackCheckoutStarted(cartItems, total)
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Checkout.jsx:241',message:'Moving to step 2',data:{historyLength:window.history.length,pathname:window.location.pathname,search:window.location.search},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setCurrentStep(2)
      // Add history entry for step 2 so back button works
      window.history.pushState({ step: 2 }, '', '/checkout?step=2')
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Handle back button click on step 2
  const handleBackToShipping = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Checkout.jsx:248',message:'Back button clicked - step 2 to step 1',data:{historyLength:window.history.length,pathname:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Use browser back to go to previous history entry (step 1)
    window.history.back()
  }
  
  // Handle browser back/forward navigation within checkout
  useEffect(() => {
    const handlePopState = (e) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Checkout.jsx:256',message:'Browser popstate in checkout',data:{pathname:window.location.pathname,search:window.location.search,historyLength:window.history.length,currentStep},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      // Only handle if we're still on checkout page
      if (window.location.pathname === '/checkout') {
        const urlParams = new URLSearchParams(window.location.search)
        const stepParam = urlParams.get('step')
        // Update step based on URL
        if (stepParam === '2') {
          setCurrentStep(2)
        } else {
          setCurrentStep(1)
        }
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [currentStep])

  // Fetch shipping rates when postal code, province, and city are filled
  useEffect(() => {
    if (formData.postalCode && formData.province && formData.city && cartItems.length > 0) {
      const timer = setTimeout(() => {
        fetchShippingRates()
      }, 500) // Debounce
      return () => clearTimeout(timer)
    }
  }, [formData.postalCode, formData.province, formData.city, cartItems])

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStripeError(null)

    try {
      // Create Stripe Checkout Session
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          shippingInfo: {
            ...formData,
            selectedShipping: selectedShipping
          },
          total: getCartTotal(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout using the session URL
      if (data.url) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Checkout.jsx:318',message:'Before Stripe redirect',data:{historyLength:window.history.length,pathname:window.location.pathname,search:window.location.search,hasStep2:window.location.search.includes('step=2')},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        setIsRedirecting(true)
        // Ensure step 2 is in URL before redirecting (replaceState to avoid extra history entry)
        if (window.location.pathname === '/checkout' && !window.location.search.includes('step=2')) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Checkout.jsx:325',message:'Replacing state before Stripe',data:{historyLength:window.history.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          window.history.replaceState({ step: 2 }, '', '/checkout?step=2')
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Checkout.jsx:330',message:'About to redirect to Stripe',data:{historyLength:window.history.length,pathname:window.location.pathname,search:window.location.search},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        // Small delay to show loading state
        setTimeout(() => {
          window.location.href = data.url
        }, 300)
      } else {
        throw new Error('Checkout session URL not provided by server')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setStripeError(error.message || 'An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = async (sessionId) => {
    try {
      // Verify the payment with the backend
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
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
        
        setCurrentStep(3)
        clearCart()
        setIsCartOpen(false)
        
        // Clear saved form data after successful payment
        localStorage.removeItem('checkoutFormData')
        localStorage.removeItem('checkoutShippingOption')
        
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      setStripeError('Payment verification failed. Please contact support.')
      setIsSubmitting(false)
    }
  }

  const shippingCost = calculateShipping()
  const subtotal = getCartTotal()
  const tax = subtotal * 0.13 // 13% HST for Ontario (can be made dynamic)
  const total = subtotal + shippingCost + tax

  if (cartItems.length === 0 && currentStep !== 3) {
    return (
      <section className="py-20 px-5 bg-gray-50 min-h-[calc(100vh-72px)]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
          <button
            onClick={() => {
              window.history.pushState({}, "", "/")
              window.dispatchEvent(new PopStateEvent("popstate"))
            }}
            className="px-8 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </section>
    )
  }

  // Show page loader when redirecting to Stripe
  if (isRedirecting) {
    return <PageLoader message="Redirecting to secure payment..." />
  }

  return (
    <section ref={sectionRef} className="py-12 px-5 bg-gray-50 min-h-[calc(100vh-72px)]">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        {currentStep !== 3 && (
          <div className="mb-10">
            <div className="flex items-center justify-center gap-4">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 ${step <= currentStep ? 'text-amber-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 transition-all ${
                      step < currentStep 
                        ? 'bg-amber-600 border-amber-600 text-white' 
                        : step === currentStep
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {step < currentStep ? '✓' : step}
                    </div>
                    <span className="font-medium hidden sm:inline">
                      {step === 1 ? 'Shipping' : 'Payment'}
                    </span>
                  </div>
                  {step < 2 && (
                    <div className={`w-16 h-0.5 ${step < currentStep ? 'bg-amber-600' : 'bg-gray-300'}`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Shipping Information */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                <form onSubmit={handleShippingSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3.5 text-base rounded-lg border ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                        required
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3.5 text-base rounded-lg border ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                        required
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3.5 text-base rounded-lg border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                      className={`w-full px-4 py-3.5 text-base rounded-lg border ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                      required
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                        className={`w-full px-4 py-3.5 text-base rounded-lg border ${
                          errors.address ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                      required
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3.5 text-base rounded-lg border ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                        required
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Province *
                      </label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3.5 text-base rounded-lg border ${
                          errors.province ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                        required
                      >
                        <option value="">Select Province</option>
                        {canadianProvinces.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                      {errors.province && (
                        <p className="text-red-500 text-sm mt-1">{errors.province}</p>
                      )}
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="A1A 1A1"
                        className={`w-full px-4 py-3.5 text-base rounded-lg border ${
                          errors.postalCode ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent uppercase`}
                        required
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3.5 text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Special delivery instructions or notes..."
                    />
                  </div>

                  {/* Shipping Options */}
                  {formData.postalCode && formData.province && formData.city && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Shipping Method *
                      </label>
                      
                      {loadingShipping && (
                        <div className="space-y-3 mb-4">
                          <LoadingSpinner size="md" color="amber" text="Calculating shipping rates..." />
                          {/* Skeleton for shipping options */}
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="border-2 border-gray-200 rounded-lg p-4">
                              <div className="flex items-start gap-4">
                                <Skeleton type="button" width="16px" height="16px" className="mt-1" />
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Skeleton type="text" width="40%" height="20px" />
                                    <Skeleton type="text" width="20%" height="20px" />
                                  </div>
                                  <Skeleton type="text" width="60%" height="16px" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {shippingError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-red-800">{shippingError}</p>
                        </div>
                      )}

                      {!loadingShipping && shippingOptions.length > 0 && (
                        <div className="space-y-3">
                          {shippingOptions.map((option) => (
                            <label
                              key={option.id}
                              className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedShipping?.id === option.id
                                  ? 'border-amber-500 bg-amber-50'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="shipping"
                                value={option.id}
                                checked={selectedShipping?.id === option.id}
                                onChange={() => setSelectedShipping(option)}
                                className="mt-1 w-4 h-4 text-amber-500 focus:ring-amber-500"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-gray-900">{option.name}</span>
                                  <span className="font-bold text-gray-900">${option.price.toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-gray-600">{option.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Estimated delivery: {option.estimatedDays} business days
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {!loadingShipping && shippingOptions.length === 0 && !shippingError && (
                        <p className="text-sm text-gray-500">Enter your address above to see shipping options</p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedShipping && shippingOptions.length > 0}
                    className="w-full py-4 px-6 text-base font-bold rounded-xl border-0 cursor-pointer transition-all duration-300 uppercase tracking-wide font-sans bg-linear-to-br from-amber-500 to-amber-600 text-black shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:from-amber-400 hover:to-amber-500 hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(245,158,11,0.5)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 lg:sticky lg:top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.variant}`} className="flex gap-3 pb-4 border-b border-gray-200 last:border-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.variant}</p>
                        <p className="text-sm text-gray-900 mt-1">
                          Qty: {item.quantity} × ${item.price}.00
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900 font-medium">
                      {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (HST)</span>
                    <span className="text-gray-900 font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${total.toFixed(2)} CAD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                {/* Back Button */}
                <button
                  onClick={handleBackToShipping}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200 group"
                  type="button"
                >
                  <svg 
                    className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Back to Shipping Information</span>
                </button>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>
                
                {stripeError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800">{stripeError}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>Secure Payment:</strong> You'll be redirected to Stripe's secure payment page to complete your purchase. Your payment information is never stored on our servers.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Secure Payment Processing</p>
                      <p className="text-xs text-gray-600">Powered by Stripe</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 text-base font-bold rounded-xl border-0 cursor-pointer transition-all duration-300 uppercase tracking-wide font-sans bg-linear-to-br from-amber-500 to-amber-600 text-black shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:from-amber-400 hover:to-amber-500 hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(245,158,11,0.5)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="md" color="black" text="Processing..." />
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Pay ${total.toFixed(2)} CAD Securely
                      </>
                    )}
                  </button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By proceeding, you agree to our terms of service and privacy policy
                </p>
              </div>
            </div>

            {/* Order Summary (same as step 1) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.variant}`} className="flex gap-3 pb-4 border-b border-gray-200 last:border-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.variant}</p>
                        <p className="text-sm text-gray-900 mt-1">
                          Qty: {item.quantity} × ${item.price}.00
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900 font-medium">
                      {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (HST)</span>
                    <span className="text-gray-900 font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${total.toFixed(2)} CAD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your order{customerInfo.name ? `, ${customerInfo.name.split(' ')[0]}` : ''}!
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-600 mb-2">Order Number</p>
                <p className="text-2xl font-bold text-gray-900">{orderNumber}</p>
              </div>
              <p className="text-gray-600 mb-8">
                {customerInfo.email ? (
                  <>We've sent a confirmation email to <strong>{customerInfo.email}</strong> with your order details. You'll receive another email when your order ships.</>
                ) : (
                  <>We've sent a confirmation email with your order details. You'll receive another email when your order ships.</>
                )}
              </p>
              <button
                onClick={() => {
                  window.history.pushState({}, "", "/")
                  window.dispatchEvent(new PopStateEvent("popstate"))
                }}
                className="px-8 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-600 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

