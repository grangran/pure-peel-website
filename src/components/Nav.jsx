import { useState, useEffect } from "react"
import { useCart } from "../context/CartContext"

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [navHeight, setNavHeight] = useState(72)
  const { cartCount, isCartOpen, setIsCartOpen } = useCart()
  const [badgeUpdated, setBadgeUpdated] = useState(false)

  useEffect(() => {
    const nav = document.querySelector("nav")
    if (nav) {
      const updateNavHeight = () => {
        const height = nav.offsetHeight
        setNavHeight(height)
        document.documentElement.style.setProperty("--nav-height", `${height}px`)
      }
      updateNavHeight()
      window.addEventListener("resize", updateNavHeight)
      return () => window.removeEventListener("resize", updateNavHeight)
    }
  }, [])

  useEffect(() => {
    if (isMenuOpen || isCartOpen) {
      document.body.classList.add("menu-open")
    } else {
      document.body.classList.remove("menu-open")
    }
    return () => {
      document.body.classList.remove("menu-open")
    }
  }, [isMenuOpen, isCartOpen])

  useEffect(() => {
    if (cartCount > 0) {
      setBadgeUpdated(true)
      const timer = setTimeout(() => setBadgeUpdated(false), 300)
      return () => clearTimeout(timer)
    }
  }, [cartCount])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  const handleLinkClick = (e, targetId) => {
    e.preventDefault()
    closeMenu()
    const element = document.getElementById(targetId)
    if (element) {
      const offset = navHeight + 20
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({ top: offsetPosition, behavior: "smooth" })
    }
  }

  const handleShopLink = (e, product) => {
    e.preventDefault()
    closeMenu()
    window.history.pushState({}, "", `/${product}`)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  return (
    <nav className="sticky top-0 left-0 right-0 z-1000 h-[72px] bg-white border-b border-gray-200 shadow-sm">
      <div className="h-full max-w-6xl mx-auto px-5 flex items-center justify-between">
        {/* Logo */}
        <a 
          href="/" 
          className="flex items-center no-underline transition-all duration-200 hover:opacity-85 hover:scale-105 z-10"
          onClick={(e) => {
            e.preventDefault()
            window.history.pushState({}, "", "/")
            window.dispatchEvent(new PopStateEvent("popstate"))
          }}
        >
          <img src="/logo.png" alt="Pure Peel Co." className="h-[42px] w-auto max-w-[200px] block object-contain" />
        </a>

        {/* Right-side actions */}
        <div className="flex items-center gap-3">
          {/* Hamburger */}
          <button 
            className={`w-11 h-11 p-2 flex flex-col justify-center gap-1.5 bg-transparent border-0 cursor-pointer rounded-lg transition-all duration-150 hover:bg-black/5 active:scale-95 touch-manipulation ${
              isMenuOpen ? "is-open" : ""
            }`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className={`block w-[22px] h-0.5 bg-gray-900 rounded-sm transition-all duration-250 ${
              isMenuOpen ? "translate-y-2 rotate-45" : ""
            }`}></span>
            <span className={`block w-[22px] h-0.5 bg-gray-900 rounded-sm transition-opacity duration-200 ${
              isMenuOpen ? "opacity-0" : ""
            }`}></span>
            <span className={`block w-[22px] h-0.5 bg-gray-900 rounded-sm transition-all duration-250 ${
              isMenuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}></span>
          </button>

          {/* Cart Button */}
          <button 
            className="relative w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center bg-transparent border-0 cursor-pointer rounded-lg transition-all duration-150 hover:bg-black/5 active:scale-95 touch-manipulation" 
            aria-label={`Open cart${cartCount > 0 ? ` (${cartCount} items)` : ""}`}
            onClick={() => {
              setIsCartOpen(true)
              closeMenu()
            }}
          >
            <svg
              className="w-8 h-8 text-gray-900 transition-all duration-250 group-hover:-translate-y-0.5 group-hover:text-amber-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"></path>
            </svg>
            {cartCount > 0 && (
              <span className={`absolute top-1 right-1 min-w-[22px] h-[22px] px-1.5 bg-amber-500 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center pointer-events-none transition-all duration-300 animate-badgeAppear ${
                badgeUpdated ? "animate-badgeBounce" : ""
              }`}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-998 transition-opacity duration-250"
          onClick={closeMenu}
        />
      )}
      <div 
        className={`fixed top-[72px] right-0 sm:right-5 w-full sm:w-[340px] max-h-[calc(100vh-72px)] sm:max-h-[calc(100vh-72px-24px)] bg-white sm:rounded-2xl shadow-2xl overflow-y-auto z-999 transition-all duration-250 ${
          isMenuOpen 
            ? "opacity-100 pointer-events-auto translate-y-0" 
            : "opacity-0 pointer-events-none -translate-y-2"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeMenu()
          }
        }}
      >
        <div className="p-7">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest text-gray-400 mb-3.5 block">Shop</span>
            <a 
              href="/orange" 
              className="block relative py-3 text-gray-900 text-base font-medium no-underline transition-all hover:text-amber-500 after:content-[''] after:absolute after:left-0 after:bottom-1 after:w-full after:h-0.5 after:bg-amber-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100"
              onClick={(e) => handleShopLink(e, "orange")}
            >
              Orange
            </a>
            <a 
              href="/pink-orange" 
              className="block relative py-3 text-gray-900 text-base font-medium no-underline transition-all hover:text-amber-500 after:content-[''] after:absolute after:left-0 after:bottom-1 after:w-full after:h-0.5 after:bg-amber-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100"
              onClick={(e) => handleShopLink(e, "pink-orange")}
            >
              Pink Orange
            </a>
            <a 
              href="/lime" 
              className="block relative py-3 text-gray-900 text-base font-medium no-underline transition-all hover:text-amber-500 after:content-[''] after:absolute after:left-0 after:bottom-1 after:w-full after:h-0.5 after:bg-amber-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100"
              onClick={(e) => handleShopLink(e, "lime")}
            >
              Lime
            </a>
          </div>

          <div className="h-px bg-gray-200 my-7"></div>

          <a 
            href="#about" 
            className="block relative py-3 text-gray-900 text-base font-medium no-underline transition-all hover:text-amber-500 after:content-[''] after:absolute after:left-0 after:bottom-1 after:w-full after:h-0.5 after:bg-amber-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100"
            onClick={(e) => handleLinkClick(e, "about")}
          >
            About
          </a>
          <a 
            href="#contact" 
            className="block relative py-3 text-gray-900 text-base font-medium no-underline transition-all hover:text-amber-500 after:content-[''] after:absolute after:left-0 after:bottom-1 after:w-full after:h-0.5 after:bg-amber-500 after:scale-x-0 after:origin-left after:transition-transform after:duration-250 hover:after:scale-x-100"
            onClick={(e) => handleLinkClick(e, "contact")}
          >
            Contact
          </a>

          <a 
            href="#" 
            className="mt-6 py-3.5 px-4 rounded-lg bg-amber-500 text-white font-semibold text-center block no-underline transition-colors duration-200 hover:bg-amber-600 after:hidden"
            onClick={(e) => {
              e.preventDefault()
              closeMenu()
              setIsCartOpen(true)
            }}
          >
            View Cart
          </a>
        </div>
      </div>
    </nav>
  )
}

