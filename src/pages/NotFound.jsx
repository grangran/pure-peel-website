import { useScrollReveal } from "../hooks/useScrollReveal"

export default function NotFound() {
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.1 })

  const handleGoHome = (e) => {
    e.preventDefault()
    window.history.pushState({}, "", "/")
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  const handleBrowseProducts = (e) => {
    e.preventDefault()
    window.history.pushState({}, "", "/")
    window.dispatchEvent(new PopStateEvent("popstate"))
    // Scroll to products section after navigation
    setTimeout(() => {
      const productsSection = document.getElementById("products") || document.querySelector(".products-section")
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }

  return (
    <section 
      ref={sectionRef} 
      className={`py-12 px-5 bg-gray-50 min-h-screen transition-all duration-800 ${
        isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Oops! Page Not Found</h2>
          <p className="text-gray-600 text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="text-center space-y-6">
            {/* Illustration/Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full bg-amber-100 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-4">
              <p className="text-gray-700 text-lg">
                Don't worry, this happens to the best of us! The page you're looking for might have been moved, deleted, or the URL might be incorrect.
              </p>
              <p className="text-gray-600">
                Here are some helpful links to get you back on track:
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={handleGoHome}
                className="px-8 py-4 text-base font-bold rounded-xl border-0 cursor-pointer transition-all duration-300 uppercase tracking-wide font-sans bg-linear-to-br from-amber-500 to-amber-600 text-black shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:from-amber-400 hover:to-amber-500 hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(245,158,11,0.5)] active:translate-y-0"
              >
                Go to Homepage
              </button>
              <button
                onClick={handleBrowseProducts}
                className="px-8 py-4 text-base font-bold rounded-xl border-2 border-amber-500 text-amber-600 bg-transparent cursor-pointer transition-all duration-300 uppercase tracking-wide font-sans hover:bg-amber-50 hover:border-amber-600 active:translate-y-0"
              >
                Browse Products
              </button>
            </div>

            {/* Quick Links */}
            <div className="pt-8 border-t border-gray-200 mt-8">
              <p className="text-gray-600 mb-4 font-semibold">Popular Pages:</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/orange"
                  onClick={(e) => {
                    e.preventDefault()
                    window.history.pushState({}, "", "/orange")
                    window.dispatchEvent(new PopStateEvent("popstate"))
                  }}
                  className="text-amber-600 hover:text-amber-700 underline text-sm"
                >
                  Orange Slices
                </a>
                <a
                  href="/pink-orange"
                  onClick={(e) => {
                    e.preventDefault()
                    window.history.pushState({}, "", "/pink-orange")
                    window.dispatchEvent(new PopStateEvent("popstate"))
                  }}
                  className="text-amber-600 hover:text-amber-700 underline text-sm"
                >
                  Pink Orange Slices
                </a>
                <a
                  href="/lime"
                  onClick={(e) => {
                    e.preventDefault()
                    window.history.pushState({}, "", "/lime")
                    window.dispatchEvent(new PopStateEvent("popstate"))
                  }}
                  className="text-amber-600 hover:text-amber-700 underline text-sm"
                >
                  Lime Slices
                </a>
                <a
                  href="/order-tracking"
                  onClick={(e) => {
                    e.preventDefault()
                    window.history.pushState({}, "", "/order-tracking")
                    window.dispatchEvent(new PopStateEvent("popstate"))
                  }}
                  className="text-amber-600 hover:text-amber-700 underline text-sm"
                >
                  Track Order
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

