// SEO data configuration for all pages

const baseUrl = 'https://purepeelco.com'
const defaultImage = '/images/driedcitrusbanner.jpg'

export const seoData = {
  home: {
    title: 'Pure Peel Co. | Premium Dehydrated Citrus Slices',
    description: 'Premium dehydrated citrus slices made in Canada. 100% Natural • No Preservatives • Perfect for cocktails, tea, and gourmet garnishes. Shop Orange, Pink Orange, and Lime slices.',
    keywords: 'dehydrated citrus, dried orange slices, dehydrated lime, cocktail garnish, tea garnish, Canadian made, natural food, gourmet garnish',
    image: defaultImage,
    url: '/',
    type: 'website'
  },
  orange: {
    title: 'Dehydrated Orange Slices | Pure Peel Co.',
    description: 'Sweet, zesty, and aromatic dehydrated orange slices. Perfect for cocktails, tea, and charcuterie boards. Made in Canada with 100% natural ingredients. Available in multiple sizes.',
    keywords: 'dehydrated orange, dried orange slices, orange garnish, cocktail garnish, natural orange, Canadian made',
    image: '/images/orange.jpg',
    url: '/orange',
    type: 'product'
  },
  pinkOrange: {
    title: 'Dehydrated Pink Orange Slices | Pure Peel Co.',
    description: 'Beautiful pink orange slices, dehydrated to preserve color and flavor. Perfect for cocktails, tea, and gourmet presentations. Made in Canada, 100% natural.',
    keywords: 'dehydrated pink orange, pink orange slices, pink orange garnish, cocktail garnish, natural pink orange',
    image: '/images/pink-orange.jpg',
    url: '/pink-orange',
    type: 'product'
  },
  lime: {
    title: 'Dehydrated Lime Slices | Pure Peel Co.',
    description: 'Tart and refreshing dehydrated lime slices. Ideal for cocktails, tea, and culinary garnishes. Made in Canada with 100% natural ingredients. Available in multiple sizes.',
    keywords: 'dehydrated lime, dried lime slices, lime garnish, cocktail garnish, natural lime, Canadian made',
    image: '/images/lime.jpg',
    url: '/lime',
    type: 'product'
  },
  checkout: {
    title: 'Checkout | Pure Peel Co.',
    description: 'Complete your purchase of premium dehydrated citrus slices. Secure checkout with Stripe. Fast shipping across Canada.',
    keywords: 'checkout, purchase, buy dehydrated citrus, secure payment',
    image: defaultImage,
    url: '/checkout',
    type: 'website',
    noindex: true // Don't index checkout pages
  },
  orderTracking: {
    title: 'Track Your Order | Pure Peel Co.',
    description: 'Track your Pure Peel Co. order status. Enter your order number and email to view shipping status and delivery information.',
    keywords: 'order tracking, track order, order status, shipping status',
    image: defaultImage,
    url: '/order-tracking',
    type: 'website'
  },
  privacy: {
    title: 'Privacy Policy | Pure Peel Co.',
    description: 'Pure Peel Co. Privacy Policy. Learn how we collect, use, and protect your personal information. Canadian privacy compliance.',
    keywords: 'privacy policy, data protection, Canadian privacy laws, PIPEDA',
    image: defaultImage,
    url: '/privacy',
    type: 'website'
  },
  shippingReturns: {
    title: 'Shipping & Returns | Pure Peel Co.',
    description: 'Shipping information and return policy for Pure Peel Co. Fast shipping across Canada. Multiple shipping options available.',
    keywords: 'shipping, returns, return policy, shipping policy, Canada shipping',
    image: defaultImage,
    url: '/shipping-returns',
    type: 'website'
  },
  admin: {
    title: 'Admin Dashboard | Pure Peel Co.',
    description: 'Admin dashboard for order management.',
    image: defaultImage,
    url: '/admin',
    type: 'website',
    noindex: true // Don't index admin pages
  },
  notFound: {
    title: '404 - Page Not Found | Pure Peel Co.',
    description: 'The page you\'re looking for doesn\'t exist. Return to Pure Peel Co. homepage or browse our premium dehydrated citrus slices.',
    keywords: '404, page not found, error',
    image: defaultImage,
    url: '/404',
    type: 'website',
    noindex: true // Don't index 404 pages
  }
}

// Product-specific SEO data for structured data
export const productSEO = {
  orange: {
    name: 'Dehydrated Orange Slices',
    description: 'Sweet, zesty, and aromatic dehydrated orange slices. Perfect for cocktails, tea, and charcuterie boards.',
    brand: 'Pure Peel Co.',
    category: 'Food & Beverage > Gourmet Foods > Dehydrated Fruits',
    availability: 'https://schema.org/InStock',
    priceRange: '$6 - $30 CAD'
  },
  pinkOrange: {
    name: 'Dehydrated Pink Orange Slices',
    description: 'Beautiful pink orange slices, dehydrated to preserve color and flavor. Perfect for cocktails, tea, and gourmet presentations.',
    brand: 'Pure Peel Co.',
    category: 'Food & Beverage > Gourmet Foods > Dehydrated Fruits',
    availability: 'https://schema.org/InStock',
    priceRange: '$6 - $30 CAD'
  },
  lime: {
    name: 'Dehydrated Lime Slices',
    description: 'Tart and refreshing dehydrated lime slices. Ideal for cocktails, tea, and culinary garnishes.',
    brand: 'Pure Peel Co.',
    category: 'Food & Beverage > Gourmet Foods > Dehydrated Fruits',
    availability: 'https://schema.org/InStock',
    priceRange: '$6 - $30 CAD'
  }
}

// Organization structured data
export const organizationData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Pure Peel Co.',
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  description: 'Premium dehydrated citrus slices made in Canada. 100% Natural • No Preservatives.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'CA',
    addressLocality: 'Canada'
  },
  sameAs: [
    'https://www.instagram.com/purepeelco/'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'info@purepeelco.com'
  }
}

