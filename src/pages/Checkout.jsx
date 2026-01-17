import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { useCurrency } from "../context/CurrencyContext"
import { getTranslation, translateVariantLabel } from "../utils/translations"
import { trackCheckoutStarted, trackPurchase } from "../utils/analytics"
import LoadingSpinner from "../components/LoadingSpinner"
import Skeleton from "../components/Skeleton"
import PageLoader from "../components/PageLoader"
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import stripePromise from '../config/stripe'

// Payment Form Component using Stripe Payment Element (single column, no left panel)
function PaymentForm({ clientSecret, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const { language } = useLanguage()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message)
      setIsProcessing(false)
      return
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?success=true`,
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message)
      setIsProcessing(false)
    } else {
      // Payment succeeded
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="payment-element-wrapper">
        <PaymentElement 
          options={{
            // Layout: tabs for better organization
            layout: 'tabs',
            
            // Enable wallets (Apple Pay, Google Pay, Link)
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
              link: 'auto',
            },
            
            // Configure billing details collection
            // We already collect shipping address, so minimize billing collection
            fields: {
              billingDetails: {
                name: 'never', // Already collected in shipping form
                email: 'never', // Already collected in contact section
                phone: 'never', // Already collected in shipping form
                address: {
                  country: 'never', // Already collected in shipping form
                  line1: 'never', // Already collected in shipping form
                  line2: 'never', // Already collected in shipping form
                  city: 'never', // Already collected in shipping form
                  state: 'never', // Already collected in shipping form
                  postalCode: 'never', // Already collected in shipping form
                },
              },
            },
            
            // Enable saved payment methods for returning customers
            // Stripe automatically handles consent collection for compliance
            paymentMethodTypes: ['card', 'link'],
            
            // CVC recollection: require CVC for saved cards (security best practice)
            // This is handled automatically by Stripe based on risk assessment
          }}
        />
      </div>
      {error && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#dc2626] flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#dc2626] mb-1.5">
                {language === 'fr' ? 'Erreur de paiement' : 'Payment Error'}
              </p>
              <p className="text-sm text-[#991b1b] leading-relaxed mb-2">{error}</p>
              <div className="text-xs text-[#991b1b] bg-[#fee2e2] rounded p-2 mt-2">
                <p className="font-medium mb-1">
                  {language === 'fr' ? 'Conseils pour résoudre le problème :' : 'Tips to resolve:'}
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>{language === 'fr' ? 'Vérifiez que tous les champs sont correctement remplis' : 'Verify all fields are correctly filled'}</li>
                  <li>{language === 'fr' ? 'Assurez-vous que votre carte n\'est pas expirée' : 'Ensure your card is not expired'}</li>
                  <li>{language === 'fr' ? 'Vérifiez que vous avez suffisamment de fonds' : 'Check you have sufficient funds'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-3.5 px-4 text-sm font-semibold rounded-lg border-0 cursor-pointer transition-all duration-200 bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-600 flex items-center justify-center gap-2 min-h-[48px] shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
      >
        {isProcessing ? (
          <LoadingSpinner size="sm" color="white" text={language === 'fr' ? 'Traitement...' : 'Processing...'} />
        ) : (
          language === 'fr' ? 'Payer maintenant' : 'Pay now'
        )}
      </button>
    </form>
  )
}

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
  const { currency, convertPrice, formatPrice, exchangeRate } = useCurrency()
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
  const [clientSecret, setClientSecret] = useState(null) // For Payment Element
  const [showPaymentForm, setShowPaymentForm] = useState(false) // Toggle Payment Element display
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(true) // Order summary dropdown state
  
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
      // Hide payment form if it was shown
      setShowPaymentForm(false)
      setClientSecret(null)
      handlePaymentSuccess(sessionId)
      // Clean up URL
      if (window.location.search) {
        window.history.replaceState({}, '', '/checkout')
      }
    } else if (canceled === 'true') {
      // Payment was canceled - restore form data and return to checkout
      setCurrentStep(1)
      setShowPaymentForm(false)
      setClientSecret(null)
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
      }
    }
  }, [selectedShipping, cartItems, appliedPromoCode])

  // Promo code validation
  const validatePromoCode = (code) => {
    const codeUpper = code.toUpperCase().trim()
    
    // Define valid promo codes
    const validCodes = {
      'FREESHIP': { discount: 100, type: 'shipping' }, // 100% off shipping only
    }
    
    if (validCodes[codeUpper]) {
      const promo = validCodes[codeUpper]
      // Always calculate discount in CAD (all prices are stored in CAD)
      const subtotalCAD = getCartTotal() // Already in CAD
      const shippingCAD = calculateShipping() // Already in CAD
      const tax = 0
      const orderTotalCAD = subtotalCAD + shippingCAD + tax
      
      if (promo.type === 'percent') {
        // Calculate discount in CAD (applies to entire order)
        const discountAmountCAD = (orderTotalCAD * promo.discount) / 100
        return { valid: true, discount: discountAmountCAD, code: codeUpper }
      } else if (promo.type === 'shipping') {
        // Calculate discount in CAD (applies only to shipping)
        const discountAmountCAD = (shippingCAD * promo.discount) / 100
        return { valid: true, discount: discountAmountCAD, code: codeUpper, shippingOnly: true }
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
    const subtotalCAD = getCartTotal() // Already in CAD
    const shippingCAD = calculateShipping() // Shipping is in CAD
    // Zero-rated goods under Schedule VI Part III of the Excise Tax Act
    // Dehydrated citrus products (unsweetened, no preservatives) qualify as zero-rated basic groceries
    const tax = 0 // 0% HST/GST - Products are zero-rated as unsweetened dried fruits
    const totalCAD = Math.max(0, subtotalCAD + shippingCAD + tax - promoCodeDiscount)
    const total = currency === 'USD' ? convertPrice(totalCAD) : totalCAD // For analytics tracking only
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
        
        // Log currency before sending to backend
        console.log('💱 Frontend sending to backend:', {
          currency,
          exchangeRate,
          cartTotal: getCartTotal()
        })
        
        response = await fetch(`${API_URL}/api/create-payment-intent`, {
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
            currency: currency, // Pass selected currency to backend
            exchangeRate: exchangeRate, // Pass exchange rate to backend for accurate conversion
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

      // Use Payment Element (single column, no left panel)
      if (data.clientSecret) {
        console.log('✅ Payment Intent clientSecret received:', data.clientSecret)
        setClientSecret(data.clientSecret)
        setShowPaymentForm(true)
        setIsSubmitting(false) // Reset submitting state since we're showing payment form
        // Scroll to payment form
        setTimeout(() => {
          const paymentElement = document.getElementById('payment-form')
          if (paymentElement) {
            paymentElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      } else {
        console.error('❌ No clientSecret in response:', data)
        throw new Error('Payment Intent clientSecret not provided by server')
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
  // Calculate total in CAD - formatPrice will handle currency conversion automatically
  const totalCAD = hasEnteredShippingDetails && selectedShipping 
    ? Math.max(0, subtotalCAD + shippingCostCAD + tax - promoCodeDiscount)
    : subtotalCAD

  // Helper function to format price with explicit currency code (USD/CAD)
  const formatPriceWithCurrency = (priceCAD) => {
    const formatted = formatPrice(priceCAD)
    // formatPrice returns formatted string like "$12.50" or "CA$12.50"
    // We want to ensure it always shows "USD" or "CAD" explicitly
    if (currency === 'USD') {
      // Remove any existing currency symbols and add "USD"
      // Handle formats like "$12.50" or "CA$12.50"
      const amount = formatted.replace(/[^\d.,]/g, '') // Extract numbers
      const numericValue = parseFloat(amount.replace(/,/g, ''))
      return `$${numericValue.toFixed(2)} USD`
    } else {
      // For CAD, ensure it shows "CAD" explicitly
      const amount = formatted.replace(/[^\d.,]/g, '') // Extract numbers
      const numericValue = parseFloat(amount.replace(/,/g, ''))
      return `$${numericValue.toFixed(2)} CAD`
    }
  }

  if (cartItems.length === 0 && currentStep !== 2) {
    return (
      <section className="py-20 px-5 bg-[#f6f9fc] min-h-[calc(100vh-72px)]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">{getTranslation(language, 'checkout.emptyCart')}</h1>
          <p className="text-[#425466] mb-8">{getTranslation(language, 'checkout.emptyCartDescription')}</p>
          <button
              onClick={() => {
                window.history.pushState({ page: "/" }, "", "/")
                window.dispatchEvent(new Event("hashchange"))
              }}
            className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
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
    <section ref={sectionRef} className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => {
                if (showPaymentForm) {
                  setShowPaymentForm(false)
                  setClientSecret(null)
                } else {
                  window.history.pushState({ page: "/" }, "", "/")
                  window.dispatchEvent(new Event("hashchange"))
                }
              }}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">
                {showPaymentForm 
                  ? (language === 'fr' ? 'Retour aux informations d\'expédition' : 'Back to shipping')
                  : getTranslation(language, 'checkout.continueShopping') || 'Continue shopping'}
              </span>
              <span className="sm:hidden">{language === 'fr' ? 'Retour' : 'Back'}</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {currentStep === 1 && (
          <div className="max-w-7xl mx-auto">
            {!showPaymentForm && (
              <>
                    {/* Progress Indicator - Stripe-inspired */}
                    <div className="mb-12">
                      <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-semibold shadow-lg ring-4 ring-amber-100">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900">{language === 'fr' ? 'Livraison' : 'Shipping'}</p>
                            <p className="text-xs text-gray-500">{language === 'fr' ? 'En cours' : 'In progress'}</p>
                          </div>
                        </div>
                        <div className="w-16 h-0.5 bg-gray-200 relative">
                          <div className="absolute inset-0 bg-amber-600 w-0 transition-all duration-500"></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-semibold border-2 border-gray-200">
                            2
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-sm font-medium text-gray-400">{language === 'fr' ? 'Paiement' : 'Payment'}</p>
                            <p className="text-xs text-gray-400">{language === 'fr' ? 'En attente' : 'Pending'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                          {getTranslation(language, 'checkout.shippingInformation') || 'Shipping Information'}
                        </h1>
                        <p className="text-base text-gray-600 max-w-2xl mx-auto">
                          {getTranslation(language, 'checkout.completeOrder') || 'Complete your order details below'}
                        </p>
                      </div>
                    </div>
                
                {/* Main Layout - Stripe-inspired */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                  {/* Shipping Form - Main content on left */}
                  <div className="lg:col-span-2">
                <form onSubmit={handlePaymentSubmit} className="space-y-8">
                  {/* Contact Information */}
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 mb-1">
                      {language === 'fr' ? 'Informations de contact' : 'Contact Information'}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      {language === 'fr' ? 'Nous vous enverrons un email de confirmation' : 'We\'ll send you a confirmation email'}
                    </p>
                    <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                          {getTranslation(language, 'checkout.email') || 'Email'}
                      </label>
                        <input
                          type="email"
                          name="email"
                          id="checkout-email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2.5 text-sm rounded-md border transition-all placeholder:text-gray-400 ${
                            errors.email ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                          } focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                          placeholder={language === 'fr' ? 'votre@email.com' : 'your@email.com'}
                          required
                          data-1p-ignore
                        />
                        {errors.email && (
                          <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-700 leading-relaxed">{errors.email}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 mb-4">
                      {language === 'fr' ? 'Nom' : 'Name'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          {getTranslation(language, 'checkout.firstName') || 'First Name'}
                        </label>
                      <input
                        type="text"
                        name="firstName"
                        id="checkout-firstName"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                          placeholder={getTranslation(language, 'checkout.firstName') || 'First name'}
                        className={`w-full px-4 py-2.5 text-sm rounded-md border transition-all placeholder:text-gray-400 ${
                          errors.firstName ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                        } focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                        required
                        data-1p-ignore
                      />
                      {errors.firstName && (
                        <div className="mt-1.5 flex items-start gap-1.5">
                          <svg className="w-3.5 h-3.5 text-[#dc2626] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-[#dc2626] text-xs leading-relaxed">{errors.firstName}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {getTranslation(language, 'checkout.lastName') || 'Last Name'}
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="checkout-lastName"
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                          placeholder={getTranslation(language, 'checkout.lastName') || 'Last name'}
                        className={`w-full px-4 py-2.5 text-sm rounded-md border transition-all placeholder:text-gray-400 ${
                          errors.lastName ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                        } focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                        required
                        data-1p-ignore
                      />
                      {errors.lastName && (
                        <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-700 leading-relaxed">{errors.lastName}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 mb-1">
                      {language === 'fr' ? 'Adresse de livraison' : 'Shipping Address'}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      {language === 'fr' ? 'Où devons-nous envoyer votre commande?' : 'Where should we send your order?'}
                    </p>
                    <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {getTranslation(language, 'checkout.streetAddress') || 'Street Address'}
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="checkout-address"
                      autoComplete="shipping street-address"
                      value={formData.address}
                      onChange={handleInputChange}
                          placeholder={getTranslation(language, 'checkout.streetAddress') || '123 Main St'}
                      className={`w-full px-4 py-2.5 text-sm rounded-md border transition-all placeholder:text-gray-400 ${
                        errors.address ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                      } focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                      required
                      data-1p-ignore
                    />
                    {errors.address && (
                      <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-700 leading-relaxed">{errors.address}</p>
                      </div>
                    )}
                  </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          {language === 'fr' ? 'Pays' : 'Country'}
                        </label>
                        <select
                          name="country"
                          id="checkout-country"
                          autoComplete="shipping country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2.5 text-sm rounded-md border transition-all ${
                            errors.country ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                          } focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                          required
                          data-1p-ignore
                        >
                          <option value="Canada">Canada</option>
                          <option value="United States">United States</option>
                        </select>
                        {errors.country && (
                          <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-700 leading-relaxed">{errors.country}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="sm:col-span-1">
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            {getTranslation(language, 'checkout.city') || 'City'}
                          </label>
                      <input
                        type="text"
                        name="city"
                        id="checkout-city"
                        autoComplete="shipping address-level2"
                        value={formData.city}
                        onChange={handleInputChange}
                            placeholder={getTranslation(language, 'checkout.city') || 'City'}
                        className={`w-full px-4 py-2.5 text-sm rounded-md border transition-all placeholder:text-gray-400 ${
                          errors.city ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                        } focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                        required
                        data-1p-ignore
                      />
                      {errors.city && (
                        <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-700 leading-relaxed">{errors.city}</p>
                        </div>
                      )}
                    </div>
                        <div className="sm:col-span-1">
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            {formData.country === "United States" 
                              ? (language === 'fr' ? 'État' : 'State')
                              : (language === 'fr' ? 'Province' : 'Province')}
                          </label>
                      <select
                        name="province"
                        id="checkout-province"
                        autoComplete="shipping address-level1"
                        value={formData.province}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 text-sm rounded-md border transition-all ${
                          errors.province ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                        } focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                        required
                        data-1p-ignore
                      >
                            <option value="">
                              {formData.country === "United States" 
                                ? getTranslation(language, 'checkout.selectState') || 'Select state'
                                : getTranslation(language, 'checkout.selectProvince') || 'Select province'}
                            </option>
                            {(formData.country === "United States" ? usStates : canadianProvinces).map(region => (
                              <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                      {errors.province && (
                        <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-700 leading-relaxed">{errors.province}</p>
                        </div>
                      )}
                    </div>
                        <div className="sm:col-span-1">
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            {formData.country === "United States" 
                              ? (getTranslation(language, 'checkout.zipCode') || 'ZIP Code')
                              : (getTranslation(language, 'checkout.postalCode') || 'Postal Code')}
                          </label>
                      <input
                        type="text"
                        name="postalCode"
                        id="checkout-postalCode"
                        autoComplete={formData.country === "United States" ? "shipping postal-code" : "shipping postal-code"}
                        value={formData.postalCode}
                        onChange={handleInputChange}
                            placeholder={formData.country === "United States" 
                              ? (getTranslation(language, 'checkout.zipCode') || '12345')
                              : (getTranslation(language, 'checkout.postalCode') || 'A1A 1A1')}
                        className={`w-full px-4 py-2.5 text-sm rounded-md border transition-all placeholder:text-gray-400 ${
                          errors.postalCode ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                        } focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                        required
                        data-1p-ignore
                      />
                      {errors.postalCode && (
                        <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-700 leading-relaxed">{errors.postalCode}</p>
                        </div>
                      )}
                    </div>
                  </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          {getTranslation(language, 'checkout.phone') || 'Phone Number'}
                        </label>
                        <input
                          type="tel"
                          inputMode="tel"
                          name="phone"
                          id="checkout-phone"
                          autoComplete="shipping tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder={formData.country === "United States" 
                            ? (getTranslation(language, 'checkout.phonePlaceholderUS') || '(555) 123-4567')
                            : (getTranslation(language, 'checkout.phonePlaceholder') || '(555) 123-4567')}
                          className={`w-full px-4 py-2.5 text-sm rounded-md border transition-all placeholder:text-gray-400 ${
                            errors.phone ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                          } focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
                          required
                          data-1p-ignore
                        />
                        {errors.phone && (
                          <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-700 leading-relaxed">{errors.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getTranslation(language, 'checkout.orderNotes') || 'Order Notes (Optional)'}
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2.5 text-sm rounded-md border border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all resize-none placeholder:text-gray-400"
                      placeholder={getTranslation(language, 'checkout.orderNotesPlaceholder') || 'Leave a note for delivery...'}
                    />
                  </div>

                  {/* Shipping Options - Only show after user enters shipping details */}
                  {hasEnteredShippingDetails && formData.postalCode && formData.province && formData.city && formData.country && (
                    <div>
                      <div className="mb-4">
                        <h2 className="text-base font-semibold text-gray-900 mb-1">
                          {getTranslation(language, 'checkout.shippingMethod') || 'Shipping Method'}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {language === 'fr' ? 'Choisissez votre méthode de livraison préférée' : 'Choose your preferred shipping method'}
                        </p>
                      </div>
                      
                      {loadingShipping && (
                        <div className="mb-4">
                          <LoadingSpinner size="sm" color="amber" text={getTranslation(language, 'checkout.calculatingShipping')} />
                        </div>
                      )}

                      {shippingError && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6">
                          <div className="flex items-start gap-3 mb-3">
                            <svg className="w-6 h-6 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-semibold text-red-800">{shippingError}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => fetchShippingRates()}
                            className="px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                          >
                            {language === 'fr' ? 'Réessayer' : 'Try again'}
                          </button>
                        </div>
                      )}

                      {!loadingShipping && shippingOptions.length > 0 && (
                        <div className="space-y-4">
                          {shippingOptions.map((option) => (
                            <label
                              key={option.id}
                              className={`flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${
                                selectedShipping?.id === option.id
                                  ? 'border-amber-500 bg-amber-50/50 shadow-lg ring-4 ring-amber-100'
                                  : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/20 hover:shadow-md'
                              }`}
                            >
                              <input
                                type="radio"
                                name="shipping"
                                value={option.id}
                                checked={selectedShipping?.id === option.id}
                                onChange={() => setSelectedShipping(option)}
                                className="w-5 h-5 text-amber-600 focus:ring-amber-500 border-gray-300"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-base text-gray-900">{option.name}</span>
                                  <span className="font-bold text-base text-gray-900">
                                    {formatPriceWithCurrency(option.price)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">
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
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center">
                          <svg className="w-12 h-12 text-amber-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          <p className="text-base font-semibold text-amber-900 mb-2">
                            {language === 'fr' 
                              ? 'Aucune option d\'expédition disponible'
                              : 'No shipping options available'}
                          </p>
                          <p className="text-sm text-amber-700 mb-4">
                            {language === 'fr' 
                              ? 'Cliquez pour calculer les tarifs d\'expédition.'
                              : 'Click below to calculate shipping rates.'}
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
                            className="px-5 py-2.5 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-md hover:shadow-lg"
                          >
                            {language === 'fr' ? 'Calculer les tarifs d\'expédition' : 'Calculate shipping rates'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Button */}
                  <div className="pt-6 border-t border-gray-200">
                    {stripeError && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6">
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-semibold text-red-800">{stripeError}</p>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !hasEnteredShippingDetails || !selectedShipping}
                      className="w-full py-4 px-6 text-base font-bold rounded-xl border-0 cursor-pointer transition-all duration-200 bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 active:from-amber-600 active:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-amber-600 disabled:hover:to-orange-600 flex items-center justify-center gap-3 min-h-[56px] shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <LoadingSpinner size="sm" color="white" text={getTranslation(language, 'checkout.processing')} />
                      ) : (
                        <>
                          {hasEnteredShippingDetails && selectedShipping 
                            ? `${language === 'fr' ? 'Payer' : 'Pay'} ${formatPriceWithCurrency(totalCAD)}`
                            : (language === 'fr' ? 'Continuer' : 'Continue')
                          }
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                      {getTranslation(language, 'checkout.termsAgreement') || (language === 'fr' ? 'En continuant, vous acceptez nos conditions d\'utilisation' : 'By continuing, you agree to our terms of service')}
                    </p>
                  </div>
                </form>
                  </div>
                  
                  {/* Order Summary - Sticky sidebar on right */}
                  <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-24">
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                          <h2 className="text-base font-semibold text-gray-900">
                            {language === 'fr' ? 'Résumé' : 'Order'}
                          </h2>
                        </div>
                      
                      <div className="p-6 space-y-6">
                        {/* Product Items */}
                        <div className="space-y-4">
                          {cartItems.map((item) => {
                            const productId = item.id?.split('-').slice(0, -1).join('-') || item.id?.replace(/-mini|-small|-medium|-large|-clearbox/, '') || ''
                            const translatedName = getTranslation(language, `products.${productId}.name`)
                            const displayName = translatedName !== `products.${productId}.name` ? translatedName : item.name
                            
                            // Translate variant
                            const variantMap = {
                              'mini': language === 'fr' ? 'Mini' : 'Mini',
                              'small': language === 'fr' ? 'Petit' : 'Small',
                              'medium': language === 'fr' ? 'Moyen' : 'Medium',
                              'large': language === 'fr' ? 'Grand' : 'Large',
                              'clearbox': language === 'fr' ? 'Boîte transparente' : 'Clear Box'
                            }
                            const variantLabel = variantMap[item.variant?.toLowerCase()] || item.variant
                            
                            return (
                              <div key={`${item.id}-${item.variant}`} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                {/* Product Image */}
                                <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 shrink-0">
                                  <img 
                                    src={item.image} 
                                    alt={displayName} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                
                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 mb-0.5 leading-tight">
                                    {displayName}
                                  </h4>
                                  <p className="text-xs text-gray-500 mb-1">{variantLabel}</p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-600">
                                      {language === 'fr' ? 'Qty' : 'Qty'}: <span className="font-medium">{item.quantity}</span>
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">
                                      {formatPriceWithCurrency(item.price * item.quantity)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        
                        {/* Price Breakdown */}
                        <div className="pt-4 border-t border-gray-200 space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{language === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
                            <span className="font-medium text-gray-900">{formatPriceWithCurrency(getCartTotal())}</span>
                          </div>
                          {selectedShipping && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{language === 'fr' ? 'Expédition' : 'Shipping'}</span>
                              <span className="font-medium text-gray-900">{formatPriceWithCurrency(calculateShipping())}</span>
                            </div>
                          )}
                          {appliedPromoCode && promoCodeDiscount > 0 && (
                            <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded border border-green-200 -mx-3 text-sm">
                              <div>
                                <span className="text-green-700">{language === 'fr' ? 'Réduction' : 'Discount'}</span>
                                <span className="text-xs text-green-600 ml-1">({appliedPromoCode})</span>
                              </div>
                              <span className="font-medium text-green-600">-{formatPriceWithCurrency(promoCodeDiscount)}</span>
                            </div>
                          )}
                          <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
                            <span className="text-base font-semibold text-gray-900">{language === 'fr' ? 'Total' : 'Total'}</span>
                            <span className="text-lg font-bold text-gray-900">
                              {formatPriceWithCurrency(Math.max(0, getCartTotal() + (selectedShipping ? calculateShipping() : 0) - promoCodeDiscount))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </>
            )}

            {showPaymentForm && clientSecret && (
              <div>
                {/* Clean Progress Indicator */}
                <div className="mb-10">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{language === 'fr' ? 'Livraison' : 'Shipping'}</span>
                    </div>
                    <div className="w-12 h-px bg-amber-600"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-medium">
                        2
                      </div>
                      <span className="text-sm font-medium text-gray-900">{language === 'fr' ? 'Paiement' : 'Payment'}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                      {getTranslation(language, 'checkout.paymentDetails') || 'Payment Details'}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {language === 'fr' 
                        ? 'Complétez votre paiement en toute sécurité'
                        : 'Complete your payment securely'}
                    </p>
                  </div>
                </div>
                
                {/* Main Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                  {/* Payment Form - Main content */}
                  <div className="lg:col-span-2">
                    <div className="space-y-6">
                      {/* Payment Methods Icons */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">
                          {language === 'fr' ? 'Méthodes acceptées' : 'Accepted Methods'}
                        </p>
                        <div className="flex items-center gap-2">
                          <svg className="h-5" viewBox="0 0 40 24" fill="none">
                            <rect width="40" height="24" rx="2" fill="#1434CB"/>
                            <path d="M16.5 12h7m-7-3h7m-7 6h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          <svg className="h-5" viewBox="0 0 40 24" fill="none">
                            <rect width="40" height="24" rx="2" fill="#EB001B"/>
                            <rect x="20" width="20" height="24" rx="2" fill="#F79E1B"/>
                          </svg>
                          <svg className="h-5" viewBox="0 0 40 24" fill="#006FCF">
                            <rect width="40" height="24" rx="2" fill="#006FCF"/>
                            <path d="M20 8l-2 8h4l-2-8z" fill="white"/>
                          </svg>
                          <span className="ml-2 text-xs text-gray-500">and more</span>
                        </div>
                      </div>

                      {/* Stripe Payment Element */}
                      <div className="py-2">
                        <Elements 
                          stripe={stripePromise} 
                          options={{
                            clientSecret,
                            appearance: {
                              theme: 'stripe',
                              variables: {
                                colorPrimary: '#d97706',
                                colorBackground: '#ffffff',
                                colorText: '#111827',
                                colorTextSecondary: '#6b7280',
                                colorDanger: '#dc2626',
                                colorSuccess: '#10b981',
                                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                fontSizeBase: '15px',
                                fontWeightNormal: '400',
                                fontWeightMedium: '500',
                                fontWeightBold: '600',
                                spacingUnit: '4px',
                                borderRadius: '8px',
                                spacingBorder: '1px',
                                colorTextPlaceholder: '#9ca3af',
                                colorIcon: '#6b7280',
                                colorIconHover: '#111827',
                                colorFocus: '#d97706',
                                spacingFocus: '2px',
                              },
                              rules: {
                                '.Input': {
                                  border: '1px solid #d1d5db',
                                  borderRadius: '8px',
                                  padding: '14px 16px',
                                  fontSize: '15px',
                                  transition: 'all 0.2s ease',
                                  boxShadow: 'none',
                                },
                                '.Input:focus': {
                                  border: '1px solid #d97706',
                                  boxShadow: '0 0 0 3px rgba(217, 119, 6, 0.1)',
                                  outline: 'none',
                                },
                                '.Input--invalid': {
                                  border: '1px solid #dc2626',
                                  backgroundColor: '#fef2f2',
                                },
                                '.Label': {
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  color: '#374151',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  marginBottom: '8px',
                                },
                                '.Tab': {
                                  borderRadius: '8px',
                                  padding: '10px 16px',
                                  border: '1px solid #e5e7eb',
                                  transition: 'all 0.2s ease',
                                  fontSize: '14px',
                                },
                                '.Tab--selected': {
                                  border: '1px solid #d97706',
                                  backgroundColor: '#d97706',
                                  color: '#ffffff',
                                  boxShadow: '0 2px 4px rgba(217, 119, 6, 0.2)',
                                },
                                '.Error': {
                                  color: '#dc2626',
                                  fontSize: '13px',
                                  marginTop: '8px',
                                  fontWeight: '500',
                                },
                              },
                            },
                            locale: language === 'fr' ? 'fr' : 'en',
                          }}
                        >
                          <PaymentForm 
                            clientSecret={clientSecret}
                            onSuccess={() => {
                              console.log('✅ Payment completed')
                            }}
                          />
                        </Elements>
                      </div>

                      {/* Security Notice */}
                      <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span>{language === 'fr' ? 'Sécurisé par Stripe' : 'Secured by Stripe'}</span>
                          <span>•</span>
                          <span>{language === 'fr' ? 'Nous ne stockons pas vos données de carte' : 'We never store your card details'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Summary - Sticky sidebar on right */}
                  <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-24">
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                          <h2 className="text-base font-semibold text-gray-900">
                            {language === 'fr' ? 'Résumé' : 'Order'}
                          </h2>
                        </div>
                      
                      <div className="p-6 space-y-6">
                              {/* Product Items */}
                              <div className="space-y-4">
                                {cartItems.map((item) => {
                                  const productId = item.id?.split('-').slice(0, -1).join('-') || item.id?.replace(/-mini|-small|-medium|-large|-clearbox/, '') || ''
                                  const translatedName = getTranslation(language, `products.${productId}.name`)
                                  const displayName = translatedName !== `products.${productId}.name` ? translatedName : item.name
                                  
                                  // Translate variant
                                  const variantMap = {
                                    'mini': language === 'fr' ? 'Mini' : 'Mini',
                                    'small': language === 'fr' ? 'Petit' : 'Small',
                                    'medium': language === 'fr' ? 'Moyen' : 'Medium',
                                    'large': language === 'fr' ? 'Grand' : 'Large',
                                    'clearbox': language === 'fr' ? 'Boîte transparente' : 'Clear Box'
                                  }
                                  const variantLabel = variantMap[item.variant?.toLowerCase()] || item.variant
                                  
                                  return (
                                    <div key={`${item.id}-${item.variant}`} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                      {/* Product Image */}
                                      <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 shrink-0">
                                        <img 
                                          src={item.image} 
                                          alt={displayName} 
                                          className="w-full h-full object-cover" 
                                        />
                                      </div>
                                      
                                      {/* Product Info */}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-gray-900 mb-0.5 leading-tight">
                                          {displayName}
                                        </h4>
                                        <p className="text-xs text-gray-500 mb-1">{variantLabel}</p>
                                        <div className="flex items-center justify-between mt-1">
                                          <span className="text-xs text-gray-600">
                                            {language === 'fr' ? 'Qty' : 'Qty'}: <span className="font-medium">{item.quantity}</span>
                                          </span>
                                          <span className="text-sm font-semibold text-gray-900">
                                            {formatPriceWithCurrency(item.price * item.quantity)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                              
                              {/* Promo Code Section - Only shown when needed */}
                              {!appliedPromoCode && (
                                <div className="pt-4 border-t border-gray-200">
                                  <label className="block text-sm font-medium text-gray-700 mb-3">
                                    {language === 'fr' ? 'Code promo' : 'Promo Code'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => {
                                        setPromoCode(e.target.value)
                            setPromoCodeError('')
                          }}
                                      placeholder={language === 'fr' ? 'Entrez le code' : 'Enter code'}
                                      className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-gray-400"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromoCode}
                                      className="px-5 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
                        >
                                      {language === 'fr' ? 'Appliquer' : 'Apply'}
                        </button>
                  </div>
                      {promoCodeError && (
                                    <p className="mt-2 text-sm text-red-600">{promoCodeError}</p>
                      )}
                    </div>
                              )}
                              
                        {/* Price Breakdown */}
                        <div className="pt-4 border-t border-gray-200 space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{language === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
                            <span className="font-medium text-gray-900">{formatPriceWithCurrency(getCartTotal())}</span>
                          </div>
                          {selectedShipping && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{language === 'fr' ? 'Expédition' : 'Shipping'}</span>
                              <span className="font-medium text-gray-900">{formatPriceWithCurrency(calculateShipping())}</span>
                            </div>
                          )}
                          {appliedPromoCode && promoCodeDiscount > 0 && (
                            <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded border border-green-200 -mx-3 text-sm">
                              <div>
                                <span className="text-green-700">{language === 'fr' ? 'Réduction' : 'Discount'}</span>
                                <span className="text-xs text-green-600 ml-1">({appliedPromoCode})</span>
                              </div>
                              <span className="font-medium text-green-600">-{formatPriceWithCurrency(promoCodeDiscount)}</span>
                            </div>
                          )}
                          <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
                            <span className="text-base font-semibold text-gray-900">{language === 'fr' ? 'Total' : 'Total'}</span>
                            <span className="text-lg font-bold text-gray-900">
                              {formatPriceWithCurrency(Math.max(0, getCartTotal() + (selectedShipping ? calculateShipping() : 0) - promoCodeDiscount))}
                            </span>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Confirmation */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">{getTranslation(language, 'checkout.orderConfirmed')}</h1>
              <p className="text-gray-600 mb-6">
                {getTranslation(language, 'checkout.thankYou')}{customerInfo.name ? `, ${customerInfo.name.split(' ')[0]}` : ''}!
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-600 mb-2">{getTranslation(language, 'checkout.orderNumber')}</p>
                <p className="text-xl font-semibold text-gray-900">{orderNumber}</p>
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
                className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
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

