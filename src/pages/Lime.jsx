import { useEffect } from "react"
import ProductPage from "../components/ProductPage"
import StructuredData from "../components/StructuredData"
import { productSEO, organizationData } from "../utils/seoData"
import { trackProductView } from "../utils/analytics"

const limeProduct = {
  name: "Lime",
  description: "Bright, crisp, and refreshing. Perfect for cocktails, tea, and charcuterie boards.",
  variants: [
    {
      id: "lime-mini",
      label: "Mini Bag — 10 pcs",
      option: "Mini Bag (10 pcs)",
      price: 6,
      image: "/images/lime-mini.jpg"
    },
    {
      id: "lime-small",
      label: "Small Bag — 20 pcs",
      option: "Small Bag (20 pcs)",
      price: 13,
      image: "/images/lime-small.jpg"
    },
    {
      id: "lime-medium",
      label: "Medium Bag — 40 pcs",
      option: "Medium Bag (40 pcs)",
      price: 20,
      image: "/images/lime-medium.jpg"
    },
    {
      id: "lime-large",
      label: "Large Bag — 75 pcs",
      option: "Large Bag (75 pcs)",
      price: 30,
      image: "/images/lime-large.jpg"
    },
    {
      id: "lime-clearbox",
      label: "Clear Box — 40 pcs",
      option: "Clear Box (40 pcs)",
      price: 20,
      image: "/images/lime.jpg"
    }
  ]
}

export default function Lime() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://purepeelco.com'
  
  // Track product view on mount
  useEffect(() => {
    const defaultVariant = limeProduct.variants[0]
    trackProductView({
      id: defaultVariant.id,
      name: limeProduct.name,
      variant: defaultVariant.option,
      price: defaultVariant.price
    })
  }, [])
  
  // Product structured data
  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productSEO.lime.name,
    description: productSEO.lime.description,
    brand: {
      '@type': 'Brand',
      name: productSEO.lime.brand
    },
    category: productSEO.lime.category,
    image: limeProduct.variants.map(v => `${baseUrl}${v.image}`),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'CAD',
      availability: productSEO.lime.availability,
      priceRange: productSEO.lime.priceRange,
      offerCount: limeProduct.variants.length,
      lowPrice: Math.min(...limeProduct.variants.map(v => v.price)).toString(),
      highPrice: Math.max(...limeProduct.variants.map(v => v.price)).toString()
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '22'
    }
  }

  return (
    <>
      <StructuredData data={organizationData} />
      <StructuredData data={productStructuredData} />
      <ProductPage product={limeProduct} />
    </>
  )
}

