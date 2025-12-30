import { useState, useEffect } from "react"
import { useCart } from "./context/CartContext"
import Nav from "./components/Nav"
import Hero from "./components/Hero"
import About from "./components/About"
import Products from "./components/Products"
import Lifestyle from "./components/Lifestyle"
import Contact from "./components/Contact"
import Footer from "./components/Footer"
import Cart from "./components/Cart"
import SEO from "./components/SEO"
import StructuredData from "./components/StructuredData"
import Orange from "./pages/Orange"
import PinkOrange from "./pages/PinkOrange"
import Lime from "./pages/Lime"
import Checkout from "./pages/Checkout"
import Admin from "./pages/Admin"
import OrderTracking from "./pages/OrderTracking"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import ShippingReturns from "./pages/ShippingReturns"
import NotFound from "./pages/NotFound"
import { seoData, organizationData } from "./utils/seoData"
import { trackPageView } from "./utils/analytics"

export default function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const { isCartOpen, setIsCartOpen } = useCart()

  useEffect(() => {
    // Handle browser navigation
    const handleRoute = () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:31',message:'Route handler called',data:{pathname:window.location.pathname,search:window.location.search,historyLength:window.history.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      const path = window.location.pathname
      const normalizedPath = path.replace(/\/$/, '') // Remove trailing slash
      
      // List of valid routes
      const validRoutes = [
        '/',
        '/orange',
        '/pink-orange',
        '/lime',
        '/checkout',
        '/admin',
        '/order-tracking',
        '/privacy',
        '/shipping-returns'
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
      } else if (normalizedPath === "/checkout" || normalizedPath === "/checkout.html") {
        // Always set to checkout, regardless of query parameters
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:61',message:'Setting page to checkout',data:{normalizedPath,search:window.location.search},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        setCurrentPage("checkout")
      } else if (normalizedPath === "/admin" || normalizedPath === "/admin.html") {
        setCurrentPage("admin")
      } else if (normalizedPath === "/order-tracking" || normalizedPath === "/order-tracking.html") {
        setCurrentPage("order-tracking")
      } else if (normalizedPath === "/privacy" || normalizedPath === "/privacy.html") {
        setCurrentPage("privacy")
      } else if (normalizedPath === "/shipping-returns" || normalizedPath === "/shipping-returns.html") {
        setCurrentPage("shipping-returns")
      } else {
        // Invalid route - show 404
        setCurrentPage("not-found")
      }
    }

    // Handle initial route and Stripe redirects
    handleRoute()
    window.addEventListener("popstate", handleRoute)
    
    // Also handle hash changes (some redirects use hash)
    window.addEventListener("hashchange", handleRoute)

    // Intercept link clicks
    const handleClick = (e) => {
      const link = e.target.closest("a")
      if (link && link.href) {
        const url = new URL(link.href)
        if (url.origin === window.location.origin) {
          e.preventDefault()
          window.history.pushState({}, "", url.pathname)
          handleRoute()
        }
      }
    }

    document.addEventListener("click", handleClick)

    return () => {
      window.removeEventListener("popstate", handleRoute)
      document.removeEventListener("click", handleClick)
    }
  }, [])

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
      case "not-found":
        return seoData.notFound
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
  if (currentPage === "orange") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav />
        <Orange />
        <Footer />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "pink-orange") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav />
        <PinkOrange />
        <Footer />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "lime") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav />
        <Lime />
        <Footer />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "checkout") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav />
        <Checkout />
        <Footer />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "admin") {
    return (
      <>
        <SEO {...currentSEO} />
        <Admin />
      </>
    )
  }

  if (currentPage === "order-tracking") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav />
        <OrderTracking />
        <Footer />
      </>
    )
  }

  if (currentPage === "privacy") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav />
        <PrivacyPolicy />
        <Footer />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "shipping-returns") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav />
        <ShippingReturns />
        <Footer />
        {CartComponent}
      </>
    )
  }

  if (currentPage === "not-found") {
    return (
      <>
        <SEO {...currentSEO} />
        <Nav />
        <NotFound />
        <Footer />
        {CartComponent}
      </>
    )
  }

  // Home page
  return (
    <>
      <SEO {...currentSEO} />
      <StructuredData data={organizationData} />
      <Nav />
      <Hero />
      <Products />
      <Lifestyle />
      <About />
      <Contact />
      <Footer />
      {CartComponent}
    </>
  )
}

