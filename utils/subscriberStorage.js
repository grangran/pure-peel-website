/**
 * Subscriber storage backed by Resend Audiences (Render free tier safe).
 *
 * Requires:
 * - RESEND_API_KEY
 * - RESEND_AUDIENCE_ID
 *
 * Notes:
 * - Uses the Audiences API (stable today, but Resend may migrate toward Contacts/Segments).
 * - We store `language` and `source` in contact fields so Admin can display them.
 */

const RESEND_API_BASE = 'https://api.resend.com'

function getAuthHeaders() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not configured')
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}

function getAudienceId() {
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!audienceId) throw new Error('RESEND_AUDIENCE_ID not configured')
  return audienceId
}

function normalizeEmail(email) {
  return (email || '').toLowerCase().trim()
}

async function resendJson(url, options = {}) {
  const res = await fetch(url, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      data?.message ||
      data?.error?.message ||
      data?.error ||
      `Resend request failed (${res.status})`
    const err = new Error(message)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

/**
 * Check if email is already subscribed in Resend Audience.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function hasSubscriber(email) {
  const normalized = normalizeEmail(email)
  if (!normalized) return false

  const audienceId = getAudienceId()
  try {
    // GET contact by email (Audiences API)
    await resendJson(
      `${RESEND_API_BASE}/audiences/${audienceId}/contacts/${encodeURIComponent(normalized)}`,
      { method: 'GET', headers: getAuthHeaders() }
    )
    return true
  } catch (err) {
    if (err?.status === 404) return false
    throw err
  }
}

/**
 * Add a subscriber to Resend Audience (idempotent).
 * @param {string} email
 * @param {{ language?: string, source?: string }} meta
 * @returns {Promise<{ added: boolean, subscriber: object }>}
 */
export async function addSubscriber(email, meta = {}) {
  const normalized = normalizeEmail(email)
  if (!normalized) return { added: false, subscriber: null }

  const audienceId = getAudienceId()
  const language = meta.language === 'fr' ? 'fr' : 'en'
  const source = meta.source === 'popup' ? 'popup' : 'inline'

  try {
    const created = await resendJson(`${RESEND_API_BASE}/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        email: normalized,
        first_name: '',
        last_name: '',
        unsubscribed: false,
        // Keep these for Admin display; safe to ignore if Resend changes shape.
        // (Resend currently supports arbitrary fields on contacts in audiences.)
        // If Resend rejects these, the error will surface in logs.
        language,
        source,
      }),
    })
    return { added: true, subscriber: created?.data || created }
  } catch (err) {
    // If contact already exists, treat as not added
    if (err?.status === 409) {
      return { added: false, subscriber: { email: normalized, language, source } }
    }
    throw err
  }
}

/**
 * List subscribers from Resend Audience.
 * @returns {Promise<Array<{ email: string, language?: string, source?: string, subscribedAt?: string }>>}
 */
export async function getSubscribers() {
  const audienceId = getAudienceId()
  const data = await resendJson(`${RESEND_API_BASE}/audiences/${audienceId}/contacts`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const list = Array.isArray(data?.data) ? data.data : []
  return list.map((c) => ({
    email: c.email,
    language: c.language,
    source: c.source,
    subscribedAt: c.created_at || c.createdAt,
  }))
}
