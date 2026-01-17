import { useEffect } from "react"
import ProductPage from "../components/ProductPage"
import StructuredData from "../components/StructuredData"
import { productSEO, organizationData } from "../utils/seoData"
import { trackProductView } from "../utils/analytics"

const pinkOrangeProduct = {
  id: "pink-orange",
  name: "Pink Orange",
  description: "Floral, vibrant, and uniquely beautiful. Perfect for premium cocktails and spritzes, elevates tea presentations with stunning color, and creates eye-catching gourmet displays on charcuterie boards.",
  showBulkInquiry: true, // Enable bulk inquiry button for this product
  galleryImages: [
    "/images/pinkorange-fresh.jpg"
  ],
  variants: [
    {
      id: "pink-orange-small",
      label: "Small Bag — 20 pcs",
      option: "Small Bag (20 pcs)",
      price: 12,
      image: "/images/pink-orange-product.jpg"
    },
    {
      id: "pink-orange-medium",
      label: "Medium Bag — 40 pcs",
      option: "Medium Bag (40 pcs)",
      price: 23,
      image: "/images/pink-orange-product.jpg"
    },
    {
      id: "pink-orange-large",
      label: "Large Bag — 75 pcs",
      option: "Large Bag (75 pcs)",
      price: 44,
      image: "/images/pink-orange-product.jpg"
    },
    {
      id: "pink-orange-clearbox",
      label: "Clear Box — 40 pcs",
      option: "Clear Box (40 pcs)",
      price: 23,
      image: "/images/pink-orange-box.jpg"
    }
  ]
}

export default function PinkOrange() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://purepeelco.com'
  
  // Track product view on mount
  useEffect(() => {
    const defaultVariant = pinkOrangeProduct.variants[0]
    trackProductView({
      id: defaultVariant.id,
      name: pinkOrangeProduct.name,
      variant: defaultVariant.option,
      price: defaultVariant.price
    })
  }, [])
  
  // Product structured data
  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productSEO.pinkOrange.name,
    description: productSEO.pinkOrange.description,
    brand: {
      '@type': 'Brand',
      name: productSEO.pinkOrange.brand
    },
    category: productSEO.pinkOrange.category,
    image: pinkOrangeProduct.variants.map(v => `${baseUrl}${v.image}`),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'CAD',
      availability: productSEO.pinkOrange.availability,
      priceRange: productSEO.pinkOrange.priceRange,
      offerCount: pinkOrangeProduct.variants.length,
      lowPrice: Math.min(...pinkOrangeProduct.variants.map(v => v.price)).toString(),
      highPrice: Math.max(...pinkOrangeProduct.variants.map(v => v.price)).toString()
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '18'
    }
  }

  return (
    <>
      <StructuredData data={organizationData} />
      <StructuredData data={productStructuredData} />
      <ProductPage product={pinkOrangeProduct} />
    </>
  )
}

