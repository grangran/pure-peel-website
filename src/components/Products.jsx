import { useState } from "react"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"
import Skeleton from "./Skeleton"

const citrusProducts = [
  {
    id: "orange",
    image: "/images/orange-product-card.jpg",
    link: "/orange"
  },
  {
    id: "pink-orange",
    image: "/images/pink-orange-product-card.jpg?v=trimmed",
    link: "/pink-orange"
  },
  {
    id: "lime",
    image: "/images/lime-product-card.jpg",
    link: "/lime"
  },
  {
    id: "lemon",
    image: "/images/lemon-product-card.jpg",
    link: "/lemon"
  }
]

const fruitProducts = [
  {
    id: "apple",
    image: "/images/apple-product-card.jpg",
    link: "/apple"
  }
]

function ProductCard({ product, index, onProductClick }) {
  const [cardRef, isCardVisible] = useScrollReveal({ 
    threshold: 0.1, 
    delay: index * 100 
  })
  const [imageLoading, setImageLoading] = useState(true)
  const { language } = useLanguage()

  const handleClick = (e) => {
    e.preventDefault()
    onProductClick(e, product)
  }

  return (
    <a
      ref={cardRef}
      href={product.link}
      className={`group bg-white rounded-2xl md:rounded-3xl shadow-sm border border-stone-100 text-center no-underline text-inherit p-0 w-full max-w-[340px] transition-all duration-500 ease-out flex flex-col overflow-hidden hover:-translate-y-2 md:hover:-translate-y-3 hover:shadow-xl md:hover:shadow-2xl hover:border-amber-200/50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
        isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      onClick={handleClick}
    >
      <div className="w-full h-72 mb-0 rounded-t-3xl overflow-hidden bg-stone-50 relative">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
            <Skeleton type="image" width="100%" height="100%" />
          </div>
        )}
        <img 
          src={product.image} 
          alt={`${product.name} slices`}
          className={`w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-110 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setImageLoading(false)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      <div className="p-5 md:p-6 pt-4 md:pt-5 flex flex-col flex-grow">
        <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-2.5 text-stone-900 tracking-tight">
          {getTranslation(language, `products.${product.id}.name`)}
        </h3>
        <p className="text-sm md:text-base text-stone-600 mb-4 md:mb-5 leading-relaxed flex-grow">
          {getTranslation(language, `products.${product.id}.description`)}
        </p>
        <span className="flex items-center justify-center gap-2 mt-auto font-semibold text-amber-600 no-underline text-sm transition-all duration-300 group-hover:text-amber-700 group-hover:gap-3">
          {getTranslation(language, 'products.viewProduct')}
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </a>
  )
}

export default function Products() {
  const [sectionRef] = useScrollReveal({ threshold: 0.1, delay: 0 })
  const [citrusTitleRef, isCitrusTitleVisible] = useScrollReveal({ threshold: 0.2, delay: 100 })
  const [fruitTitleRef, isFruitTitleVisible] = useScrollReveal({ threshold: 0.2, delay: 300 })
  const { language } = useLanguage()

  const handleProductClick = (e, product) => {
    // Let App.jsx handle navigation via its click interceptor
    // No need to call pushState here - App.jsx will do it
    // Just prevent default to stop the browser navigation
    e.preventDefault()
  }

  return (
    <section id="products" ref={sectionRef} className="py-16 md:py-24 px-4 sm:px-5 bg-brand-bg">
      <div className="max-w-7xl mx-auto">
        {/* Citrus Collection Section */}
        <div className="mb-20">
          <div className="text-center mb-4">
            <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 rounded-full mb-4">
              Collection
            </span>
          </div>
          <h2 
            ref={citrusTitleRef}
            className={`text-center text-[clamp(1.75rem,5vw,3.5rem)] font-bold mb-12 md:mb-16 text-stone-900 tracking-tight transition-all duration-800 ease-out ${
              isCitrusTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {getTranslation(language, 'products.citrusCollection')}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 justify-items-center">
            {citrusProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        </div>

        {/* Fruit Collection Section */}
        <div>
          <div className="text-center mb-4">
            <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 rounded-full mb-4">
              Collection
            </span>
          </div>
          <h2 
            ref={fruitTitleRef}
            className={`text-center text-[clamp(1.75rem,5vw,3.5rem)] font-bold mb-12 md:mb-16 text-stone-900 tracking-tight transition-all duration-800 ease-out ${
              isFruitTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {getTranslation(language, 'products.fruitCollection')}
          </h2>
          
          <div className="flex justify-center">
            {fruitProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index + citrusProducts.length}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

