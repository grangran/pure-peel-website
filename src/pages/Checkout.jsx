import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { useCurrency } from "../context/CurrencyContext"
import { getTranslation, translateVariantLabel } from "../utils/translations"
import { trackCheckoutStarted, trackPurchase } from "../utils/analytics"
import { getApiBaseUrl } from "../utils/apiBaseUrl"
import LoadingSpinner from "../components/LoadingSpinner"
import Skeleton from "../components/Skeleton"
import PageLoader from "../components/PageLoader"

const S = {
  serif:     "'Cormorant Garamond', Georgia, serif",
  sans:      "'Jost', sans-serif",
  dark:      "#0f0a04",
  cream:     "#faf7f2",
  creamDark: "#f2ece0",
  gold:      "#e8c84a",
  orange:    "#c85a08",
  border:    "rgba(15,10,4,0.08)",
  textMid:   "rgba(15,10,4,0.5)",
  textLight: "rgba(15,10,4,0.35)",
}

const canadianProvinces = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick",
  "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
  "Nunavut", "Ontario", "Prince Edward Island", "Quebec",
  "Saskatchewan", "Yukon"
]

const formatPhoneNumber = (value, country = 'Canada') => {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

const formatPostalCode = (value) => {
  const cleaned = value.replace(/[^A-Za-z0-9]/gi, '').toUpperCase()
  if (cleaned.length <= 3) return cleaned
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`
}

const validateEmail    = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const validatePhone    = (phone) => phone.replace(/\D/g, '').length >= 10
const validatePostalCode = (postalCode) =>
  /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postalCode)

// Shared input class
const inputClass = (hasError) =>
  `w-full px-4 py-3 text-sm rounded-lg border transition-all placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black ${
    hasError
      ? 'border-red-300 bg-red-50 text-red-900'
      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
  }`

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart, setIsCartOpen } = useCart()
  const { language } = useLanguage()
  const { currency, exchangeRate } = useCurrency()
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    if (currentStep === 2) {}
  }, [currentStep])

  const [isSubmitting, setIsSubmitting]                         = useState(false)
  const [orderNumber, setOrderNumber]                           = useState(null)
  const [generatedOrderId, setGeneratedOrderId]                 = useState(null)
  const [stripeError, setStripeError]                           = useState(null)
  const [customerInfo, setCustomerInfo]                         = useState({ name: '', email: '' })
  const [shippingOptions, setShippingOptions]                   = useState([])
  const [selectedShipping, setSelectedShipping]                 = useState(null)
  const [loadingShipping, setLoadingShipping]                   = useState(false)
  const [shippingError, setShippingError]                       = useState(null)
  const [isRedirecting, setIsRedirecting]                       = useState(false)
  const [hasEnteredShippingDetails, setHasEnteredShippingDetails] = useState(false)
  const [promoCode, setPromoCode]                               = useState('')
  const [appliedPromoCode, setAppliedPromoCode]                 = useState(null)
  const [promoCodeError, setPromoCodeError]                     = useState('')
  const [promoCodeDiscount, setPromoCodeDiscount]               = useState(0)
  const [pendingShippingPromoCode, setPendingShippingPromoCode] = useState(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success  = urlParams.get('success')
    const canceled = urlParams.get('canceled')
    const sessionId = urlParams.get('session_id')

    if (success === 'true' && sessionId) {
      setCurrentStep(2)
      localStorage.removeItem('checkoutFormData')
      localStorage.removeItem('checkoutShippingOption')
      handlePaymentSuccess(sessionId).then(() => {
        setTimeout(() => { if (window.location.search) window.history.replaceState({}, '', '/checkout') }, 500)
      }).catch(error => { console.error('❌ Error processing payment success:', error); setIsSubmitting(false) })
    } else if (import.meta.env.DEV && success === 'true' && urlParams.get('dev_preview') === '1') {
      // Dev-only: show confirmation screen without Stripe (use same order # and email as OrderTracking mock)
      setCurrentStep(2)
      setOrderNumber('PP-DEV-12345678')
      setCustomerInfo({ name: 'Test Customer', email: 'dev@test.purepeel.com' })
      clearCart()
      setTimeout(() => { if (window.location.search) window.history.replaceState({}, '', '/checkout') }, 500)
    } else if (canceled === 'true') {
      setCurrentStep(1)
      setStripeError('Payment was canceled. Your information has been saved. You can try again when ready.')
      if (window.location.search) window.history.replaceState({}, '', '/checkout')
      const savedFormData = loadSavedFormData()
      const currentAddressKey = `${savedFormData.postalCode}-${savedFormData.province}-${savedFormData.city}-${savedFormData.country}`.toLowerCase()
      const savedAddressKey = localStorage.getItem('checkoutAddressKey')
      if (savedAddressKey && savedAddressKey.toLowerCase() !== currentAddressKey) {
        setFormData(prev => ({ ...prev, postalCode: '' }))
        setShippingOptions([]); setSelectedShipping(null); setHasEnteredShippingDetails(false)
        localStorage.removeItem('checkoutShippingOptions')
        localStorage.removeItem('checkoutShippingOption')
        localStorage.removeItem('checkoutAddressKey')
      }
    }
  }, [])

  const normalizeCheckoutCountry = (data) => {
    if (!data || typeof data !== 'object') return data
    if (data.country === 'United States') {
      return { ...data, country: 'Canada', province: '', postalCode: '' }
    }
    return data
  }

  const loadSavedFormData = () => {
    try {
      const saved = localStorage.getItem('checkoutFormData')
      if (saved) return normalizeCheckoutCountry(JSON.parse(saved))
    } catch (error) { console.error('Error loading saved form data:', error) }
    return { firstName: "", lastName: "", email: "", phone: "", address: "", city: "", country: "Canada", province: "", postalCode: "", notes: "" }
  }

  const [formData, setFormData]   = useState(loadSavedFormData)
  const [errors, setErrors]       = useState({})
  const [savedAddressKey, setSavedAddressKey] = useState(null)

  useEffect(() => {
    try {
      const savedFormData = localStorage.getItem('checkoutFormData')
      if (savedFormData) {
        const parsed = normalizeCheckoutCountry(JSON.parse(savedFormData))
        setFormData(parsed)
        if (parsed.postalCode && parsed.province && parsed.city && parsed.country) setHasEnteredShippingDetails(true)
      }
      const savedOptions  = localStorage.getItem('checkoutShippingOptions')
      const savedSelected = localStorage.getItem('checkoutShippingOption')
      const savedAddress  = localStorage.getItem('checkoutAddressKey')
      if (savedOptions && savedAddress) { setShippingOptions(JSON.parse(savedOptions)); setSavedAddressKey(savedAddress) }
      if (savedSelected) { setSelectedShipping(JSON.parse(savedSelected)); setHasEnteredShippingDetails(true) }
    } catch (error) { console.error('Error loading saved data:', error) }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasEnteredShippingDetails && formData.postalCode && formData.province && formData.city && formData.country && cartItems.length > 0) {
        const currentAddressKey = `${formData.postalCode}-${formData.province}-${formData.city}-${formData.country}`.toLowerCase()
        if (shippingOptions.length === 0 || !savedAddressKey || savedAddressKey.toLowerCase() !== currentAddressKey) fetchShippingRates()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [hasEnteredShippingDetails, formData.postalCode, formData.province, formData.city, formData.country, cartItems.length, shippingOptions.length, savedAddressKey])

  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.1 })

  useEffect(() => {
    try { localStorage.setItem('checkoutFormData', JSON.stringify(formData)) }
    catch (error) { console.error('Error saving form data:', error) }
  }, [formData])

  useEffect(() => {
    if (selectedShipping) {
      try { localStorage.setItem('checkoutShippingOption', JSON.stringify(selectedShipping)) }
      catch (error) { console.error('Error saving shipping option:', error) }
    }
  }, [selectedShipping])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let processedValue = value
    if (name === 'phone') processedValue = formatPhoneNumber(value, formData.country)
    else if (name === 'postalCode') processedValue = formatPostalCode(value)
    setFormData(prev => ({ ...prev, [name]: processedValue }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        if (name === 'email' && validateEmail(processedValue)) delete newErrors[name]
        else if (name === 'phone' && validatePhone(processedValue)) delete newErrors[name]
        else if (name === 'postalCode' && validatePostalCode(processedValue)) delete newErrors[name]
        else if (processedValue.trim() && !['email','phone','postalCode'].includes(name)) delete newErrors[name]
        return newErrors
      })
    }
    if (['postalCode','province','city','country'].includes(name)) {
      if (processedValue && !hasEnteredShippingDetails) setHasEnteredShippingDetails(true)
      if (name === 'country') {
        setFormData(prev => ({ ...prev, province: '', postalCode: '' }))
        setShippingOptions([]); setSelectedShipping(null)
        localStorage.removeItem('checkoutShippingOptions')
        localStorage.removeItem('checkoutShippingOption')
      }
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    if (name === 'email' && value && !validateEmail(value))
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }))
    else if (name === 'phone' && value && !validatePhone(value))
      setErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number' }))
    else if (name === 'postalCode' && value && !validatePostalCode(value))
      setErrors(prev => ({ ...prev, postalCode: 'Please enter a valid Canadian postal code' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim())  newErrors.lastName  = "Last name is required"
    if (!formData.email.trim())     newErrors.email     = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email"
    if (!formData.phone.trim())     newErrors.phone     = "Phone number is required"
    if (!formData.address.trim())   newErrors.address   = "Address is required"
    if (!formData.city.trim())      newErrors.city      = "City is required"
    if (!formData.country)          newErrors.country   = "Country is required"
    if (!formData.province)         newErrors.province  = "Province is required"
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required"
    } else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(formData.postalCode)) {
      newErrors.postalCode = "Please enter a valid Canadian postal code"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const fetchShippingRates = async (retryCount = 0) => {
    if (!formData.postalCode || !formData.province || !formData.city || !formData.country) return
    setLoadingShipping(true); setShippingError(null)
    try {
      const API_URL = getApiBaseUrl()
      let controller = null, timeoutId = null, isAborted = false
      if (typeof AbortController !== 'undefined') {
        controller = new AbortController()
        timeoutId = setTimeout(() => { controller.abort(); isAborted = true }, 30000)
      } else {
        timeoutId = setTimeout(() => { isAborted = true }, 30000)
      }
      try {
        const requestData = { destination: { postalCode: formData.postalCode, province: formData.province, city: formData.city, country: formData.country }, cartItems }
        let response
        if (typeof fetch !== 'undefined') {
          const fetchOptions = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestData) }
          if (controller?.signal) fetchOptions.signal = controller.signal
          response = await fetch(`${API_URL}/api/get-shipping-rates`, fetchOptions)
          if (isAborted) throw new Error('Request timeout')
        } else {
          response = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('POST', `${API_URL}/api/get-shipping-rates`, true)
            xhr.setRequestHeader('Content-Type', 'application/json')
            xhr.onload = () => {
              if (isAborted) { reject(new Error('Request timeout')); return }
              if (xhr.status >= 200 && xhr.status < 300) {
                try { resolve({ ok: true, status: xhr.status, json: async () => JSON.parse(xhr.responseText) }) }
                catch { reject(new Error('Failed to parse response')) }
              } else reject(new Error(`Failed to get shipping rates (${xhr.status})`))
            }
            xhr.onerror = () => reject(new Error('Network error'))
            xhr.timeout = 30000
            xhr.send(JSON.stringify(requestData))
          })
        }
        if (timeoutId) clearTimeout(timeoutId)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `Server error: ${response.status}` }))
          throw new Error(errorData.error || `Failed to get shipping rates (${response.status})`)
        }
        const data = await response.json()
        if (!data.options || data.options.length === 0) throw new Error('No shipping options available')
        setShippingOptions(data.options)
        const addressKey = `${formData.postalCode}-${formData.province}-${formData.city}-${formData.country}`
        try {
          localStorage.setItem('checkoutShippingOptions', JSON.stringify(data.options))
          localStorage.setItem('checkoutAddressKey', addressKey)
          setSavedAddressKey(addressKey)
        } catch {}
        if (data.options.length > 0) {
          try {
            const savedSelected = localStorage.getItem('checkoutShippingOption')
            if (savedSelected) {
              const parsedSelected = JSON.parse(savedSelected)
              const matchingOption = data.options.find(opt => opt.id === parsedSelected.id || (opt.name === parsedSelected.name && opt.price === parsedSelected.price))
              if (matchingOption) { setSelectedShipping(matchingOption); return }
            }
          } catch {}
          setSelectedShipping(data.options[0])
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError' && retryCount < 1) return fetchShippingRates(retryCount + 1)
        throw fetchError
      }
    } catch (error) {
      console.error('Error fetching shipping rates:', error)
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        setShippingError('Shipping calculation is taking longer than expected. Please try again.')
        if (retryCount === 0) setTimeout(() => fetchShippingRates(1), 2000)
        return
      }
      if (error.message.includes('fetch') || error.message.includes('connect') || error.message.includes('Failed to fetch')) {
        const PRODUCT_WEIGHTS = {
          small: 0.075,
          medium: 0.14,
          large: 0.34,
          clearbox: 0.165,
        }

        const BOX_SIZES = {
          small: { packagingWeight: 0.1, maxItems: 5 },
          large: { packagingWeight: 0.2, maxItems: 999 },
        }

        const calculateWeight = (items = []) => {
          let productWeight = 0
          items.forEach(item => {
            const variantLower = (item.variant || '').toLowerCase()
            let itemWeight = 0.1
            if (variantLower.includes('small')) itemWeight = PRODUCT_WEIGHTS.small
            else if (variantLower.includes('medium')) itemWeight = PRODUCT_WEIGHTS.medium
            else if (variantLower.includes('large')) itemWeight = PRODUCT_WEIGHTS.large
            else if (variantLower.includes('clear')) itemWeight = PRODUCT_WEIGHTS.clearbox
            productWeight += itemWeight * (item.quantity || 1)
          })

          const itemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0)
          const box = itemsCount <= BOX_SIZES.small.maxItems ? BOX_SIZES.small : BOX_SIZES.large
          return Math.max(productWeight + box.packagingWeight, 0.1)
        }

        const weight = calculateWeight(cartItems)
        const defaultOptions = [
          {
            id: 'chitchats-select',
            name: 'Tracked Shipping',
            description: 'Fully tracked delivery within Canada (2 business days)',
            price: 6.99,
            estimatedDays: 2,
          },
        ]
        setShippingOptions(defaultOptions); setSelectedShipping(defaultOptions[0])
      } else {
        setShippingError(error.message || 'Unable to calculate shipping. Please try again.')
      }
    } finally { setLoadingShipping(false) }
  }

  const calculateShipping = () => selectedShipping ? selectedShipping.price : 12.00

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    if (success === 'true') return
    if (currentStep === 2 && !orderNumber && !isSubmitting && !success) {
      const timeoutId = setTimeout(() => { if (currentStep === 2 && !orderNumber) setCurrentStep(1) }, 2000)
      return () => clearTimeout(timeoutId)
    }
  }, [currentStep, orderNumber, isSubmitting])

  useEffect(() => {
    if (hasEnteredShippingDetails && formData.postalCode && formData.province && formData.city && formData.country && cartItems.length > 0) {
      const currentAddressKey = `${formData.postalCode}-${formData.province}-${formData.city}-${formData.country}`.toLowerCase()
      if (!savedAddressKey || savedAddressKey.toLowerCase() !== currentAddressKey) {
        if (savedAddressKey && savedAddressKey.toLowerCase() !== currentAddressKey) {
          setShippingOptions([]); setSelectedShipping(null)
          localStorage.removeItem('checkoutShippingOptions')
          localStorage.removeItem('checkoutShippingOption')
          localStorage.removeItem('checkoutAddressKey')
        }
        const timer = setTimeout(() => fetchShippingRates(), 500)
        return () => clearTimeout(timer)
      }
    } else if (!hasEnteredShippingDetails || !formData.postalCode || !formData.province || !formData.city || !formData.country) {
      setShippingOptions([]); setSelectedShipping(null); setSavedAddressKey(null)
      localStorage.removeItem('checkoutShippingOptions')
      localStorage.removeItem('checkoutShippingOption')
      localStorage.removeItem('checkoutAddressKey')
    }
  }, [formData.postalCode, formData.province, formData.city, formData.country, cartItems, hasEnteredShippingDetails, savedAddressKey])

  useEffect(() => {
    if (appliedPromoCode) {
      const result = validatePromoCode(appliedPromoCode)
      if (result.valid) setPromoCodeDiscount(result.discount)
    }
  }, [selectedShipping, shippingOptions, cartItems, appliedPromoCode])

  useEffect(() => {
    if ((!selectedShipping || shippingOptions.length === 0) && appliedPromoCode) {
      const result = validatePromoCode(appliedPromoCode)
      if (result.shippingOnly) {
        setPendingShippingPromoCode(appliedPromoCode); setAppliedPromoCode(null); setPromoCodeDiscount(0); setPromoCodeError('')
      }
    }
  }, [selectedShipping, shippingOptions, appliedPromoCode])

  useEffect(() => {
    if (pendingShippingPromoCode && selectedShipping && shippingOptions.length > 0) {
      const result = validatePromoCode(pendingShippingPromoCode)
      if (result.valid && result.shippingOnly) {
        setAppliedPromoCode(result.code); setPromoCodeDiscount(result.discount)
        setPromoCode(pendingShippingPromoCode); setPendingShippingPromoCode(null); setPromoCodeError('')
      }
    }
  }, [selectedShipping, shippingOptions, pendingShippingPromoCode])

  const validatePromoCode = (code) => {
    const codeUpper = code.toUpperCase().trim()
    const validCodes = {
      'PEEL26FS': { discount: 100, type: 'shipping' },
    }
    if (validCodes[codeUpper]) {
      const promo = validCodes[codeUpper]
      const subtotalCAD = getCartTotal()
      const shippingCAD = selectedShipping ? selectedShipping.price : calculateShipping()
      if (promo.type === 'shipping') {
        const hasRealShippingRate = selectedShipping && shippingOptions.length > 0
        const discountAmountCAD = hasRealShippingRate ? (shippingCAD * promo.discount) / 100 : 0
        return { valid: true, discount: discountAmountCAD, code: codeUpper, shippingOnly: true, requiresShipping: true, hasShippingRates: hasRealShippingRate }
      }
      if (promo.type === 'percentage') {
        return { valid: true, discount: (subtotalCAD * promo.discount) / 100, code: codeUpper, shippingOnly: false, requiresShipping: false, hasShippingRates: true }
      }
    }
    return { valid: false, discount: 0, code: null }
  }

  const handleApplyPromoCode = () => {
    setPromoCodeError('')
    if (!promoCode.trim()) { setPromoCodeError('Please enter a promo code'); return }
    const result = validatePromoCode(promoCode)
    if (result.valid) {
      if (result.shippingOnly && result.requiresShipping && !result.hasShippingRates) {
        setPendingShippingPromoCode(result.code)
        setPromoCodeError('Shipping rates will be calculated once you enter your address. The code will be applied automatically.')
        return
      }
      setAppliedPromoCode(result.code); setPromoCodeDiscount(result.discount); setPendingShippingPromoCode(null); setPromoCodeError('')
    } else {
      setPromoCodeError('Invalid promo code'); setAppliedPromoCode(null); setPromoCodeDiscount(0); setPendingShippingPromoCode(null)
    }
  }

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null); setPromoCodeDiscount(0); setPromoCode(''); setPromoCodeError(''); setPendingShippingPromoCode(null)
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) { window.scrollTo({ top: 0, behavior: "smooth" }); return }
    if (!selectedShipping) { setShippingError('Please select a shipping method'); window.scrollTo({ top: 0, behavior: "smooth" }); return }
    const subtotalCAD  = getCartTotal()
    const shippingCAD  = calculateShipping()
    const tax          = 0
    const totalCAD     = Math.max(0, subtotalCAD + shippingCAD + tax - promoCodeDiscount)
    const total        = totalCAD
    trackCheckoutStarted(cartItems, total)
    setIsSubmitting(true); setStripeError(null)
    try {
      const API_URL = getApiBaseUrl()
      let response
      try {
        const orderId = `PP-${Date.now().toString().slice(-8)}`
        setGeneratedOrderId(orderId)
        response = await fetch(`${API_URL}/api/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map(item => {
              const itemData = { id: item.id, name: item.name, variant: item.variant, price: item.price, quantity: item.quantity, description: item.description || '' }
              if (item.image) {
                try {
                  if (item.image.startsWith('http://') || item.image.startsWith('https://')) itemData.image = item.image
                  else if (item.image.startsWith('/')) itemData.image = `${window.location.origin}${item.image}`
                } catch {}
              }
              return itemData
            }),
            shippingInfo: { ...formData, selectedShipping, language, order_id: orderId, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
            total: getCartTotal(),
            promoCode: appliedPromoCode ? appliedPromoCode.toUpperCase().trim() : undefined,
            discount: appliedPromoCode ? promoCodeDiscount : 0,
            currency, exchangeRate,
          }),
        })
      } catch { throw new Error('NETWORK_ERROR') }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Server error: ${response.status}` }))
        if (errorData.errors?.length > 0) throw new Error(`Validation failed: ${errorData.errors.map(e => `${e.field}: ${e.message}`).join('; ')}`)
        throw new Error(errorData.error || errorData.message || `Failed to create checkout session (${response.status})`)
      }
      const data = await response.json()
      if (data.url) { setIsRedirecting(true); window.location.href = data.url }
      else throw new Error(data.error || 'Checkout session URL not provided by server.')
    } catch (error) {
      const msg = error.message || ''
      const isNetworkError = msg === 'NETWORK_ERROR' || msg.includes('fetch') || msg.includes('Failed to fetch') || error.name === 'TypeError'
      setStripeError(isNetworkError ? 'Unable to connect to server. Please make sure the backend server is running on port 3001.' : msg || 'An error occurred. Please try again.')
      setIsSubmitting(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePaymentSuccess = async (sessionId) => {
    try {
      setIsSubmitting(true)
      const API_URL = getApiBaseUrl()
      if (!sessionId || !sessionId.match(/^cs_[a-zA-Z0-9_]+$/)) throw new Error('Invalid checkout session ID')

      // One shared fetch per sessionId (Strict Mode double effect, remounts). Do not delete the promise
      // while other callers may still be awaiting it.
      const w = typeof window !== 'undefined' ? window : null
      const inflight = w && (w.__ppCheckoutSessionJsonPromise ||= {})
      const loadSession = async () => {
        const response = await fetch(`${API_URL}/api/checkout-session/${sessionId}`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `Server error: ${response.status}` }))
          throw new Error(errorData.error || errorData.message || `Failed to fetch session: ${response.status}`)
        }
        return response.json()
      }
      const session =
        inflight && inflight[sessionId]
          ? await inflight[sessionId]
          : await (inflight
              ? (inflight[sessionId] = loadSession())
              : loadSession())
      const isFreeOrder = (session.amount_total || 0) === 0
      const isPaidOrFree = session.payment_status === 'paid' || (isFreeOrder && ['no_payment_required','unpaid'].includes(session.payment_status))
      if (isPaidOrFree) {
        const newOrderNumber = session.metadata?.order_id || generatedOrderId || `PP-${Date.now().toString().slice(-8)}`
        setOrderNumber(newOrderNumber)
        const customerName  = session.metadata?.customer_name || session.customer_details?.name || formData.firstName || 'Customer'
        const customerEmail = session.customer_email || session.customer_details?.email || formData.email || ''
        setCustomerInfo({ name: customerName, email: customerEmail })
        const orderData = {
          id: newOrderNumber, stripeSessionId: sessionId,
          items: cartItems.map(item => ({ id: item.id, name: item.name, variant: item.variant, quantity: item.quantity, price: item.price })),
          subtotal: (session.amount_subtotal || 0) / 100,
          shippingCost: (session.shipping_cost?.amount_total || 0) / 100,
          tax: (session.total_details?.amount_tax || 0) / 100,
          total: (session.amount_total || 0) / 100,
          currency: session.currency?.toUpperCase() || 'CAD'
        }
        trackPurchase(orderData)
        setCurrentStep(2); clearCart(); setIsCartOpen(false)
        localStorage.removeItem('checkoutFormData'); localStorage.removeItem('checkoutShippingOption')
        setTimeout(() => { if (window.location.search) window.history.replaceState({}, '', '/checkout') }, 1000)
        setIsSubmitting(false)
      } else { setIsSubmitting(false) }
    } catch (error) {
      console.error('❌ Error verifying payment:', error)
      setStripeError('Error verifying payment')
      setIsSubmitting(false)
    }
  }

  const handleDevFreeOrder = () => {
    if (!import.meta.env.DEV) return
    if (!validateForm()) { window.scrollTo({ top: 0, behavior: "smooth" }); return }
    const devOrderId = `PP-DEV-${Date.now().toString().slice(-8)}`
    setOrderNumber(devOrderId)
    setCustomerInfo({ name: [formData.firstName, formData.lastName].filter(Boolean).join(' ') || 'Test Customer', email: formData.email || 'dev@test.purepeel.com' })
    clearCart()
    setIsCartOpen(false)
    setCurrentStep(2)
  }

  const shippingCostCAD = calculateShipping()
  const subtotalCAD     = getCartTotal()
  const tax             = 0
  const totalCAD        = hasEnteredShippingDetails && selectedShipping
    ? Math.max(0, subtotalCAD + shippingCostCAD + tax - promoCodeDiscount)
    : subtotalCAD

  const formatPriceWithCurrency = (priceCAD) => {
    const numericValue = parseFloat(Number(priceCAD).toFixed(2))
    return `$${numericValue.toFixed(2)} CAD`
  }

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (cartItems.length === 0 && currentStep !== 2) {
    return (
      <section style={{ background: S.cream, minHeight: "calc(100vh - 72px)" }} className="py-20 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 style={{ fontFamily: S.serif, fontSize: "2rem", fontWeight: 300, fontStyle: "italic", color: S.dark, marginBottom: "12px" }}>
            {getTranslation(language, 'checkout.emptyCart')}
          </h1>
          <p style={{ fontFamily: S.sans, fontSize: "0.82rem", fontWeight: 300, color: S.textMid, marginBottom: "32px" }}>
            {getTranslation(language, 'checkout.emptyCartDescription')}
          </p>
          <button onClick={() => { window.history.pushState({ page: "/" }, "", "/"); window.dispatchEvent(new Event("hashchange")) }}
            style={{
              padding: "12px 32px", borderRadius: "100px",
              background: "linear-gradient(135deg,#f5e6a3 0%,#e8c84a 55%,#d4a832 100%)",
              fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 500,
              letterSpacing: "0.16em", textTransform: "uppercase", color: S.dark,
              border: "none", cursor: "pointer",
            }}
          >
            {getTranslation(language, 'checkout.continueShopping')}
          </button>
        </div>
      </section>
    )
  }

  if (isRedirecting) return <PageLoader message={getTranslation(language, 'checkout.redirecting')} />

  return (
    <section ref={sectionRef} style={{ minHeight: "100vh", background: S.cream }}>

      {/* ── Top bar ── */}
      <div style={{ background: S.cream, borderBottom: `1px solid ${S.border}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <button onClick={() => { window.history.pushState({ page: "/" }, "", "/"); window.dispatchEvent(new Event("hashchange")) }}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 300, letterSpacing: "0.1em", color: S.textMid }}
              onMouseEnter={e => e.currentTarget.style.color = S.dark}
              onMouseLeave={e => e.currentTarget.style.color = S.textMid}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 19l-7-7 7-7" />
              </svg>
              {getTranslation(language, 'checkout.continueShopping') || 'Continue shopping'}
            </button>
            {/* Lock icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S.textLight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* ── STEP 1 ── */}
        {currentStep === 1 && (
          <div className="max-w-7xl mx-auto">

            {/* Progress + Title */}
            <div className="mb-12">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: S.orange, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="hidden sm:block">
                    <p style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.1em", color: S.dark }}>
                      {language === 'fr' ? 'Livraison' : 'Shipping'}
                    </p>
                    <p style={{ fontFamily: S.sans, fontSize: "0.62rem", fontWeight: 300, color: S.textLight }}>
                      {language === 'fr' ? 'En cours' : 'In progress'}
                    </p>
                  </div>
                </div>
                <div style={{ width: "48px", height: "1px", background: S.border }} />
                <div className="flex items-center gap-3">
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    border: `1px solid ${S.border}`, background: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 400, color: S.textLight,
                  }}>2</div>
                  <div className="hidden sm:block">
                    <p style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 400, color: S.textLight }}>
                      {language === 'fr' ? 'Paiement' : 'Payment'}
                    </p>
                    <p style={{ fontFamily: S.sans, fontSize: "0.62rem", fontWeight: 300, color: S.textLight }}>
                      {language === 'fr' ? 'En attente' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h1 style={{
                  fontFamily: S.serif, fontSize: "clamp(2rem,4vw,3rem)",
                  fontWeight: 300, fontStyle: "italic", color: S.dark,
                  letterSpacing: "-0.01em", marginBottom: "8px",
                }}>
                  {getTranslation(language, 'checkout.shippingInformation') || 'Shipping Information'}
                </h1>
                <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid }}>
                  {getTranslation(language, 'checkout.completeOrder') || 'Complete your order details below'}
                </p>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">

              {/* ── ORDER SUMMARY (right) ── */}
              <div className="lg:col-span-1 order-1 lg:order-2">
                <div className="lg:sticky lg:top-24">
                  <div style={{ background: "#fff", border: `1px solid ${S.border}`, borderRadius: "14px", overflow: "hidden" }}>
                    <div style={{ padding: "16px 24px", borderBottom: `1px solid ${S.border}` }}>
                      <h2 style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: S.textMid, margin: 0 }}>
                        {language === 'fr' ? 'Résumé' : 'Order'}
                      </h2>
                    </div>
                    <div style={{ padding: "20px 24px" }}>

                      {/* Items */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
                        {cartItems.map(item => {
                          const productId    = item.id?.split('-').slice(0, -1).join('-') || item.id?.replace(/-mini|-small|-medium|-large|-clearbox/, '') || ''
                          const translatedName = getTranslation(language, `products.${productId}.name`)
                          const displayName  = translatedName !== `products.${productId}.name` ? translatedName : item.name
                          const variantLabel = translateVariantLabel(language, item.variant)
                          return (
                            <div key={`${item.id}-${item.variant}`} style={{ display: "flex", gap: "12px", paddingBottom: "16px", borderBottom: `1px solid ${S.border}` }}>
                              <div style={{ width: "56px", height: "56px", borderRadius: "8px", overflow: "hidden", background: S.creamDark, border: `1px solid ${S.border}`, flexShrink: 0 }}>
                                <img src={item.image} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontFamily: S.serif, fontSize: "0.95rem", fontWeight: 400, fontStyle: "italic", color: S.dark, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
                                <p style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 300, color: S.textLight, margin: "0 0 6px" }}>{variantLabel}</p>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <span style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 300, color: S.textLight }}>Qty: {item.quantity}</span>
                                  <span style={{ fontFamily: S.sans, fontSize: "0.82rem", fontWeight: 400, color: S.dark }}>{formatPriceWithCurrency(item.price * item.quantity)}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Promo code */}
                      {!appliedPromoCode ? (
                        <div style={{ paddingTop: "16px", borderTop: `1px solid ${S.border}`, marginBottom: "16px" }}>
                          <label style={{ fontFamily: S.sans, fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: S.textMid, display: "block", marginBottom: "8px" }}>
                            {language === 'fr' ? 'Code promo' : 'Promo Code'}
                          </label>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <input
                              type="text" value={promoCode}
                              onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoCodeError('') }}
                              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyPromoCode() } }}
                              placeholder={language === 'fr' ? 'Entrez le code' : 'Enter code'}
                              style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: `1px solid ${S.border}`, fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 300, color: S.dark, background: S.cream, outline: "none" }}
                            />
                            <button type="button" onClick={handleApplyPromoCode}
                              style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: S.orange, color: "#fff", fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                              {language === 'fr' ? 'Appliquer' : 'Apply'}
                            </button>
                          </div>
                          {promoCodeError && <p style={{ fontFamily: S.sans, fontSize: "0.65rem", color: pendingShippingPromoCode ? S.orange : "#dc2626", marginTop: "6px" }}>{promoCodeError}</p>}
                        </div>
                      ) : (
                        <div style={{ paddingTop: "16px", borderTop: `1px solid ${S.border}`, marginBottom: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "rgba(90,154,40,0.06)", borderRadius: "8px", border: "1px solid rgba(90,154,40,0.2)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 500, color: "#3a7a14" }}>{appliedPromoCode}</span>
                              {appliedPromoCode === 'PEEL26FS' && <span style={{ fontFamily: S.sans, fontSize: "0.6rem", color: "#3a7a14" }}>(Free Shipping)</span>}
                            </div>
                            <button type="button" onClick={handleRemovePromoCode}
                              style={{ fontFamily: S.sans, fontSize: "0.6rem", color: "#3a7a14", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                            >
                              {language === 'fr' ? 'Retirer' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Price breakdown */}
                      <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 300, color: S.textMid }}>{language === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
                          <span style={{ fontFamily: S.sans, fontSize: "0.82rem", fontWeight: 400, color: S.dark }}>{formatPriceWithCurrency(getCartTotal())}</span>
                        </div>
                        {selectedShipping && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 300, color: S.textMid }}>{language === 'fr' ? 'Expédition' : 'Shipping'}</span>
                            <span style={{ fontFamily: S.sans, fontSize: "0.82rem", fontWeight: 400, color: S.dark }}>
                              {appliedPromoCode === 'PEEL26FS' && promoCodeDiscount > 0 && (
                                <span style={{ textDecoration: "line-through", color: S.textLight, marginRight: "6px" }}>{formatPriceWithCurrency(calculateShipping())}</span>
                              )}
                              <span style={{ color: appliedPromoCode === 'PEEL26FS' && promoCodeDiscount > 0 ? "#3a7a14" : S.dark }}>
                                {formatPriceWithCurrency(Math.max(0, calculateShipping() - (appliedPromoCode === 'PEEL26FS' ? promoCodeDiscount : 0)))}
                              </span>
                            </span>
                          </div>
                        )}
                        {appliedPromoCode && promoCodeDiscount > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "rgba(90,154,40,0.05)", borderRadius: "6px" }}>
                            <span style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 500, color: "#3a7a14" }}>{language === 'fr' ? 'Réduction' : 'Discount'}</span>
                            <span style={{ fontFamily: S.sans, fontSize: "0.82rem", fontWeight: 500, color: "#3a7a14" }}>-{formatPriceWithCurrency(promoCodeDiscount)}</span>
                          </div>
                        )}
                        <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: S.dark }}>{language === 'fr' ? 'Total' : 'Total'}</span>
                          <span style={{ fontFamily: S.serif, fontSize: "1.4rem", fontWeight: 300, color: S.dark }}>
                            {formatPriceWithCurrency(Math.max(0, getCartTotal() + (selectedShipping ? calculateShipping() : 0) - promoCodeDiscount))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── FORM (left) ── */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <form onSubmit={handlePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: "36px" }}>

                  {/* Contact */}
                  <div>
                    <h2 style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: S.textMid, marginBottom: "4px" }}>
                      {language === 'fr' ? 'Informations de contact' : 'Contact Information'}
                    </h2>
                    <p style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 300, color: S.textLight, marginBottom: "16px" }}>
                      {language === 'fr' ? 'Nous vous enverrons un email de confirmation' : "We'll send you a confirmation email"}
                    </p>
                    <label style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: S.textMid, display: "block", marginBottom: "6px" }}>
                      {getTranslation(language, 'checkout.email') || 'Email'}
                    </label>
                    <input type="email" name="email" id="checkout-email" autoComplete="email" inputMode="email"
                      value={formData.email} onChange={handleInputChange} onBlur={handleBlur}
                      placeholder={language === 'fr' ? 'votre@email.com' : 'your@email.com'}
                      className={inputClass(errors.email)} required data-1p-ignore />
                    {errors.email && <p style={{ fontFamily: S.sans, fontSize: "0.65rem", color: "#dc2626", marginTop: "6px" }}>{errors.email}</p>}
                  </div>

                  {/* Name */}
                  <div>
                    <h2 style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: S.textMid, marginBottom: "16px" }}>
                      {language === 'fr' ? 'Nom' : 'Name'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: S.textMid, display: "block", marginBottom: "6px" }}>
                          {getTranslation(language, 'checkout.firstName') || 'First Name'}
                        </label>
                        <input type="text" name="firstName" id="checkout-firstName" autoComplete="given-name"
                          value={formData.firstName} onChange={handleInputChange}
                          placeholder={getTranslation(language, 'checkout.firstName') || 'First name'}
                          className={inputClass(errors.firstName)} required data-1p-ignore />
                        {errors.firstName && <p style={{ fontFamily: S.sans, fontSize: "0.65rem", color: "#dc2626", marginTop: "6px" }}>{errors.firstName}</p>}
                      </div>
                      <div>
                        <label style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: S.textMid, display: "block", marginBottom: "6px" }}>
                          {getTranslation(language, 'checkout.lastName') || 'Last Name'}
                        </label>
                        <input type="text" name="lastName" id="checkout-lastName" autoComplete="family-name"
                          value={formData.lastName} onChange={handleInputChange}
                          placeholder={getTranslation(language, 'checkout.lastName') || 'Last name'}
                          className={inputClass(errors.lastName)} required data-1p-ignore />
                        {errors.lastName && <p style={{ fontFamily: S.sans, fontSize: "0.65rem", color: "#dc2626", marginTop: "6px" }}>{errors.lastName}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h2 style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: S.textMid, marginBottom: "4px" }}>
                      {language === 'fr' ? 'Adresse de livraison' : 'Shipping Address'}
                    </h2>
                    <p style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 300, color: S.textLight, marginBottom: "16px" }}>
                      {language === 'fr' ? 'Où devons-nous envoyer votre commande?' : 'Where should we send your order?'}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div>
                        <label style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: S.textMid, display: "block", marginBottom: "6px" }}>
                          {getTranslation(language, 'checkout.streetAddress') || 'Street Address'}
                        </label>
                        <input type="text" name="address" id="checkout-address" autoComplete="shipping street-address"
                          value={formData.address} onChange={handleInputChange}
                          placeholder="123 Main St" className={inputClass(errors.address)} required data-1p-ignore />
                        {errors.address && <p style={{ fontFamily: S.sans, fontSize: "0.65rem", color: "#dc2626", marginTop: "6px" }}>{errors.address}</p>}
                      </div>

                      <div>
                        <label style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: S.textMid, display: "block", marginBottom: "6px" }}>
                          {language === 'fr' ? 'Pays' : 'Country'}
                        </label>
                        <select name="country" id="checkout-country" autoComplete="shipping country"
                          value={formData.country} onChange={handleInputChange}
                          className={inputClass(errors.country)} required data-1p-ignore>
                          <option value="Canada">Canada</option>
                        </select>
                        {errors.country && <p style={{ fontFamily: S.sans, fontSize: "0.65rem", color: "#dc2626", marginTop: "6px" }}>{errors.country}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: S.textMid, display: "block", marginBottom: "6px" }}>
                            {getTranslation(language, 'checkout.city') || 'City'}
                          </label>
                          <input type="text" name="city" id="checkout-city" autoComplete="shipping address-level2"
                            value={formData.city} onChange={handleInputChange}
                            placeholder="City" className={inputClass(errors.city)} required data-1p-ignore />
                          {errors.city && <p style={{ fontFamily: S.sans, fontSize: "0.65rem", color: "#dc2626", marginTop: "6px" }}>{errors.city}</p>}
                        </div>
                        <div>
                          <label style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: S.textMid, display: "block", marginBottom: "6px" }}>
                            {language === 'fr' ? 'Province' : 'Province'}
                          </label>
                          <select name="province" id="checkout-province" autoComplete="shipping address-level1"
                            value={formData.province} onChange={handleInputChange}
                            className={inputClass(errors.province)} required data-1p-ignore>
                            <option value="">{language === 'fr' ? 'Sélectionner la province' : 'Select province'}</option>
                            {canadianProvinces.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          {errors.province && <p style={{ fontFamily: S.sans, fontSize: "0.65rem", color: "#dc2626", marginTop: "6px" }}>{errors.province}</p>}
                        </div>
                        <div>
                          <label style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: S.textMid, display: "block", marginBottom: "6px" }}>
                            {getTranslation(language, 'checkout.postalCode') || 'Postal Code'}
                          </label>
                          <input type="text" name="postalCode" id="checkout-postalCode"
                            autoComplete="shipping postal-code"
                            value={formData.postalCode} onChange={handleInputChange} onBlur={handleBlur}
                            inputMode="text"
                            maxLength={7}
                            placeholder="A1A 1A1"
                            className={inputClass(errors.postalCode)} required data-1p-ignore />
                          {errors.postalCode && <p style={{ fontFamily: S.sans, fontSize: "0.65rem", color: "#dc2626", marginTop: "6px" }}>{errors.postalCode}</p>}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: S.textMid, display: "block", marginBottom: "6px" }}>
                          {language === 'fr' ? 'Téléphone' : 'Phone Number'}
                        </label>
                        <input type="tel" inputMode="tel" name="phone" id="checkout-phone" autoComplete="tel"
                          value={formData.phone} onChange={handleInputChange} onBlur={handleBlur} maxLength={14}
                          placeholder="(555) 123-4567"
                          className={inputClass(errors.phone)} required data-1p-ignore />
                        {errors.phone && <p style={{ fontFamily: S.sans, fontSize: "0.65rem", color: "#dc2626", marginTop: "6px" }}>{errors.phone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: S.textMid, display: "block", marginBottom: "6px" }}>
                      {getTranslation(language, 'checkout.orderNotes') || 'Order Notes (Optional)'}
                    </label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3"
                      placeholder={getTranslation(language, 'checkout.orderNotesPlaceholder') || 'Special delivery instructions or notes...'}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: `1px solid ${S.border}`, background: "#fff", fontFamily: S.sans, fontSize: "0.8rem", fontWeight: 300, color: S.dark, resize: "none", outline: "none" }} />
                  </div>

                  {/* Shipping options */}
                  {hasEnteredShippingDetails && formData.postalCode && formData.province && formData.city && formData.country && (
                    <div>
                      <h2 style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: S.textMid, marginBottom: "4px" }}>
                        {getTranslation(language, 'checkout.shippingMethod') || 'Shipping Method'}
                      </h2>
                      <p style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 300, color: S.textLight, marginBottom: "16px" }}>
                        {language === 'fr' ? 'Choisissez votre méthode de livraison préférée' : 'Choose your preferred shipping method'}
                      </p>

                      {loadingShipping && <LoadingSpinner size="sm" color="amber" text={getTranslation(language, 'checkout.calculatingShipping')} />}

                      {shippingError && (
                        <div style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
                          <p style={{ fontFamily: S.sans, fontSize: "0.75rem", color: "#dc2626", marginBottom: "10px" }}>{shippingError}</p>
                          <button type="button" onClick={() => fetchShippingRates()}
                            style={{ fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500, color: "#dc2626", background: "rgba(220,38,38,0.08)", border: "none", borderRadius: "6px", padding: "6px 14px", cursor: "pointer" }}>
                            {language === 'fr' ? 'Réessayer' : 'Try again'}
                          </button>
                        </div>
                      )}

                      {!loadingShipping && shippingOptions.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {shippingOptions.map(option => (
                            <label key={option.id}
                              style={{
                                display: "flex", alignItems: "center", gap: "14px",
                                padding: "16px 20px", borderRadius: "10px", cursor: "pointer",
                                border: selectedShipping?.id === option.id ? `1.5px solid rgba(200,90,8,0.5)` : `1.5px solid ${S.border}`,
                                background: selectedShipping?.id === option.id ? "rgba(200,90,8,0.04)" : "#fff",
                                transition: "border-color 0.2s",
                              }}
                            >
                              <input type="radio" name="shipping" value={option.id}
                                checked={selectedShipping?.id === option.id}
                                onChange={() => setSelectedShipping(option)}
                                style={{ accentColor: S.orange }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                                  <span style={{ fontFamily: S.sans, fontSize: "0.82rem", fontWeight: 400, color: S.dark }}>{option.name}</span>
                                  <span style={{ fontFamily: S.sans, fontSize: "0.82rem", fontWeight: 400, color: S.dark }}>{formatPriceWithCurrency(option.price)}</span>
                                </div>
                                <p style={{ fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 300, color: S.textLight }}>
                                  {option.estimatedDays} {getTranslation(language, 'checkout.businessDays') || 'business days'}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {!loadingShipping && shippingOptions.length === 0 && !shippingError && (
                        <div style={{ background: "rgba(200,90,8,0.04)", border: `1px solid rgba(200,90,8,0.15)`, borderRadius: "10px", padding: "24px", textAlign: "center" }}>
                          <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid, marginBottom: "14px" }}>
                            {language === 'fr' ? 'Cliquez pour calculer les tarifs d\'expédition.' : 'Click below to calculate shipping rates.'}
                          </p>
                          <button type="button" onClick={() => fetchShippingRates()}
                            style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: S.orange, color: "#fff", fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                            {language === 'fr' ? 'Calculer' : 'Calculate shipping'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit */}
                  <div style={{ paddingTop: "8px", borderTop: `1px solid ${S.border}` }}>
                    {stripeError && (
                      <div style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
                        <p style={{ fontFamily: S.sans, fontSize: "0.75rem", color: "#dc2626" }}>{stripeError}</p>
                      </div>
                    )}

                    <button type="submit" disabled={isSubmitting || !hasEnteredShippingDetails || !selectedShipping}
                      style={{
                        width: "100%", padding: "18px", borderRadius: "12px", border: "none",
                        background: (isSubmitting || !hasEnteredShippingDetails || !selectedShipping)
                          ? "rgba(15,10,4,0.1)"
                          : "linear-gradient(135deg,#f5e6a3 0%,#e8c84a 55%,#d4a832 100%)",
                        fontFamily: S.sans, fontSize: "0.76rem", fontWeight: 500,
                        letterSpacing: "0.18em", textTransform: "uppercase",
                        color: (isSubmitting || !hasEnteredShippingDetails || !selectedShipping) ? S.textLight : S.dark,
                        cursor: (isSubmitting || !hasEnteredShippingDetails || !selectedShipping) ? "not-allowed" : "pointer",
                        boxShadow: (isSubmitting || !hasEnteredShippingDetails || !selectedShipping) ? "none" : "0 6px 24px rgba(232,200,74,0.28)",
                        transition: "all 0.2s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                      }}
                    >
                      {isSubmitting ? (
                        <LoadingSpinner size="sm" color="dark" text={getTranslation(language, 'checkout.processing')} />
                      ) : (
                        hasEnteredShippingDetails && selectedShipping
                          ? `${language === 'fr' ? 'Payer' : 'Pay'} ${formatPriceWithCurrency(totalCAD)}`
                          : (language === 'fr' ? 'Continuer' : 'Continue')
                      )}
                    </button>

                    {import.meta.env.DEV && (
                      <p style={{ fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 400, color: S.textMid, textAlign: "center", marginTop: "12px" }}>
                        <button type="button" onClick={handleDevFreeOrder}
                          style={{ background: "none", border: "none", cursor: "pointer", color: S.orange, textDecoration: "underline", fontFamily: "inherit", fontSize: "inherit", padding: 0 }}
                        >
                          {getTranslation(language, 'checkout.devCompleteFreeOrder') || 'Complete free test order (no payment, dev only)'}
                        </button>
                      </p>
                    )}

                    <p style={{ fontFamily: S.sans, fontSize: "0.62rem", fontWeight: 300, color: S.textLight, textAlign: "center", marginTop: "14px", lineHeight: 1.6 }}>
                      {language === 'fr' ? <>En continuant, vous acceptez nos <a href="/terms" onClick={e => { e.preventDefault(); window.history.pushState({ page: "/terms" }, "", "/terms"); window.dispatchEvent(new Event("hashchange")) }} style={{ color: S.orange }}>conditions d'utilisation</a> et notre <a href="/privacy" onClick={e => { e.preventDefault(); window.history.pushState({ page: "/privacy" }, "", "/privacy"); window.dispatchEvent(new Event("hashchange")) }} style={{ color: S.orange }}>politique de confidentialité</a></>
                        : <>By continuing, you agree to our <a href="/terms" onClick={e => { e.preventDefault(); window.history.pushState({ page: "/terms" }, "", "/terms"); window.dispatchEvent(new Event("hashchange")) }} style={{ color: S.orange }}>terms of service</a> and <a href="/privacy" onClick={e => { e.preventDefault(); window.history.pushState({ page: "/privacy" }, "", "/privacy"); window.dispatchEvent(new Event("hashchange")) }} style={{ color: S.orange }}>privacy policy</a></>
                      }
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "10px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={S.textLight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span style={{ fontFamily: S.sans, fontSize: "0.6rem", fontWeight: 300, color: S.textLight }}>
                        {language === 'fr' ? 'Paiement sécurisé par Stripe' : 'Secured by Stripe'}
                      </span>
                    </div>
                  </div>

                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Confirmation ── */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto text-center">
            <div style={{ background: "#fff", borderRadius: "18px", border: `1px solid ${S.border}`, overflow: "hidden", boxShadow: "0 16px 48px rgba(15,10,4,0.08)" }}>

              {/* Header */}
              <div style={{ background: "linear-gradient(135deg,#1a1208 0%,#2a1e08 100%)", padding: "40px 40px 36px", textAlign: "center" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  border: "1px solid rgba(232,200,74,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8c84a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 style={{ fontFamily: S.serif, fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 300, fontStyle: "italic", color: "#f5f0e8", marginBottom: "8px" }}>
                  {getTranslation(language, 'checkout.orderConfirmed')}
                </h1>
                <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: "rgba(245,240,232,0.6)", letterSpacing: "0.05em" }}>
                  {getTranslation(language, 'checkout.thankYou')}{customerInfo.name ? `, ${customerInfo.name.split(' ')[0]}` : ''}
                </p>
              </div>

              {/* Body */}
              <div style={{ padding: "40px" }}>
                <div style={{ background: S.creamDark, borderRadius: "12px", padding: "24px", marginBottom: "28px" }}>
                  <p style={{ fontFamily: S.sans, fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: S.textLight, marginBottom: "8px" }}>
                    {getTranslation(language, 'checkout.orderNumber')}
                  </p>
                  <p style={{ fontFamily: S.serif, fontSize: "2rem", fontWeight: 300, fontStyle: "italic", color: S.dark }}>
                    {orderNumber || <span style={{ color: S.textLight, fontStyle: "italic" }}>{language === 'fr' ? 'Chargement...' : 'Loading...'}</span>}
                  </p>
                </div>

                {customerInfo.email && (
                  <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid, lineHeight: 1.7, marginBottom: "32px" }}>
                    {getTranslation(language, 'checkout.confirmationEmail')} <strong style={{ color: S.dark }}>{customerInfo.email}</strong> {getTranslation(language, 'checkout.confirmationEmailSuffix')}
                  </p>
                )}

                <button onClick={() => { window.history.pushState({ page: "/" }, "", "/"); window.dispatchEvent(new Event("hashchange")) }}
                  style={{
                    width: "100%", maxWidth: "360px", padding: "16px 32px",
                    borderRadius: "12px", border: "none",
                    background: "linear-gradient(135deg,#f5e6a3 0%,#e8c84a 55%,#d4a832 100%)",
                    fontFamily: S.sans, fontSize: "0.74rem", fontWeight: 500,
                    letterSpacing: "0.18em", textTransform: "uppercase", color: S.dark,
                    cursor: "pointer", boxShadow: "0 6px 24px rgba(232,200,74,0.28)",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  {getTranslation(language, 'checkout.continueShopping')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}