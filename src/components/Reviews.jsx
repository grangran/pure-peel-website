import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"

export default function Reviews() {
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.2 })
  const { language } = useLanguage()

  const reviews = [
    {
      name: "Sarah M.",
      location: "Toronto, ON",
      rating: 5,
      text: "Absolutely love these dehydrated citrus slices! Perfect for my cocktails and they last forever. The quality is amazing and they're made right here in Canada!",
      date: "2 weeks ago"
    },
    {
      name: "Michael R.",
      location: "Vancouver, BC",
      rating: 5,
      text: "Best dehydrated citrus I've found. The lemon slices are perfect for my bar. Great customer service and fast shipping. Highly recommend!",
      date: "1 month ago"
    },
    {
      name: "Jessica L.",
      location: "Montreal, QC",
      rating: 5,
      text: "These are a game changer for my tea business. The orange slices add such a beautiful touch and the customers love them. Premium quality!",
      date: "3 weeks ago"
    },
    {
      name: "David K.",
      location: "Calgary, AB",
      rating: 5,
      text: "Ordered the variety pack and couldn't be happier. All natural, no preservatives, and made in Canada. Exactly what I was looking for!",
      date: "1 month ago"
    }
  ]

  return (
    <section 
      ref={sectionRef}
      id="reviews"
      className={`py-12 md:py-20 px-4 sm:px-6 bg-stone-50 transition-all duration-800 ${
        isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
            {language === 'fr' ? 'Avis Clients' : 'Customer Reviews'}
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Découvrez ce que nos clients disent de nos produits'
              : 'See what our customers are saying about our products'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm border border-stone-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-amber-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-stone-700 mb-4 leading-relaxed text-sm">
                "{review.text}"
              </p>
              <div className="pt-4 border-t border-stone-100">
                <p className="text-stone-900 font-semibold text-sm">{review.name}</p>
                <p className="text-stone-500 text-xs">{review.location} • {review.date}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-stone-600 text-sm mb-4">
            {language === 'fr' 
              ? 'Avez-vous acheté nos produits? Partagez votre avis!'
              : 'Have you purchased our products? Share your review!'}
          </p>
          <a
            href="https://www.instagram.com/purepeelco/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            {language === 'fr' ? 'Suivez-nous sur Instagram' : 'Follow us on Instagram'}
          </a>
        </div>
      </div>
    </section>
  )
}
