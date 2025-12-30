import { useEffect } from 'react'

const SEO = ({ 
  title = 'Pure Peel Co. | Premium Dehydrated Citrus Slices',
  description = 'Premium dehydrated citrus slices made in Canada. 100% Natural • No Preservatives • Perfect for cocktails, tea, and gourmet garnishes.',
  image = '/images/driedcitrusbanner.jpg',
  url = '/',
  type = 'website',
  keywords = '',
  noindex = false
}) => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://purepeelco.com'
  
  const fullUrl = `${baseUrl}${url}`
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  useEffect(() => {
    // Update document title
    document.title = title

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name'
      let element = document.querySelector(`meta[${attribute}="${name}"]`)
      
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      
      element.setAttribute('content', content)
    }

    // Primary meta tags
    updateMetaTag('title', title)
    updateMetaTag('description', description)
    if (keywords) {
      updateMetaTag('keywords', keywords)
    }
    
    // Robots meta
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow')
    } else {
      updateMetaTag('robots', 'index, follow')
    }

    // Open Graph tags
    updateMetaTag('og:type', type, true)
    updateMetaTag('og:url', fullUrl, true)
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', fullImageUrl, true)
    updateMetaTag('og:site_name', 'Pure Peel Co.', true)
    updateMetaTag('og:locale', 'en_CA', true)

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:url', fullUrl)
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', fullImageUrl)

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', fullUrl)

  }, [title, description, image, url, type, keywords, noindex, fullUrl, fullImageUrl])

  return null // This component doesn't render anything
}

export default SEO

