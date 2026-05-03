// SEO data configuration for all pages

const baseUrl = 'https://purepeelco.com'
const defaultImage = '/images/driedcitrusbanner.jpg'

export const seoData = {
  home: {
    title: 'Pure Peel Co. | Premium Dehydrated Citrus Slices – Made in Canada',
    description: 'Premium dehydrated citrus and fruit slices, made in Canada with no preservatives. Perfect for cocktails, charcuterie, and tea. Shop orange, lemon, lime, pink orange, apple, and pineapple (pcs).',
    keywords: 'dehydrated citrus slices Canada, dried orange slices, cocktail garnish Canada, dehydrated lemon slices, dried lime slices, charcuterie garnish, Canadian made fruit garnish, pure peel co',
    image: defaultImage,
    url: '/',
    type: 'website'
  },
  orange: {
    title: 'Dehydrated Orange Slices | Cocktail Garnish | Pure Peel Co.',
    description: 'Sweet, zesty, and aromatic dehydrated orange slices. Ideal for Old Fashioneds, mimosas, and tea. Pairs beautifully with cheeses on charcuterie boards. Made in Canada with 100% natural ingredients. Available in multiple sizes.',
    keywords: 'dehydrated orange slices Canada, buy dried orange slices, orange cocktail garnish, Old Fashioned garnish, dried orange wheels, Canadian made, natural orange slices',
    image: '/images/orange.jpg',
    url: '/orange',
    type: 'product',
  },
  pinkOrange: {
    title: 'Dehydrated Pink Orange Slices | Cocktail Garnish | Pure Peel Co.',
    description: 'Stunning pink orange slices, slow-dehydrated to preserve their blush colour and bright citrus flavour. A showstopping garnish for spritzes, cocktails, and charcuterie boards. Made in Canada, 100% natural.',
    keywords: 'pink orange slices, dehydrated pink orange, cocktail garnish Canada, pink citrus garnish, dried citrus wheels, premium garnish Canada',
    image: '/images/pink-orange.jpg',
    url: '/pink-orange',
    type: 'product',
  },
  lime: {
    title: 'Dehydrated Lime Slices | Cocktail Garnish | Pure Peel Co.',
    description: 'Bright, crisp, and refreshing dehydrated lime slices. Essential for margaritas, mojitos, and gin & tonics. Adds a zesty kick to iced tea and cuts through rich flavors on charcuterie boards. Made in Canada with 100% natural ingredients.',
    keywords: 'dehydrated lime slices Canada, dried lime wheels, margarita garnish, mojito garnish, gin tonic garnish, buy lime garnish Canada, natural lime slices',
    image: '/images/lime.jpg',
    url: '/lime',
    type: 'product',
  },
  lemon: {
    title: 'Dehydrated Lemon Slices | Cocktail Garnish | Pure Peel Co.',
    description: 'Tart, zesty, and refreshing dehydrated lemon slices. Perfect for lemon drops, whiskey sours, and classic tea pairings. Brightens charcuterie boards and complements creamy cheeses. Made in Canada with 100% natural ingredients.',
    keywords: 'dehydrated lemon slices Canada, dried lemon wheels, buy lemon garnish, whiskey sour garnish, lemon cocktail garnish, Canadian made, natural lemon slices',
    image: '/images/lemon-product.jpg',
    url: '/lemon',
    type: 'product',
  },
  apple: {
    title: 'Dehydrated Apple Slices | Charcuterie & Snack Garnish | Pure Peel Co.',
    description: 'Crisp, sweet dehydrated apple slices made in Canada with no preservatives. A natural, elegant addition to charcuterie boards, snack plates, and fall cocktails. Available in multiple sizes.',
    keywords: 'dehydrated apple slices Canada, dried apple slices, charcuterie garnish, natural apple snack, buy dehydrated apple Canada, Canadian made fruit slices',
    image: '/images/apple-product-card.jpg',
    url: '/apple',
    type: 'product',
  },
  pineapple: {
    title: 'Dehydrated Pineapple (pcs) | Cocktail & Charcuterie Garnish | Pure Peel Co.',
    description: 'Bright, tropical dehydrated pineapple made in Canada with no preservatives. Bag sizes in pcs. Bold in tiki and sparkling cocktails, beautiful on cheese boards and dessert plates.',
    keywords: 'dehydrated pineapple Canada, dried pineapple pieces, pineapple pcs, tiki garnish, cocktail garnish Canada, charcuterie fruit, Canadian made dried fruit',
    image: '/images/pineapple-product.JPEG',
    url: '/pineapple',
    type: 'product',
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
    type: 'website',
    noindex: true // Don't index order tracking pages
  },
  privacy: {
    title: 'Privacy Policy | Pure Peel Co.',
    description: 'Pure Peel Co. Privacy Policy. Learn how we collect, use, and protect your personal information. Canadian privacy compliance.',
    keywords: 'privacy policy, data protection, Canadian privacy laws, PIPEDA',
    image: defaultImage,
    url: '/privacy',
    type: 'website',
    noindex: true // Don't index privacy policy
  },
  shippingReturns: {
    title: 'Shipping & Returns | Pure Peel Co.',
    description: 'Shipping information and return policy for Pure Peel Co. Fast shipping across Canada. Multiple shipping options available.',
    keywords: 'shipping, returns, return policy, shipping policy, Canada shipping',
    image: defaultImage,
    url: '/shipping-returns',
    type: 'website',
    noindex: true // Don't index shipping & returns page
  },
  terms: {
    title: 'Terms of Service | Pure Peel Co.',
    description: 'Terms of Service for Pure Peel Co. Learn about our policies regarding orders, payments, shipping, returns, and customer rights.',
    keywords: 'terms of service, terms and conditions, user agreement, legal terms',
    image: defaultImage,
    url: '/terms',
    type: 'website'
  },
  contact: {
    title: 'Contact Us | Pure Peel Co. | Toronto, Canada',
    description: 'Get in touch with Pure Peel Co. for product inquiries, wholesale and bulk orders, or customer support. Toronto-based, shipping across Canada.',
    keywords: 'contact Pure Peel Co., wholesale dehydrated citrus, bulk citrus garnish, Toronto food supplier, Canadian citrus garnish',
    image: defaultImage,
    url: '/contact',
    type: 'website'
  },
  faq: {
    title: 'FAQ | Frequently Asked Questions | Pure Peel Co.',
    description: 'Find answers to frequently asked questions about Pure Peel Co. dehydrated citrus slices, shipping, orders, returns, and product usage.',
    keywords: 'Pure Peel Co. FAQ, dehydrated citrus Canada questions, how to use dried citrus, citrus garnish storage, shipping Canada, order help',
    image: defaultImage,
    url: '/faq',
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
  },
  unsubscribe: {
    title: 'Unsubscribe | Pure Peel Co.',
    description: 'Remove your email address from our marketing list.',
    keywords: 'unsubscribe, email list, marketing',
    image: defaultImage,
    url: '/unsubscribe',
    type: 'website',
    noindex: true
  }
}

// Product-specific SEO data for structured data
export const productSEO = {
  orange: {
    name: 'Dehydrated Orange Slices',
    description: 'Sweet, zesty, and aromatic dehydrated orange slices. Ideal for classic cocktails like Old Fashioneds and mimosas, adds natural sweetness to hot or iced tea, and pairs beautifully with cheeses and cured meats on charcuterie boards.',
    brand: 'Pure Peel Co.',
    category: 'Food & Beverage > Gourmet Foods > Dehydrated Fruits',
    availability: 'https://schema.org/InStock',
    priceRange: '$6 - $30 CAD'
  },
  pinkOrange: {
    name: 'Dehydrated Pink Orange Slices',
    description: 'Beautiful pink orange slices, dehydrated to preserve color and flavor. Perfect for premium cocktails and spritzes, elevates tea presentations with stunning color, and creates eye-catching gourmet displays on charcuterie boards.',
    brand: 'Pure Peel Co.',
    category: 'Food & Beverage > Gourmet Foods > Dehydrated Fruits',
    availability: 'https://schema.org/InStock',
    priceRange: '$6 - $30 CAD'
  },
  lime: {
    name: 'Dehydrated Lime Slices',
    description: 'Bright, crisp, and refreshing dehydrated lime slices. Essential for margaritas, mojitos, and gin & tonics. Adds a zesty kick to iced tea and cuts through rich flavors on charcuterie boards.',
    brand: 'Pure Peel Co.',
    category: 'Food & Beverage > Gourmet Foods > Dehydrated Fruits',
    availability: 'https://schema.org/InStock',
    priceRange: '$6 - $30 CAD'
  },
  lemon: {
    name: 'Dehydrated Lemon Slices',
    description: 'Tart, zesty, and refreshing dehydrated lemon slices. Perfect for lemon drops, whiskey sours, and classic tea pairings. Brightens charcuterie boards and complements creamy cheeses.',
    brand: 'Pure Peel Co.',
    category: 'Food & Beverage > Gourmet Foods > Dehydrated Fruits',
    availability: 'https://schema.org/InStock',
    priceRange: '$6 - $30 CAD'
  },
  apple: {
    name: 'Dehydrated Apple Slices',
    description: 'Crisp, sweet, and aromatic dehydrated apple slices. Perfect for snacks and charcuterie boards.',
    brand: 'Pure Peel Co.',
    category: 'Food & Beverage > Gourmet Foods > Dehydrated Fruits',
    availability: 'https://schema.org/InStock',
    priceRange: '$7.20 - $12.00 CAD'
  },
  pineapple: {
    name: 'Dehydrated Pineapple (pcs)',
    description: 'Bright, tropical dehydrated pineapple, counted in pcs per bag. Sweet-tart and aromatic — ideal for cocktails, mocktails, and gourmet boards.',
    brand: 'Pure Peel Co.',
    category: 'Food & Beverage > Gourmet Foods > Dehydrated Fruits',
    availability: 'https://schema.org/InStock',
    priceRange: '$10.00 - $15.00 CAD'
  }
}

// Organization structured data
export const organizationData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Pure Peel Co.',
  alternateName: ['Pure Peel', 'PurePeelCo', 'purepeelco'],
  url: baseUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${baseUrl}/logo.png`,
    width: 512,
    height: 512
  },
  image: `${baseUrl}/logo.png`,
  description: 'Premium dehydrated citrus slices made in Canada. 100% Natural • No Preservatives.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'CA',
    addressRegion: 'ON',
    addressLocality: 'Ontario'
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
