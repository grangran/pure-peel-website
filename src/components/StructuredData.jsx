import { useEffect } from 'react'

const StructuredData = ({ data }) => {
  useEffect(() => {
    // Create script tag for JSON-LD
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    script.id = `structured-data-${Date.now()}`
    
    // Remove any existing structured data scripts with the same type
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]')
    existingScripts.forEach(s => {
      // Only remove if it's a product schema (to avoid removing organization schema)
      try {
        const existingData = JSON.parse(s.text)
        if (existingData['@type'] === data['@type']) {
          s.remove()
        }
      } catch (e) {
        // If parsing fails, keep the script
      }
    })
    
    document.head.appendChild(script)
    
    return () => {
      // Cleanup: remove script when component unmounts
      const scriptToRemove = document.getElementById(script.id)
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [data])

  return null
}

export default StructuredData

