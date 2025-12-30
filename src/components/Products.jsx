import { useState } from "react"
import { useScrollReveal } from "../hooks/useScrollReveal"
import Skeleton from "./Skeleton"

const products = [
  {
    id: "orange",
    name: "Orange",
    description: "Sweet and zesty.",
    image: "/images/orange.jpg",
    link: "/orange"
  },
  {
    id: "pink-orange",
    name: "Pink Orange",
    description: "Floral and vibrant.",
    image: "/images/pink-orange.jpg",
    link: "/pink-orange"
  },
  {
    id: "lime",
    name: "Lime",
    description: "Bright and crisp.",
    image: "/images/lime.jpg",
    link: "/lime"
  }
]

function ProductCard({ product, index, onProductClick }) {
  const [cardRef, isCardVisible] = useScrollReveal({ 
    threshold: 0.1, 
    delay: index * 150 
  })
  const [imageLoading, setImageLoading] = useState(true)

  const handleClick = (e) => {
    e.preventDefault()
    onProductClick(e, product)
  }

  return (
    <a
      ref={cardRef}
      href={product.link}
      className={`group bg-white rounded-2xl shadow-md text-center no-underline text-inherit p-6 w-full max-w-[320px] transition-all duration-500 flex flex-col overflow-hidden hover:-translate-y-2 hover:shadow-xl ${
        isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      onClick={handleClick}
    >
      <div className="w-full h-60 mb-5 rounded-xl overflow-hidden bg-gray-100 relative">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton type="image" width="100%" height="100%" />
          </div>
        )}
        <img 
          src={product.image} 
          alt={`${product.name} slices`}
          className={`w-full h-full object-cover object-center transition-opacity duration-300 group-hover:scale-105 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setImageLoading(false)}
        />
      </div>
      <h3 className="text-2xl font-semibold mb-2 text-gray-900 tracking-tight">{product.name}</h3>
      <p className="text-base text-gray-600 mb-4 leading-relaxed grow">{product.description}</p>
      <span className="inline-block mt-auto font-semibold text-amber-500 no-underline text-sm transition-all duration-300 group-hover:text-amber-600 group-hover:translate-x-1">
        View Product →
      </span>
    </a>
  )
}

export default function Products() {
  const [sectionRef] = useScrollReveal({ threshold: 0.1, delay: 0 })
  const [titleRef, isTitleVisible] = useScrollReveal({ threshold: 0.2, delay: 100 })

  const handleProductClick = (e, product) => {
    e.preventDefault()
    window.history.pushState({}, "", product.link)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  return (
    <section id="products" ref={sectionRef} className="py-20 px-5 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 
          ref={titleRef}
          className={`text-center text-[clamp(1.75rem,4vw,2.5rem)] font-semibold mb-12 text-gray-900 tracking-tight transition-all duration-800 ${
            isTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Our Citrus Collection
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onProductClick={handleProductClick}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

