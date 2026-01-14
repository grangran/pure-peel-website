// Google Analytics 4 utility functions

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

// Load Google Analytics script dynamically
const loadGAScript = () => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return

  // Check if script is already loaded
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
    return
  }

  // Load gtag.js script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  // Initialize GA once script loads
  script.onload = () => {
    if (window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
        page_title: document.title
      })
    }
  }
}

// Initialize GA script loading
if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
  // Load script when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGAScript)
  } else {
    loadGAScript()
  }
}

// Check if GA is available and enabled
const isGAEnabled = () => {
  return GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag
}

// Initialize Google Analytics (called from index.html script)
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    if (import.meta.env.DEV) {
      console.log('Google Analytics: Measurement ID not configured')
    }
    return
  }

  // gtag is loaded from the script in index.html
  if (typeof window !== 'undefined' && window.gtag) {
    const deviceType = getDeviceType()
    const isMobileDevice = isMobile()

    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
      page_title: document.title,
      page_location: window.location.href,
      // Track device information
      custom_map: {
        dimension1: 'device_type',
        dimension2: 'is_mobile'
      }
    })

    // Send initial page view with device info
    window.gtag('event', 'page_view', {
      device_type: deviceType,
      is_mobile: isMobileDevice ? 'yes' : 'no',
      screen_width: window.innerWidth,
      screen_height: window.innerHeight
    })

    if (import.meta.env.DEV) {
      console.log('GA Initialized:', { deviceType, isMobile: isMobileDevice })
    }
  }
}

// Detect device type
const getDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// Detect if user is on mobile
const isMobile = () => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
}

// Track page view
export const trackPageView = (url, title) => {
  if (!isGAEnabled()) return

  const deviceType = getDeviceType()
  const isMobileDevice = isMobile()

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title,
    page_location: window.location.href,
    custom_map: {
      dimension1: 'device_type',
      dimension2: 'is_mobile'
    }
  })

  // Track device type as custom dimension
  window.gtag('event', 'page_view', {
    device_type: deviceType,
    is_mobile: isMobileDevice ? 'yes' : 'no',
    screen_width: window.innerWidth,
    screen_height: window.innerHeight
  })

  if (import.meta.env.DEV) {
    console.log('GA Page View:', { url, title, deviceType, isMobile: isMobileDevice })
  }
}

// Track custom event
export const trackEvent = (eventName, parameters = {}) => {
  if (!isGAEnabled()) return

  const deviceType = getDeviceType()
  const isMobileDevice = isMobile()

  window.gtag('event', eventName, {
    ...parameters,
    page_location: window.location.href,
    page_title: document.title,
    device_type: deviceType,
    is_mobile: isMobileDevice ? 'yes' : 'no',
    screen_width: typeof window !== 'undefined' ? window.innerWidth : 0,
    screen_height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  if (import.meta.env.DEV) {
    console.log('GA Event:', eventName, { ...parameters, deviceType, isMobile: isMobileDevice })
  }
}

// Track product view
export const trackProductView = (product) => {
  if (!isGAEnabled()) return

  const eventData = {
    currency: 'CAD',
    value: product.price || 0,
    items: [{
      item_id: product.id,
      item_name: `${product.name} - ${product.variant || ''}`,
      item_category: 'Dehydrated Citrus',
      item_brand: 'Pure Peel Co.',
      price: product.price || 0,
      quantity: 1
    }]
  }

  trackEvent('view_item', eventData)
}

// Track add to cart
export const trackAddToCart = (product) => {
  if (!isGAEnabled()) return

  const eventData = {
    currency: 'CAD',
    value: (product.price || 0) * (product.quantity || 1),
    items: [{
      item_id: product.id,
      item_name: `${product.name} - ${product.variant || ''}`,
      item_category: 'Dehydrated Citrus',
      item_brand: 'Pure Peel Co.',
      price: product.price || 0,
      quantity: product.quantity || 1
    }]
  }

  trackEvent('add_to_cart', eventData)
}

// Track remove from cart
export const trackRemoveFromCart = (product) => {
  if (!isGAEnabled()) return

  const eventData = {
    currency: 'CAD',
    value: (product.price || 0) * (product.quantity || 1),
    items: [{
      item_id: product.id,
      item_name: `${product.name} - ${product.variant || ''}`,
      item_category: 'Dehydrated Citrus',
      item_brand: 'Pure Peel Co.',
      price: product.price || 0,
      quantity: product.quantity || 1
    }]
  }

  trackEvent('remove_from_cart', eventData)
}

// Track checkout started
export const trackCheckoutStarted = (cartItems, total) => {
  if (!isGAEnabled()) return

  const items = cartItems.map(item => ({
    item_id: item.id,
    item_name: `${item.name} - ${item.variant || ''}`,
    item_category: 'Dehydrated Citrus',
    item_brand: 'Pure Peel Co.',
    price: item.price || 0,
    quantity: item.quantity || 1
  }))

  const eventData = {
    currency: 'CAD',
    value: total || 0,
    items: items
  }

  trackEvent('begin_checkout', eventData)
}

// Track purchase completed
export const trackPurchase = (order) => {
  if (!isGAEnabled()) return

  const items = (order.items || []).map(item => ({
    item_id: item.id || `${item.name}-${item.variant}`,
    item_name: `${item.name} - ${item.variant || ''}`,
    item_category: 'Dehydrated Citrus',
    item_brand: 'Pure Peel Co.',
    price: item.price || 0,
    quantity: item.quantity || 1
  }))

  const eventData = {
    transaction_id: order.id || order.stripeSessionId || `PP-${Date.now()}`,
    value: order.total || 0,
    currency: order.currency || 'CAD',
    tax: order.tax || 0,
    shipping: order.shippingCost || 0,
    items: items
  }

  trackEvent('purchase', eventData)
}

// Track contact form submission
export const trackContactFormSubmit = () => {
  trackEvent('contact_form_submit', {
    form_name: 'contact'
  })
}

// Track newsletter signup (for future use)
export const trackNewsletterSignup = () => {
  trackEvent('newsletter_signup', {
    method: 'website'
  })
}

// Ensure gtag is available globally (already set in index.html, but ensure it exists)
if (typeof window !== 'undefined' && !window.gtag) {
  window.dataLayer = window.dataLayer || []
  window.gtag = function() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
}

