/**
 * Canada Post Shipping API Integration
 * Creates shipping labels automatically when orders are placed
 */

/**
 * Create a Canada Post shipping label for an order
 * @param {Object} order - Order object with shipping information
 * @returns {Promise<Object>} - Object with trackingNumber, labelUrl, and shipmentId
 */
export async function createCanadaPostLabel(order) {
  const canadaPostUsername = process.env.CANADA_POST_USERNAME
  const canadaPostPassword = process.env.CANADA_POST_PASSWORD
  const canadaPostCustomerNumber = process.env.CANADA_POST_CUSTOMER_NUMBER || '0001238590'
  const canadaPostContractNumber = process.env.CANADA_POST_CONTRACT_NUMBER || canadaPostCustomerNumber // Use contract number if set, otherwise use customer number
  const useProduction = process.env.CANADA_POST_USE_PRODUCTION === 'true'

  // Check if credentials are configured
  if (!canadaPostUsername || !canadaPostPassword) {
    console.log('⚠️  Canada Post credentials not configured - skipping label creation')
    return { success: false, error: 'Canada Post credentials not configured' }
  }

  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'canadaPostShipping.js:23',message:'Label creation - credentials check',data:{usernameSet:!!canadaPostUsername,usernamePrefix:canadaPostUsername?.substring(0,4)||'NONE',passwordSet:!!canadaPostPassword,passwordLength:canadaPostPassword?.length||0,customerNumber:canadaPostCustomerNumber,useProduction,orderId:order.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Extract shipping information
    const shippingAddress = order.shipping?.address || {}
    const shippingName = order.shipping?.name || order.customer?.name || 'Customer'
    const country = shippingAddress.country || 'CA'
    const isUS = country === 'US' || country === 'United States'
    
    // Validate required address fields
    const addressLine1 = shippingAddress.line1 || shippingAddress.line_1 || shippingAddress.address_line_1 || ''
    if (!addressLine1 || addressLine1.trim() === '') {
      console.error('❌ Missing required shipping address line1 for order:', order.id)
      console.error('   Shipping address:', JSON.stringify(shippingAddress, null, 2))
      console.error('   Full order shipping:', JSON.stringify(order.shipping, null, 2))
      console.error('   Full order object keys:', Object.keys(order))
      console.error('   Order shipping keys:', order.shipping ? Object.keys(order.shipping) : 'shipping is null/undefined')
      
      // For free orders, Stripe might not collect shipping address
      // Return a more helpful error message
      return {
        success: false,
        error: 'Shipping address is missing. This may occur for free orders if Stripe did not collect the shipping address. Please create the label manually or ensure shipping_address_collection is enabled for all orders.'
      }
    }

    // Calculate package weight and dimensions from order items
    const weight = calculatePackageWeight(order.items || [])
    const dimensions = calculatePackageDimensions(order.items || [])

    // Determine shipping service based on selected method
    const shippingMethod = order.shipping?.method || 'Standard Shipping'
    const serviceCode = getServiceCode(shippingMethod, isUS)

    // Build XML for shipment creation
    const shipmentXml = buildShipmentXML({
      customerNumber: canadaPostCustomerNumber,
      contractNumber: canadaPostContractNumber,
      shippingName,
      shippingAddress,
      weight,
      dimensions,
      serviceCode,
      isUS,
      orderId: order.id
    })

    // Canada Post Shipping API endpoint
    // Format: /rs/{mailed by customer}/{mobo}/shipment
    // If not mailing on behalf of another customer, use customer number for both
    const mobo = process.env.CANADA_POST_MOBO || canadaPostCustomerNumber
    const apiUrl = useProduction
      ? `https://soa-gw.canadapost.ca/rs/${canadaPostCustomerNumber}/${mobo}/shipment`
      : `https://ct.soa-gw.canadapost.ca/rs/${canadaPostCustomerNumber}/${mobo}/shipment`

    const auth = Buffer.from(`${canadaPostUsername}:${canadaPostPassword}`).toString('base64')
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'canadaPostShipping.js:56',message:'Label creation - endpoint and auth',data:{apiUrl,useProduction,mobo,customerNumber:canadaPostCustomerNumber,authHeaderPrefix:auth.substring(0,10)||'NONE',authLength:auth.length,xmlLength:shipmentXml.length,xmlContainsCustomerNumber:shipmentXml.includes(canadaPostCustomerNumber)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    console.log('📦 Creating Canada Post shipping label for order:', order.id)

    // Create shipment with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'canadaPostShipping.js:67',message:'Label creation - before fetch',data:{apiUrl,method:'POST',hasAuthHeader:true,authHeaderPrefix:auth.substring(0,10)||'NONE',contentType:'application/vnd.cpc.shipment-v8+xml',xmlLength:shipmentXml.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/vnd.cpc.shipment-v8+xml',
          'Accept': 'application/vnd.cpc.shipment-v8+xml'
        },
        body: shipmentXml,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'canadaPostShipping.js:80',message:'Label creation - response received',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion

      if (!response.ok) {
        const errorText = await response.text()
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c1668a55-62c8-4506-a366-af5063785917',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'canadaPostShipping.js:84',message:'Label creation - error response',data:{status:response.status,errorText:errorText.substring(0,500),errorTextLength:errorText.length,is401:response.status===401,is403:response.status===403,usernamePrefix:canadaPostUsername?.substring(0,4)||'NONE',customerNumber:canadaPostCustomerNumber,apiUrl,mobo,useProduction},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        console.error('❌ Canada Post API error:', response.status, errorText)
        
        // Enhanced error logging for 403 errors
        if (response.status === 403) {
          console.error('🚫 Authorization failed (403). Possible causes:')
          console.error('   1. Customer number in URL does not match your account')
          console.error('      Current customer number:', canadaPostCustomerNumber)
          console.error('      Check your Canada Post developer portal for the correct customer number')
          console.error('   2. Account not activated for production API access')
          console.error('   3. Account does not have permission for shipment creation')
          console.error('   4. Wrong endpoint URL format')
          console.error('   5. Service code or options not enabled in your contract')
          console.error('   Full error:', errorText)
          console.error('   Contact Canada Post support: 1-866-511-0546')
          console.error('   Update CANADA_POST_CUSTOMER_NUMBER in Render with the correct value')
        }
        
        throw new Error(`Canada Post API error: ${response.status} - ${errorText.substring(0, 200)}`)
      }

      const xmlData = await response.text()
      const shipmentData = parseShipmentResponse(xmlData)

      if (shipmentData.trackingNumber) {
        console.log('✅ Canada Post label created successfully:', shipmentData.trackingNumber)
        return {
          success: true,
          trackingNumber: shipmentData.trackingNumber,
          labelUrl: shipmentData.labelUrl,
          shipmentId: shipmentData.shipmentId,
          pin: shipmentData.pin
        }
      } else {
        throw new Error('No tracking number in response')
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('Canada Post API request timed out')
      }
      throw fetchError
    }
  } catch (error) {
    console.error('❌ Error creating Canada Post label:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Calculate package weight from order items
 */
function calculatePackageWeight(items) {
  const weightPerItem = {
    'mini': 0.05,
    'small': 0.1,
    'medium': 0.2,
    'large': 0.35,
    'clearbox': 0.2
  }

  let totalWeight = 0
  items.forEach(item => {
    const variantLower = (item.variant || '').toLowerCase()
    let itemWeight = 0.1 // Default weight
    if (variantLower.includes('mini')) itemWeight = weightPerItem.mini
    else if (variantLower.includes('small')) itemWeight = weightPerItem.small
    else if (variantLower.includes('medium')) itemWeight = weightPerItem.medium
    else if (variantLower.includes('large')) itemWeight = weightPerItem.large
    else if (variantLower.includes('clear')) itemWeight = weightPerItem.clearbox

    totalWeight += itemWeight * (item.quantity || 1)
  })

  return Math.max(totalWeight, 0.1) // Minimum 0.1 kg
}

/**
 * Calculate package dimensions from order items
 */
function calculatePackageDimensions(items) {
  const itemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0)

  if (itemsCount <= 3) {
    return { length: 20, width: 15, height: 5 }
  } else if (itemsCount <= 8) {
    return { length: 25, width: 20, height: 8 }
  } else {
    return { length: 30, width: 25, height: 10 }
  }
}

/**
 * Get Canada Post service code based on shipping method
 */
function getServiceCode(shippingMethod, isUS = false) {
  if (isUS) {
    if (shippingMethod.includes('Tracked Packet')) return 'USA.TP'
    if (shippingMethod.includes('Xpresspost')) return 'USA.EP'
    if (shippingMethod.includes('Priority')) return 'USA.PW'
    return 'USA.TP' // Default to Tracked Packet
  } else {
    if (shippingMethod.includes('Regular') || shippingMethod.includes('Standard')) return 'DOM.RP'
    if (shippingMethod.includes('Expedited')) return 'DOM.EP'
    if (shippingMethod.includes('Xpresspost')) return 'DOM.XP'
    return 'DOM.RP' // Default to Regular Parcel
  }
}

/**
 * Build XML for Canada Post shipment creation
 */
function buildShipmentXML({ customerNumber, shippingName, shippingAddress, weight, dimensions, serviceCode, isUS, orderId }) {
  // Use environment variables or defaults - you can use generic values if preferred
  const originPostalCode = (process.env.SHIPPING_ORIGIN_POSTAL_CODE || 'M5H 2N2').replace(/\s+/g, '')
  const originCity = process.env.SHIPPING_ORIGIN_CITY || 'Toronto'
  const originProvince = process.env.SHIPPING_ORIGIN_PROVINCE || 'ON'

  // Parse shipping name
  const nameParts = shippingName.split(' ')
  const firstName = nameParts[0] || 'Customer'
  const lastName = nameParts.slice(1).join(' ') || 'Name'

  // Format destination address
  // Handle different field name variations from Stripe
  const addressLine1 = shippingAddress.line1 || shippingAddress.line_1 || shippingAddress.address_line_1 || ''
  const addressLine2 = shippingAddress.line2 || shippingAddress.line_2 || shippingAddress.address_line_2 || ''
  const destPostalCode = (shippingAddress.postal_code || shippingAddress.postalCode || '').replace(/\s+/g, '').replace(/-/g, '')
  const destCity = shippingAddress.city || ''
  const destProvince = shippingAddress.province || shippingAddress.state || ''
  const destCountry = isUS ? 'US' : 'CA'
  
  // Validate required fields
  if (!addressLine1 || addressLine1.trim() === '') {
    throw new Error('address-line-1 is required but missing')
  }
  if (!destCity || destCity.trim() === '') {
    throw new Error('city is required but missing')
  }
  if (!destProvince || destProvince.trim() === '') {
    throw new Error('province/state is required but missing')
  }
  if (!destPostalCode || destPostalCode.trim() === '') {
    throw new Error('postal code is required but missing')
  }

  // Build destination XML based on country
  // Note: destination must use address-details wrapper, similar to sender
  let destinationXml
  if (isUS) {
    destinationXml = `<destination>
      <name>${escapeXml(firstName)} ${escapeXml(lastName)}</name>
      <address-details>
        <address-line-1>${escapeXml(addressLine1)}</address-line-1>
        ${addressLine2 ? `<address-line-2>${escapeXml(addressLine2)}</address-line-2>` : ''}
        <city>${escapeXml(destCity)}</city>
        <prov-state>${escapeXml(destProvince)}</prov-state>
        <postal-zip-code>${destPostalCode.substring(0, 5)}</postal-zip-code>
        <country-code>US</country-code>
      </address-details>
    </destination>`
  } else {
    // Canadian destination - country-code is required
    destinationXml = `<destination>
      <name>${escapeXml(firstName)} ${escapeXml(lastName)}</name>
      <address-details>
        <address-line-1>${escapeXml(addressLine1)}</address-line-1>
        ${addressLine2 ? `<address-line-2>${escapeXml(addressLine2)}</address-line-2>` : ''}
        <city>${escapeXml(destCity)}</city>
        <prov-state>${escapeXml(destProvince)}</prov-state>
        <postal-zip-code>${destPostalCode}</postal-zip-code>
        <country-code>CA</country-code>
      </address-details>
    </destination>`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<shipment xmlns="http://www.canadapost.ca/ws/shipment-v8">
  <group-id>${orderId}</group-id>
  <requested-shipping-point>${originPostalCode}</requested-shipping-point>
  <delivery-spec>
    <service-code>${serviceCode}</service-code>
    <sender>
      <name>Pure Peel Co.</name>
      <company>Pure Peel Co.</company>
      <contact-phone>${process.env.SHIPPING_ORIGIN_PHONE || '1-800-000-0000'}</contact-phone>
      <address-details>
        <address-line-1>${process.env.SHIPPING_ORIGIN_ADDRESS_LINE1 || '123 Main St'}</address-line-1>
        <city>${originCity}</city>
        <prov-state>${originProvince}</prov-state>
        <postal-zip-code>${originPostalCode}</postal-zip-code>
        <country-code>CA</country-code>
      </address-details>
    </sender>
    ${destinationXml}
    <options>
      <option>
        <option-code>SO</option-code>
      </option>
    </options>
    <parcel-characteristics>
      <weight>${weight.toFixed(3)}</weight>
      <dimensions>
        <length>${dimensions.length}</length>
        <width>${dimensions.width}</width>
        <height>${dimensions.height}</height>
      </dimensions>
    </parcel-characteristics>
    <notification>
      <email>${process.env.ADMIN_EMAIL || 'orders@purepeelco.com'}</email>
      <on-shipment>true</on-shipment>
      <on-exception>true</on-exception>
      <on-delivery>true</on-delivery>
    </notification>
    <print-preferences>
      <output-format>8.5x11</output-format>
      <encoding>PDF</encoding>
    </print-preferences>
    <preferences>
      <show-packing-instructions>true</show-packing-instructions>
      <show-postage-rate>true</show-postage-rate>
      <show-insured-value>true</show-insured-value>
    </preferences>
    <settlement-info>
      <paid-by-customer>${customerNumber}</paid-by-customer>
      ${contractNumber ? `<contract-id>${contractNumber}</contract-id>` : ''}
      <intended-method-of-payment>Account</intended-method-of-payment>
    </settlement-info>
  </delivery-spec>
</shipment>`
}

/**
 * Parse Canada Post shipment response XML
 */
function parseShipmentResponse(xml) {
  try {
    // Extract tracking number
    const trackingMatch = xml.match(/<tracking-pin>([^<]+)<\/tracking-pin>/i)
    const trackingNumber = trackingMatch ? trackingMatch[1] : null

    // Extract shipment ID
    const shipmentIdMatch = xml.match(/<shipment-id>([^<]+)<\/shipment-id>/i)
    const shipmentId = shipmentIdMatch ? shipmentIdMatch[1] : null

    // Extract label URL
    const labelUrlMatch = xml.match(/<link[^>]*rel="label"[^>]*href="([^"]+)"/i)
    const labelUrl = labelUrlMatch ? labelUrlMatch[1] : null

    // Extract PIN
    const pinMatch = xml.match(/<pin>([^<]+)<\/pin>/i)
    const pin = pinMatch ? pinMatch[1] : null

    return {
      trackingNumber,
      shipmentId,
      labelUrl,
      pin
    }
  } catch (error) {
    console.error('Error parsing shipment response:', error)
    return {}
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(text) {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

