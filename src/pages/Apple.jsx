import { useEffect } from "react"
import ProductPage from "../components/ProductPage"
import StructuredData from "../components/StructuredData"
import { productSEO, organizationData } from "../utils/seoData"
import { trackProductView } from "../utils/analytics"

const appleProduct = {
  id: "apple",
  name: "Apple",
  description: "Crisp, sweet, and aromatic. Perfect for snacks and charcuterie boards.",
  variants: [
    {
      id: "apple-mini",
      label: "Mini Bag — 10 pcs",
      option: "Mini Bag (10 pcs)",
      price: 6,
      image: "/images/apple-product.jpg?v=professional"
    },
    {
      id: "apple-small",
      label: "Small Bag — 20 pcs",
      option: "Small Bag (20 pcs)",
      price: 13,
      image: "/images/apple-product.jpg?v=professional"
    },
    {
      id: "apple-medium",
      label: "Medium Bag — 40 pcs",
      option: "Medium Bag (40 pcs)",
      price: 20,
      image: "/images/apple-product.jpg?v=professional"
    },
    {
      id: "apple-large",
      label: "Large Bag — 75 pcs",
      option: "Large Bag (75 pcs)",
      price: 30,
      image: "/images/apple-product.jpg?v=professional"
    },
    {
      id: "apple-clearbox",
      label: "Clear Box — 40 pcs",
      option: "Clear Box (40 pcs)",
      price: 20,
      image: "/images/apple-product.jpg?v=professional"
    }
  ]
}

export default function Apple() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://purepeelco.com'
  
  // Track product view on mount
  useEffect(() => {
    const defaultVariant = appleProduct.variants[0]
    trackProductView({
      id: defaultVariant.id,
      name: appleProduct.name,
      variant: defaultVariant.option,
      price: defaultVariant.price
    })
  }, [])
  
  // Product structured data
  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productSEO.apple.name,
    description: productSEO.apple.description,
    brand: {
      '@type': 'Brand',
      name: productSEO.apple.brand
    },
    category: productSEO.apple.category,
    image: appleProduct.variants.map(v => `${baseUrl}${v.image}`),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'CAD',
      availability: productSEO.apple.availability,
      priceRange: productSEO.apple.priceRange,
      offerCount: appleProduct.variants.length,
      lowPrice: Math.min(...appleProduct.variants.map(v => v.price)).toString(),
      highPrice: Math.max(...appleProduct.variants.map(v => v.price)).toString()
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '18'
    }
  }

  return (
    <>
      <StructuredData data={organizationData} />
      <StructuredData data={productStructuredData} />
      <ProductPage product={appleProduct} />
    </>
  )
}

