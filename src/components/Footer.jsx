import { useScrollReveal } from "../hooks/useScrollReveal"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [footerRef, isFooterVisible] = useScrollReveal({ threshold: 0.1, delay: 0 })

  const handleLinkClick = (e, targetId) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({ top: offsetPosition, behavior: "smooth" })
    }
  }

  return (
    <footer 
      ref={footerRef}
      className={`relative bg-linear-to-b from-gray-900 via-gray-900 to-black text-gray-300 mt-0 transition-all duration-800 ${
        isFooterVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-500/40 to-transparent"></div>
      
      <div className="relative max-w-6xl mx-auto px-6 md:px-8 py-14 md:py-18">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 lg:gap-16 mb-10">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-5">
              <img 
                src="/logo.png" 
                alt="Pure Peel Co." 
                className="w-[120px] h-auto opacity-95 transition-opacity duration-300 hover:opacity-100" 
              />
            </div>
            <p className="text-gray-400 text-sm mb-2">
              Made in Canada 🍁
            </p>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-white mb-5 text-xs font-semibold tracking-wider uppercase">
              Shop
            </h4>
            <nav className="flex flex-col space-y-3">
              <a 
                href="/orange" 
                className="text-gray-400 no-underline text-sm transition-colors duration-200 hover:text-amber-500"
                onClick={(e) => {
                  e.preventDefault()
                  window.history.pushState({}, "", "/orange")
                  window.dispatchEvent(new PopStateEvent("popstate"))
                }}
              >
                Orange
              </a>
              <a 
                href="/pink-orange" 
                className="text-gray-400 no-underline text-sm transition-colors duration-200 hover:text-amber-500"
                onClick={(e) => {
                  e.preventDefault()
                  window.history.pushState({}, "", "/pink-orange")
                  window.dispatchEvent(new PopStateEvent("popstate"))
                }}
              >
                Pink Orange
              </a>
              <a 
                href="/lime" 
                className="text-gray-400 no-underline text-sm transition-colors duration-200 hover:text-amber-500"
                onClick={(e) => {
                  e.preventDefault()
                  window.history.pushState({}, "", "/lime")
                  window.dispatchEvent(new PopStateEvent("popstate"))
                }}
              >
                Lime
              </a>
            </nav>
          </div>

          {/* Info Column */}
          <div>
            <h4 className="text-white mb-5 text-xs font-semibold tracking-wider uppercase">
              Info
            </h4>
                  <nav className="flex flex-col space-y-3">
                    <a 
                      href="/order-tracking" 
                      className="text-gray-400 no-underline text-sm transition-colors duration-200 hover:text-amber-500"
                      onClick={(e) => {
                        e.preventDefault()
                        window.history.pushState({}, "", "/order-tracking")
                        window.dispatchEvent(new PopStateEvent("popstate"))
                      }}
                    >
                      Track Your Order
                    </a>
                    <a 
                      href="/shipping-returns" 
                      className="text-gray-400 no-underline text-sm transition-colors duration-200 hover:text-amber-500"
                      onClick={(e) => {
                        e.preventDefault()
                        window.history.pushState({}, "", "/shipping-returns")
                        window.dispatchEvent(new PopStateEvent("popstate"))
                      }}
                    >
                      Shipping & Returns
                    </a>
                    <a 
                      href="/privacy" 
                      className="text-gray-400 no-underline text-sm transition-colors duration-200 hover:text-amber-500"
                      onClick={(e) => {
                        e.preventDefault()
                        window.history.pushState({}, "", "/privacy")
                        window.dispatchEvent(new PopStateEvent("popstate"))
                      }}
                    >
                      Privacy Policy
                    </a>
                  </nav>
          </div>

          {/* Social Column */}
          <div>
            <h4 className="text-white mb-5 text-xs font-semibold tracking-wider uppercase">
              Follow Us
            </h4>
            <a 
              href="https://www.instagram.com/purepeelco/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-gray-400 no-underline text-sm transition-colors duration-200 hover:text-amber-500 group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center border border-gray-700/50 group-hover:border-amber-500/50 transition-colors duration-200">
                <svg
                  className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <span>@purepeelco</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800/50">
          <div className="text-center">
            <p className="text-xs text-gray-500 m-0">
              © {currentYear} Pure Peel Co. 🍁
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

