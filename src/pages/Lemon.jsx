import { useEffect } from "react"
import ProductPage from "../components/ProductPage"
import StructuredData from "../components/StructuredData"
import { productSEO, organizationData } from "../utils/seoData"
import { trackProductView } from "../utils/analytics"

const lemonProduct = {
  id: "lemon",
  name: "Lemon",
  description: "Tart, zesty, and refreshing. Perfect for lemon drops, whiskey sours, and classic tea pairings. Brightens charcuterie boards and complements creamy cheeses.",
  variants: [
    {
      id: "lemon-mini",
      label: "Mini Bag — 15 pcs",
      option: "Mini Bag (15 pcs)",
      price: 7,
      image: "/images/lemon-product.jpg?v=professional"
    },
    {
      id: "lemon-small",
      label: "Small Bag — 35 pcs",
      option: "Small Bag (35 pcs)",
      price: 16,
      image: "/images/lemon-product.jpg?v=professional"
    },
    {
      id: "lemon-medium",
      label: "Medium Bag — 50 pcs",
      option: "Medium Bag (50 pcs)",
      price: 20,
      image: "/images/lemon-product.jpg?v=professional"
    },
    {
      id: "lemon-large",
      label: "Large Bag — 85 pcs",
      option: "Large Bag (85 pcs)",
      price: 32,
      image: "/images/lemon-product.jpg?v=professional"
    },
    {
      id: "lemon-clearbox",
      label: "Clear Box — 50 pcs",
      option: "Clear Box (50 pcs)",
      price: 20,
      image: "/images/lemon-box.jpg"
    }
  ]
}

export default function Lemon() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://purepeelco.com'
  
  // Track product view on mount
  useEffect(() => {
    const defaultVariant = lemonProduct.variants[0]
    trackProductView({
      id: defaultVariant.id,
      name: lemonProduct.name,
      variant: defaultVariant.option,
      price: defaultVariant.price
    })
  }, [])
  
  // Product structured data
  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productSEO.lemon.name,
    description: productSEO.lemon.description,
    brand: {
      '@type': 'Brand',
      name: productSEO.lemon.brand
    },
    category: productSEO.lemon.category,
    image: lemonProduct.variants.map(v => `${baseUrl}${v.image}`),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'CAD',
      availability: productSEO.lemon.availability,
      priceRange: productSEO.lemon.priceRange,
      offerCount: lemonProduct.variants.length,
      lowPrice: Math.min(...lemonProduct.variants.map(v => v.price)).toString(),
      highPrice: Math.max(...lemonProduct.variants.map(v => v.price)).toString()
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '20'
    }
  }

  return (
    <>
      <StructuredData data={organizationData} />
      <StructuredData data={productStructuredData} />
      <ProductPage product={lemonProduct} />
    </>
  )
}

