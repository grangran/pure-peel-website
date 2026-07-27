/**
 * Chit Chats Shipping Integration
 *
 * Replaces canadaPostShipping.js
 *
 * Required env vars:
 *   CHITCHATS_ACCESS_TOKEN  — from Settings → Developer → API Access Tokens
 *   CHITCHATS_CLIENT_ID     — your numeric client ID (e.g. 566022)
 *
 * Optional env vars:
 *   CHITCHATS_USE_STAGING   — set to "true" to use staging.chitchats.com for testing
 *   SHIPPING_ORIGIN_POSTAL_CODE — your postal code (default: set below)
 *   SHIPPING_ORIGIN_PROVINCE    — your province code (default: ON)
 *   SHIPPING_ORIGIN_CITY        — your city (default: Toronto)
 *
 * API docs: https://chitchats.com/docs/api/v1
 */

import dotenv from 'dotenv'
dotenv.config()

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const CLIENT_ID    = process.env.CHITCHATS_CLIENT_ID
const ACCESS_TOKEN = process.env.CHITCHATS_ACCESS_TOKEN
const BASE_URL     = process.env.CHITCHATS_USE_STAGING === 'true'
  ? 'https://staging.chitchats.com/api/v1'
  : 'https://chitchats.com/api/v1'

// Your ship-from address
const ORIGIN = {
  name:       'Pure Peel Co.',
  address1:   process.env.SHIPPING_ORIGIN_ADDRESS  || '',
  city:       process.env.SHIPPING_ORIGIN_CITY     || 'Toronto',
  province:   process.env.SHIPPING_ORIGIN_PROVINCE || 'ON',
  postalCode: process.env.SHIPPING_ORIGIN_POSTAL_CODE || 'M5V 1A1',
  country:    'CA',
  phone:      process.env.SHIPPING_ORIGIN_PHONE    || '',
}

// HTS code for dehydrated citrus slices (used for US customs declarations)
const CITRUS_HTS_CODE = '0805500040'

// Package dimensions by box size (cm / kg — same values as canadaPostShipping.js)
const BOX_SIZES = {
  small: { length: 23, width: 15, height: 13, packagingWeight: 0.1, maxItems: 5 },
  large: { length: 27, width: 25, height: 15, packagingWeight: 0.2, maxItems: 999 },
}

const PRODUCT_WEIGHTS = {
  small:    0.075,
  medium:   0.14,
  large:    0.34,
  clearbox: 0.165,
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getHeaders() {
  return {
    'Authorization': ACCESS_TOKEN,
    'Content-Type':  'application/json; charset=utf-8',
    'Accept':        'application/json',
  }
}

function isConfigured() {
  return !!(CLIENT_ID && ACCESS_TOKEN)
}

/**
 * Calculate package weight from order items.
 * Mirrors the logic in canadaPostShipping.js so weights are consistent.
 */
function calculateWeight(items = []) {
  let productWeight = 0

  items.forEach(item => {
    const v = (item.variant || '').toLowerCase()
    let w = 0.1
    if (v.includes('small'))  w = PRODUCT_WEIGHTS.small
    else if (v.includes('medium')) w = PRODUCT_WEIGHTS.medium
    else if (v.includes('large'))  w = PRODUCT_WEIGHTS.large
    else if (v.includes('clear'))  w = PRODUCT_WEIGHTS.clearbox
    productWeight += w * (item.quantity || 1)
  })

  const itemsCount = items.reduce((s, i) => s + (i.quantity || 1), 0)
  const box = itemsCount <= BOX_SIZES.small.maxItems ? BOX_SIZES.small : BOX_SIZES.large

  return { weight: Math.max(productWeight + box.packagingWeight, 0.1), box }
}

/**
 * Normalize province/state to 2-letter code.
 */
function normalizeProvince(province = '') {
  const map = {
    'ontario': 'ON', 'quebec': 'QC', 'alberta': 'AB', 'british columbia': 'BC',
    'manitoba': 'MB', 'new brunswick': 'NB', 'newfoundland': 'NL',
    'newfoundland and labrador': 'NL', 'nova scotia': 'NS', 'nunavut': 'NU',
    'northwest territories': 'NT', 'prince edward island': 'PE', 'pei': 'PE',
    'saskatchewan': 'SK', 'yukon': 'YT',
    // US states (abbreviated already, just uppercase)
  }
  const lower = province.toLowerCase().trim()
  return map[lower] || province.toUpperCase().trim().substring(0, 2)
}

/**
 * Map country name to 2-letter ISO code (empty if unknown).
 */
function normalizeCountry(country = '') {
  const s = String(country || '').trim()
  if (!s) return ''
  const lower = s.toLowerCase()
  if (lower === 'united states' || lower === 'us' || lower === 'usa') return 'US'
  if (lower === 'canada' || lower === 'ca') return 'CA'
  if (lower.includes('united state')) return 'US'
  if (lower.includes('canada')) return 'CA'
  if (/^[a-z]{2}$/i.test(s)) return s.toUpperCase()
  return ''
}

/**
 * Guess CA vs US from postal/ZIP when country missing (Stripe occasionally omits country).
 */
function inferCountryFromPostal(postalRaw) {
  const compact = String(postalRaw || '').replace(/\s/g, '').toUpperCase()
  if (/^\d{5}(-?\d{4})?$/.test(compact)) return 'US'
  if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(compact)) return 'CA'
  return ''
}

function resolveDestinationCountry(addr) {
  let code = normalizeCountry(addr.country || addr.country_code || '')
  if (!code) code = inferCountryFromPostal(addr.postal_code || addr.postalCode || '')
  if (!code) {
    console.warn('⚠️ Chit Chats: no country on address; defaulting to CA. Check Stripe/metadata shipping fields.')
    code = 'CA'
  }
  return code
}

/**
 * Determine Chit Chats postage type based on destination country.
 *
 * Domestic Canada options:
 *   chit_chats_canada_tracked  — tracked parcel within Canada
 *
 * US options:
 *   chit_chats_us_tracked      — standard tracked to US via USPS
 *   chit_chats_us_edge         — cheapest US option (USPS First Class equivalent)
 *
 * Use 'unknown' + cheapest_postage_type_requested=yes to let Chit Chats
 * auto-select the cheapest available rate for US shipments.
 */
function getPostageType(countryCode) {
  if (countryCode === 'CA') return 'chit_chats_select'
  if (countryCode === 'US') return 'unknown' // paired with cheapest_postage_type_requested
  return 'chit_chats_international_tracked'
}

// ─────────────────────────────────────────────────────────────────────────────
// RATE ESTIMATION
// Returns flat estimated rates for checkout display.
// These are conservative estimates — actual postage is purchased at label time.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get estimated shipping rates for checkout.
 * Uses flat rates based on Chit Chats average pricing rather than live API
 * (live rate lookup requires creating a shipment first, which is wasteful at checkout).
 *
 * @param {{ postalCode: string, province: string, country: string }} destination
 * @param {Array} cartItems
 * @returns {{ options: Array }}
 */
export function getShippingRates(destination, cartItems = []) {
  const country = resolveDestinationCountry({
    country: destination.country,
    country_code: destination.country_code,
    postal_code: destination.postalCode || destination.postal_code,
    postalCode: destination.postalCode,
  })
  const { weight } = calculateWeight(cartItems)

  if (country === 'US') {
    // Chit Chats US rates via USPS — flat rate based on weight
    const base = weight <= 0.5 ? 9.00 : weight <= 1.0 ? 11.00 : 14.00
    return {
      options: [
        {
          id:            'chitchats-us-standard',
          name:          'Tracked (USPS)',
          price:         base,
          estimatedDays: 7,
          description:   'Fully tracked delivery to the US via USPS (5-10 business days)',
        },
      ],
    }
  }

  // Canadian domestic — Chit Chats Select only.
  // Select is available nationwide at $5-7 for our package size.
  // Cheaper AND faster than Canada Tracked so no reason to offer both.
  // Flat $6.99 covers real cost across all provinces with a small buffer for packaging.
  // Rates verified via Chit Chats estimator (Mar 2026):
  //   GTA $5.05, Ottawa $5.86, Sudbury $6.52, Calgary $5.45, Vancouver $6.35, Halifax $6.39
  return {
    options: [
      {
        id:            'chitchats-select',
        name:          'Tracked Shipping',
        price:         6.99,
        estimatedDays: 2,
        description:   'Fully tracked delivery within Canada (2 business days)',
      },
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE SHIPMENT + BUY POSTAGE
// Called after a successful order — replaces createCanadaPostLabel()
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a Chit Chats shipment and purchase postage.
 *
 * @param {object} order  — your internal order object (same shape as before)
 * @returns {{ success: boolean, trackingNumber?, labelUrl?, shipmentId?, error? }}
 */
export async function createChitChatsLabel(order) {
  if (!isConfigured()) {
    console.log('⚠️  Chit Chats not configured — set CHITCHATS_ACCESS_TOKEN and CHITCHATS_CLIENT_ID')
    return { success: false, error: 'Chit Chats not configured' }
  }

  try {
    const addr     = order.shipping?.address || {}
    let country    = resolveDestinationCountry(addr)
    if (!country || country.length !== 2) country = 'CA'
    const province = normalizeProvince(addr.state || addr.province || '')

    const { weight, box } = calculateWeight(order.items || [])

    const declaredValue = (() => {
      const t = parseFloat(order.total)
      if (!Number.isNaN(t) && t > 0) return t.toFixed(2)
      const items = order.items || []
      const sum = items.reduce((s, i) => s + (parseFloat(i.total) || (parseFloat(i.price) || 0) * (i.quantity || 1)), 0)
      return (sum > 0 ? sum : 1).toFixed(2)
    })()
    const valueCurrency = String(order.currency || 'CAD').toLowerCase() === 'usd' ? 'usd' : 'cad'

    // ── Step 1: Create the shipment ──────────────────────────────────────────
    const postageType = getPostageType(country)
    const isUS        = country === 'US'

    const shipmentPayload = {
    // Sender / return address (Chit Chats uses return_ prefix)
    return_name:          ORIGIN.name,
    return_address_1:     ORIGIN.address1,
    return_city:          ORIGIN.city,
    return_province_code: ORIGIN.province,
    return_postal_code:   ORIGIN.postalCode.replace(/\s/g, ''),
    return_phone:         ORIGIN.phone,

    // Recipient
    name:          order.shipping?.name || order.customer?.name || '',
    address_1:     addr.line1 || addr.address1 || '',
    address_2:     addr.line2 || addr.address2 || undefined,
    city:          addr.city  || '',
    province_code: province,
    postal_code:   (addr.postal_code || addr.postalCode || '').replace(/\s/g, ''),
    country_code:  country,
    phone:         order.customer?.phone || '',
    email:         order.customer?.email || '',

      // Package (package_type / value / value_currency are required by Chit Chats API)
      package_type:   'parcel',
      weight_unit:    'kg',
      weight:         weight.toFixed(3),
      size_unit:      'cm',
      size_x:         box.length,
      size_y:         box.width,
      size_z:         box.height,
      package_contents: 'merchandise',
      description:    'Dehydrated citrus slices',
      value:          declaredValue,
      value_currency: valueCurrency,

      // Postage
      postage_type:   postageType,
      ...(isUS && { cheapest_postage_type_requested: 'yes' }),

      // Reference — links back to your order
      reference:      order.id || '',

      // Customs for US shipments
      ...(isUS && {
        customs_signer:       order.shipping?.name || 'Pure Peel Co.',
        customs_certify:      true,
        customs_contents_type: 'merchandise',
        line_items: (order.items || []).map(item => ({
          description:    `Dehydrated ${item.name || 'citrus'} slices`,
          quantity:        item.quantity || 1,
          value:          ((item.price || 0) * (item.quantity || 1)).toFixed(2),
          weight:          '0.1',
          weight_unit:     'kg',
          hs_tariff_number: CITRUS_HTS_CODE,
          country_of_origin: 'CA',
        })),
      }),
    }

    console.log(`📦 Creating Chit Chats shipment for order ${order.id}...`)
    console.log(`   Destination: ${addr.city}, ${province} ${addr.postal_code || addr.postalCode} (${country})`)
    console.log(`   Weight: ${weight.toFixed(3)} kg | Box: ${box.length}×${box.width}×${box.height} cm`)
    console.log(`   Postage type: ${postageType}`)

    const createRes = await fetch(`${BASE_URL}/clients/${CLIENT_ID}/shipments`, {
      method:  'POST',
      headers: getHeaders(),
      body:    JSON.stringify(shipmentPayload),
    })

    if (!createRes.ok) {
      const errText = await createRes.text()
      console.error(`❌ Chit Chats create shipment error ${createRes.status}:`, errText)
      return { success: false, error: `Chit Chats API error ${createRes.status}: ${errText.substring(0, 200)}` }
    }

    const { shipment } = await createRes.json()
    const shipmentId = shipment.id

    console.log(`✅ Shipment created: ${shipmentId}`)
    console.log(`   Available rates:`, shipment.postage_rates?.map(r => `${r.postage_type}: $${r.rate}`).join(', ') || 'pending')

    // ── Step 2: Buy postage ──────────────────────────────────────────────────
    console.log(`💳 Purchasing postage for shipment ${shipmentId}...`)

    const buyRes = await fetch(`${BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}/buy_postage`, {
      method:  'PATCH',
      headers: getHeaders(),
      body:    JSON.stringify({}),
    })

    if (!buyRes.ok) {
      const errText = await buyRes.text()
      console.error(`❌ Chit Chats buy postage error ${buyRes.status}:`, errText)
      return { success: false, error: `Failed to purchase postage: ${errText.substring(0, 200)}`, shipmentId }
    }

    let updatedShipment = (await buyRes.json()).shipment

    // ── Step 3: Poll until ready (postage purchase can take a few seconds) ───
    if (updatedShipment.status === 'postage_requested') {
      console.log(`⏳ Postage purchase in progress, polling...`)
      let attempts = 0
      while (updatedShipment.status === 'postage_requested' && attempts < 10) {
        await new Promise(r => setTimeout(r, 2000)) // wait 2s
        const pollRes = await fetch(`${BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}`, {
          headers: getHeaders(),
        })
        if (pollRes.ok) {
          updatedShipment = (await pollRes.json()).shipment
        }
        attempts++
      }
    }

    if (updatedShipment.status === 'postage_purchase_failed') {
      console.error('❌ Chit Chats postage purchase failed')
      return { success: false, error: 'Postage purchase failed', shipmentId }
    }

    const trackingNumber = updatedShipment.tracking_code || updatedShipment.carrier_tracking_code
    const trackingUrl    = updatedShipment.tracking_url || `https://chitchats.com/tracking/${shipmentId.toLowerCase()}`
    const labelUrl       = updatedShipment.label_url || null
    const postageType_   = updatedShipment.postage_type || postageType
    const rate           = updatedShipment.postage_rate || null

    console.log(`✅ Postage purchased successfully!`)
    console.log(`   Tracking: ${trackingNumber}`)
    console.log(`   Service: ${postageType_}`)
    if (rate) console.log(`   Cost: $${rate}`)
    if (labelUrl) console.log(`   Label: ${labelUrl}`)

    return {
      success:        true,
      shipmentId,
      trackingNumber,
      trackingUrl,
      labelUrl,
      postageType:    postageType_,
      rate,
      carrier:        updatedShipment.carrier || 'chitchats',
    }

  } catch (err) {
    console.error('❌ Chit Chats error:', err.message)
    return { success: false, error: err.message }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET SHIPMENT STATUS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Look up a shipment by ID and return current status + tracking events.
 *
 * @param {string} shipmentId
 * @returns {{ success: boolean, shipment?, error? }}
 */
export async function getShipmentStatus(shipmentId) {
  if (!isConfigured()) return { success: false, error: 'Chit Chats not configured' }

  try {
    const res = await fetch(`${BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}`, {
      headers: getHeaders(),
    })

    if (!res.ok) {
      const errText = await res.text()
      return { success: false, error: `Chit Chats API error ${res.status}: ${errText.substring(0, 200)}` }
    }

    const { shipment } = await res.json()
    return {
      success: true,
      shipment: {
        id:              shipment.id,
        status:          shipment.status,
        trackingNumber:  shipment.tracking_code || shipment.carrier_tracking_code,
        trackingUrl:     shipment.tracking_url,
        labelUrl:        shipment.label_url,
        carrier:         shipment.carrier,
        estimatedDelivery: shipment.estimated_delivery_at,
        trackingEvents:  shipment.tracking_events || [],
      },
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VOID / REFUND SHIPMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Void a shipment that has already had postage purchased.
 * Chit Chats will refund the postage cost to your account balance.
 *
 * @param {string} shipmentId
 * @returns {{ success: boolean, error? }}
 */
export async function voidShipment(shipmentId) {
  if (!isConfigured()) return { success: false, error: 'Chit Chats not configured' }

  try {
    const res = await fetch(`${BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}/refund`, {
      method:  'PATCH',
      headers: getHeaders(),
      body:    JSON.stringify({}),
    })

    if (!res.ok) {
      const errText = await res.text()
      return { success: false, error: `Void error ${res.status}: ${errText.substring(0, 200)}` }
    }

    console.log(`✅ Shipment ${shipmentId} voided — postage refunded to Chit Chats balance`)
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}