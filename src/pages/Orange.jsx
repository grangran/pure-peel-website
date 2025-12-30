import { useEffect } from "react"
import ProductPage from "../components/ProductPage"
import StructuredData from "../components/StructuredData"
import { productSEO, organizationData } from "../utils/seoData"
import { trackProductView } from "../utils/analytics"

const orangeProduct = {
  name: "Orange",
  description: "Sweet, zesty, and aromatic. Perfect for cocktails, tea, and charcuterie boards.",
  variants: [
    {
      id: "orange-mini",
      label: "Mini Bag — 10 pcs",
      option: "Mini Bag (10 pcs)",
      price: 6,
      image: "/images/orange-mini.jpg"
    },
    {
      id: "orange-small",
      label: "Small Bag — 20 pcs",
      option: "Small Bag (20 pcs)",
      price: 13,
      image: "/images/orange-small.jpg"
    },
    {
      id: "orange-medium",
      label: "Medium Bag — 40 pcs",
      option: "Medium Bag (40 pcs)",
      price: 20,
      image: "/images/orange-medium.jpg"
    },
    {
      id: "orange-large",
      label: "Large Bag — 75 pcs",
      option: "Large Bag (75 pcs)",
      price: 30,
      image: "/images/orange-large.jpg"
    },
    {
      id: "orange-clearbox",
      label: "Clear Box — 40 pcs",
      option: "Clear Box (40 pcs)",
      price: 20,
      image: "/images/orange.jpg"
    }
  ]
}

export default function Orange() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://purepeelco.com'
  
  // Track product view on mount
  useEffect(() => {
    const defaultVariant = orangeProduct.variants[0]
    trackProductView({
      id: defaultVariant.id,
      name: orangeProduct.name,
      variant: defaultVariant.option,
      price: defaultVariant.price
    })
  }, [])
  
  // Product structured data
  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productSEO.orange.name,
    description: productSEO.orange.description,
    brand: {
      '@type': 'Brand',
      name: productSEO.orange.brand
    },
    category: productSEO.orange.category,
    image: orangeProduct.variants.map(v => `${baseUrl}${v.image}`),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'CAD',
      availability: productSEO.orange.availability,
      priceRange: productSEO.orange.priceRange,
      offerCount: orangeProduct.variants.length,
      lowPrice: Math.min(...orangeProduct.variants.map(v => v.price)).toString(),
      highPrice: Math.max(...orangeProduct.variants.map(v => v.price)).toString()
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '24'
    }
  }

  return (
    <>
      <StructuredData data={organizationData} />
      <StructuredData data={productStructuredData} />
      <ProductPage product={orangeProduct} />
    </>
  )
}

