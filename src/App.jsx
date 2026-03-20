import { useState, useEffect, useRef } from "react"
import { useCart } from "./context/CartContext"
import Nav from "./components/Nav"
import Hero from "./components/Hero"
import WhyPurePeel from "./components/WhyPurePeel"
import EmailCapture from "./components/EmailCapture"
import EmailPopup from "./components/EmailPopup"
import AboutTeaser from "./components/AboutTeaser"
import About from "./pages/About"
import Products from "./components/Products"
import ContactPage from "./pages/Contact"
import Footer from "./components/Footer"
import Cart from "./components/Cart"
import SEO from "./components/SEO"
import StructuredData from "./components/StructuredData"
import Orange from "./pages/Orange"
import PinkOrange from "./pages/PinkOrange"
import Lime from "./pages/Lime"
import Lemon from "./pages/Lemon"
import Apple from "./pages/Apple"
import Checkout from "./pages/Checkout"
import Admin from "./pages/Admin"
import OrderTracking from "./pages/OrderTracking"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import ShippingReturns from "./pages/ShippingReturns"
import TermsOfService from "./pages/TermsOfService"
import FAQ from "./pages/FAQ"
import NotFound from "./pages/NotFound"
import Unsubscribe from "./pages/Unsubscribe"
import { seoData, organizationData } from "./utils/seoData"
import { trackPageView } from "./utils/analytics"

// Helper function to get initial page from pathname
const getInitialPage = () => {
  const path = window.location.pathname.replace(/\/$/, '')
  if (path === "/" || path === "" || path === "/index.html") {
    return "home"
  } else if (path === "/orange" || path === "/orange.html") {
    return "orange"
  } else if (path === "/pink-orange" || path === "/pink-orange.html") {
    return "pink-orange"
  } else if (path === "/lime" || path === "/lime.html") {
    return "lime"
  } else if (path === "/lemon" || path === "/lemon.html") {
    return "lemon"
  } else if (path === "/apple" || path === "/apple.html") {
    return "apple"
  } else if (path === "/checkout" || path === "/checkout.html") {
    return "checkout"
  } else if (path === "/admin" || path === "/admin.html") {
    return "admin"
  } else if (path === "/order-tracking" || path === "/order-tracking.html") {
    return "order-tracking"
  } else if (path === "/privacy" || path === "/privacy.html") {
    return "privacy"
  } else if (path === "/shipping-returns" || path === "/shipping-returns.html") {
    return "shipping-returns"
  } else if (path === "/terms" || path === "/terms.html" || path === "/terms-of-service" || path === "/terms-of-service.html") {
    return "terms"
  } else if (path === "/contact" || path === "/contact.html") {
    return "contact"
  } else if (path === "/faq" || path === "/faq.html") {
    return "faq"
  } else if (path === "/about" || path === "/about.html") {
    return "about"
  } else if (path === "/unsubscribe" || path === "/unsubscribe.html") {
    return "unsubscribe"
  } else {
    return "not-found"
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(getInitialPage)
  // Use timestamp instead of counter to ensure unique keys even with rapid navigation
  const [navigationKey, setNavigationKey] = useState(() => Date.now())
  const navigationKeyRef = useRef(Date.now())
  const { isCartOpen, setIsCartOpen } = useCart()

  useEffect(() => {
    // Handle browser navigation
    const handleRoute = (event) => {
      const path = window.location.pathname
      const normalizedPath = path.replace(/\/$/, '') // Remove trailing slash
      
      // List of valid routes
      const validRoutes = [
        '/',
        '/orange',
        '/pink-orange',
        '/lime',
        '/lemon',
        '/apple',
        '/checkout',
        '/admin',
        '/order-tracking',
        '/privacy',
        '/shipping-returns',
        '/terms',
        '/terms-of-service',
        '/contact',
        '/faq'
      ]
      
      // Check if path is a valid route (ignore query parameters)
      const isValidRoute = validRoutes.includes(normalizedPath) || 
                          normalizedPath.endsWith('.html') ||
                          normalizedPath === ''
      
      if (normalizedPath === "/" || normalizedPath === "" || normalizedPath === "/index.html") {
        setCurrentPage("home")
      } else if (normalizedPath === "/orange" || normalizedPath === "/orange.html") {
        setCurrentPage("orange")
      } else if (normalizedPath === "/pink-orange" || normalizedPath === "/pink-orange.html") {
        setCurrentPage("pink-orange")
      } else if (normalizedPath === "/lime" || normalizedPath === "/lime.html") {
        setCurrentPage("lime")
      } else if (normalizedPath === "/lemon" || normalizedPath === "/lemon.html") {
        setCurrentPage("lemon")
      } else if (normalizedPath === "/apple" || normalizedPath === "/apple.html") {
        setCurrentPage("apple")
      } else if (normalizedPath === "/checkout" || normalizedPath === "/checkout.html") {
        // Always set to checkout, regardless of query parameters
        setCurrentPage("checkout")
      } else if (normalizedPath === "/admin" || normalizedPath === "/admin.html") {
        setCurrentPage("admin")
      } else if (normalizedPath === "/order-tracking" || normalizedPath === "/order-tracking.html") {
        setCurrentPage("order-tracking")
      } else if (normalizedPath === "/privacy" || normalizedPath === "/privacy.html") {
        setCurrentPage("privacy")
      } else if (normalizedPath === "/shipping-returns" || normalizedPath === "/shipping-returns.html") {
        setCurrentPage("shipping-returns")
      } else if (normalizedPath === "/terms" || normalizedPath === "/terms.html" || normalizedPath === "/terms-of-service" || normalizedPath === "/terms-of-service.html") {
        setCurrentPage("terms")
      } else if (normalizedPath === "/contact" || normalizedPath === "/contact.html") {
        setCurrentPage("contact")
      } else if (normalizedPath === "/faq" || normalizedPath === "/faq.html") {
        setCurrentPage("faq")
      } else if (normalizedPath === "/about" || normalizedPath === "/about.html") {
        setCurrentPage("about")
      } else if (normalizedPath === "/unsubscribe" || normalizedPath === "/unsubscribe.html") {
        setCurrentPage("unsubscribe")
      } else {
        // Invalid route - show 404
        setCurrentPage("not-found")
      }
      
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'instant' })
      
      // Update navigation key with timestamp + microsecond precision to force complete remount
      // Using performance.now() for higher precision than Date.now() to ensure uniqueness
      // even with rapid back/forward navigation
      // Update ref immediately and state synchronously to ensure React sees the change
      const newKey = performance.now()
      navigationKeyRef.current = newKey
      setNavigationKey(newKey)
    }

    // Handle initial route and Stripe redirects
    handleRoute()
    
    // Listen for browser back/forward - browser fires popstate automatically
    // Use a flag to prevent multiple rapid calls from batching
    let isNavigating = false
    window.addEventListener("popstate", (e) => {
      if (isNavigating) return // Prevent rapid-fire calls
      isNavigating = true
      // Process immediately - browser has already updated the URL
      handleRoute(e)
      // Reset flag after a brief delay to allow next navigation
      setTimeout(() => {
        isNavigating = false
      }, 50)
    })
    
    // Handle browser back/forward cache (bfcache) restoration
    // When browser restores a page from cache, we need to re-initialize
    const handlePageShow = (e) => {
      // If page was restored from bfcache, force a route update
      if (e.persisted) {
        // Force remount by updating navigation key with new timestamp
        setNavigationKey(Date.now())
        // Re-run route handler to ensure correct page is displayed
        handleRoute()
      }
    }
    window.addEventListener("pageshow", handlePageShow)
    
    // Also handle hash changes (some redirects use hash)
    window.addEventListener("hashchange", handleRoute)

    // Intercept link clicks
    const handleClick = (e) => {
      const link = e.target.closest("a")
      if (link && link.href) {
        const url = new URL(link.href)
        if (url.origin === window.location.origin) {
          e.preventDefault()
          // Push state and update route - browser will handle popstate naturally
          window.history.pushState({ page: url.pathname }, "", url.pathname)
          handleRoute()
        }
      }
    }

    document.addEventListener("click", handleClick)

    return () => {
      window.removeEventListener("popstate", handleRoute)
      window.removeEventListener("hashchange", handleRoute)
      window.removeEventListener("pageshow", handlePageShow)
      document.removeEventListener("click", handleClick)
    }
  }, [])

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [currentPage])

  const CartComponent = <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

  // Get SEO data for current page
  const getSEOData = () => {
    switch (currentPage) {
      case "orange":
        return seoData.orange
      case "pink-orange":
        return seoData.pinkOrange
      case "lime":
        return seoData.lime
      case "lemon":
        return seoData.lemon
      case "apple":
        return seoData.apple
      case "checkout":
        return seoData.checkout
      case "admin":
        return seoData.admin
      case "order-tracking":
        return seoData.orderTracking
      case "privacy":
        return seoData.privacy
      case "shipping-returns":
        return seoData.shippingReturns
      case "terms":
        return seoData.terms
      case "faq":
        return seoData.faq
      case "not-found":
        return seoData.notFound
      case "unsubscribe":
        return seoData.unsubscribe
      default:
        return seoData.home
    }
  }

  const currentSEO = getSEOData()

  // Track page views when route changes
  useEffect(() => {
    const pageTitle = currentSEO.title || document.title
    const pageUrl = window.location.pathname + window.location.search
    trackPageView(pageUrl, pageTitle)
  }, [currentPage, currentSEO.title])

  // Render based on current page
  // Use key prop with currentPage to force remount when page changes, ensuring fresh state
  if (currentPage === "orange") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav key={`nav-${currentPage}-${navigationKey}`} />
        <Orange key={`orange-${currentPage}-${navigationKey}`} />
        <Footer key={`footer-${currentPage}-${navigationKey}`} />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "pink-orange") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav key={`nav-${currentPage}-${navigationKey}`} />
        <PinkOrange key={`pink-orange-${currentPage}-${navigationKey}`} />
        <Footer key={`footer-${currentPage}-${navigationKey}`} />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "lime") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav key={`nav-${currentPage}-${navigationKey}`} />
        <Lime key={`lime-${currentPage}-${navigationKey}`} />
        <Footer key={`footer-${currentPage}-${navigationKey}`} />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "lemon") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav key={`nav-${currentPage}-${navigationKey}`} />
        <Lemon key={`lemon-${currentPage}-${navigationKey}`} />
        <Footer key={`footer-${currentPage}-${navigationKey}`} />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "apple") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav key={`nav-${currentPage}-${navigationKey}`} />
        <Apple key={`apple-${currentPage}-${navigationKey}`} />
        <Footer key={`footer-${currentPage}-${navigationKey}`} />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "checkout") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav key={`nav-${currentPage}-${navigationKey}`} />
        <Checkout key={`checkout-${currentPage}-${navigationKey}`} />
        <Footer key={`footer-${currentPage}-${navigationKey}`} />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "admin") {
    return (
      <>
        <SEO {...currentSEO} />
        <Admin key={`admin-${currentPage}-${navigationKey}`} />
      </>
    )
  }

  if (currentPage === "order-tracking") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav key={`nav-${currentPage}-${navigationKey}`} />
        <OrderTracking key={`order-tracking-${currentPage}-${navigationKey}`} />
        <Footer key={`footer-${currentPage}-${navigationKey}`} />
      </>
    )
  }

  if (currentPage === "privacy") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav key={`nav-${currentPage}-${navigationKey}`} />
        <PrivacyPolicy key={`privacy-${currentPage}-${navigationKey}`} />
        <Footer key={`footer-${currentPage}-${navigationKey}`} />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "shipping-returns") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav key={`nav-${currentPage}-${navigationKey}`} />
        <ShippingReturns key={`shipping-returns-${currentPage}-${navigationKey}`} />
        <Footer key={`footer-${currentPage}-${navigationKey}`} />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "terms") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav key={`nav-${currentPage}-${navigationKey}`} />
        <TermsOfService key={`terms-${currentPage}-${navigationKey}`} />
        <Footer key={`footer-${currentPage}-${navigationKey}`} />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "contact") {
    return (
      <>
        <ContactPage key={`contact-${currentPage}-${navigationKey}`} />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "faq") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav key={`nav-${currentPage}-${navigationKey}`} />
        <FAQ key={`faq-${currentPage}-${navigationKey}`} />
        <Footer key={`footer-${currentPage}-${navigationKey}`} />
        {CartComponent}
      </>
    )
  }
  if (currentPage === "about") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav key={`nav-${currentPage}-${navigationKey}`} />
        <About key={`about-${currentPage}-${navigationKey}`} />
        <Footer key={`footer-${currentPage}-${navigationKey}`} />
      </>
    )
  }

  if (currentPage === "unsubscribe") {
    return (
      <>
        <SEO {...currentSEO} />
        <Unsubscribe key={`unsubscribe-${currentPage}-${navigationKey}`} />
      </>
    )
  }

  if (currentPage === "not-found") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav key={`nav-${currentPage}-${navigationKey}`} />
        <NotFound key={`not-found-${currentPage}-${navigationKey}`} />
        <Footer key={`footer-${currentPage}-${navigationKey}`} />
        {CartComponent}
      </>
    )
  }

  // Home page
  return (
    <>
      <SEO {...currentSEO} />
      <StructuredData data={organizationData} />
      <Nav key={`nav-${currentPage}-${navigationKey}`} />
      <Hero key={`hero-${currentPage}-${navigationKey}`} />
      <Products key={`products-${currentPage}-${navigationKey}`} />
      <WhyPurePeel key={`Why Pure Peel-${currentPage}-${navigationKey}`} />
      <AboutTeaser key={`about-teaser-${currentPage}-${navigationKey}`} />
      <EmailCapture key={`email-capture-${currentPage}-${navigationKey}`} />
      <EmailPopup key={`email-popup-${currentPage}-${navigationKey}`} />
      <Footer key={`footer-${currentPage}-${navigationKey}`} />
      {CartComponent}
    </>
  )
}

