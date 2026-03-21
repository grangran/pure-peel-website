/** Strip spaces and normalize Unicode dashes to ASCII for PP-… order IDs (paste from PDF/email). */
export function sanitizeOrderIdForLookup(raw) {
  if (typeof raw !== 'string') return ''
  return raw
    .trim()
    .replace(/\s+/g, '')
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
    .toUpperCase()
}

/**
 * Normalize email for order lookup: trim, lowercase, Gmail dot/plus rules.
 * Stripe may store user.name@gmail.com while the customer types username@gmail.com.
 */
export function normalizeEmailForLookup(email) {
  if (!email || typeof email !== 'string') return ''
  const trimmed = email.trim().toLowerCase()
  const at = trimmed.lastIndexOf('@')
  if (at <= 0) return trimmed
  let local = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1)
  const plus = local.indexOf('+')
  if (plus !== -1) local = local.slice(0, plus)
  const gmailDomains = ['gmail.com', 'googlemail.com']
  if (gmailDomains.includes(domain)) {
    local = local.replace(/\./g, '')
  }
  return `${local}@${domain}`
}
