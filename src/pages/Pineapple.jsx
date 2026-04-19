import { useEffect } from "react"
import ProductPage from "../components/ProductPage"
import StructuredData from "../components/StructuredData"
import { productSEO, organizationData } from "../utils/seoData"
import { trackProductView } from "../utils/analytics"
import { getProduct, products } from "../data/products"

const product = getProduct("pineapple")

export default function Pineapple() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://purepeelco.com"

  useEffect(() => {
    const defaultVariant = product.variants[0]
    trackProductView({
      id: defaultVariant.id,
      name: product.name,
      variant: defaultVariant.option,
      price: defaultVariant.price
    })
  }, [])

  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productSEO.pineapple.name,
    description: productSEO.pineapple.description,
    brand: {
      "@type": "Brand",
      name: productSEO.pineapple.brand
    },
    category: productSEO.pineapple.category,
    image: product.variants.map((v) => `${baseUrl}${v.image}`),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "CAD",
      availability: productSEO.pineapple.availability,
      priceRange: productSEO.pineapple.priceRange,
      offerCount: product.variants.length,
      lowPrice: Math.min(...product.variants.map((v) => v.price)).toString(),
      highPrice: Math.max(...product.variants.map((v) => v.price)).toString()
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.7",
      reviewCount: "18"
    }
  }

  return (
    <>
      <StructuredData data={organizationData} />
      <StructuredData data={productStructuredData} />
      <ProductPage product={product} allProducts={products} />
    </>
  )
}
