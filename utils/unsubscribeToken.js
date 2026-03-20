import crypto from 'crypto'

function secret() {
  return process.env.UNSUBSCRIBE_SECRET || process.env.RESEND_API_KEY || ''
}

/**
 * Signed token for one-click unsubscribe (RFC 8058 URL in List-Unsubscribe).
 * @param {string} email
 * @returns {string}
 */
export function createUnsubscribeToken(email) {
  const normalized = (email || '').toLowerCase().trim()
  if (!normalized) throw new Error('Invalid email for token')
  const s = secret()
  if (!s) throw new Error('UNSUBSCRIBE_SECRET or RESEND_API_KEY required for unsubscribe tokens')
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 // 1 year
  const payload = `${normalized}|${exp}`
  const sig = crypto.createHmac('sha256', s).update(payload).digest('hex')
  return Buffer.from(`${payload}|${sig}`, 'utf8').toString('base64url')
}

/**
 * @param {string} token
 * @returns {string|null} normalized email or null if invalid/expired
 */
export function verifyUnsubscribeToken(token) {
  if (!token || typeof token !== 'string') return null
  const s = secret()
  if (!s) return null
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8')
    const lastPipe = raw.lastIndexOf('|')
    if (lastPipe === -1) return null
    const sig = raw.slice(lastPipe + 1)
    const rest = raw.slice(0, lastPipe)
    const secondPipe = rest.lastIndexOf('|')
    if (secondPipe === -1) return null
    const email = rest.slice(0, secondPipe)
    const expStr = rest.slice(secondPipe + 1)
    const exp = parseInt(expStr, 10)
    if (!email || Number.isNaN(exp)) return null
    if (exp < Math.floor(Date.now() / 1000)) return null
    const payload = `${email}|${exp}`
    const expected = crypto.createHmac('sha256', s).update(payload).digest('hex')
    let sigBuf
    let expBuf
    try {
      sigBuf = Buffer.from(sig, 'hex')
      expBuf = Buffer.from(expected, 'hex')
    } catch {
      return null
    }
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null
    }
    return email.toLowerCase().trim()
  } catch {
    return null
  }
}
